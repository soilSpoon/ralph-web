# ECL Pipeline (Extract → Cognify → Load)

## 개요

ECL Pipeline은 원시 데이터를 구조화된 메모리로 변환하는 3단계 파이프라인입니다.

```
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│    EXTRACT    │ →  │    COGNIFY    │ →  │     LOAD      │
│  (수집/추출)  │    │  (인지/변환)  │    │  (저장/인덱싱) │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 1. Extract (수집)

### 데이터 소스

| 소스              | 수집 내용                    | 트리거         |
| ----------------- | ---------------------------- | -------------- |
| **세션 로그**     | 에이전트-사용자 상호작용     | 세션 종료      |
| **Git 커밋**      | 커밋 메시지, 변경 파일, diff | 커밋 후        |
| **터미널 스냅샷** | 명령어 출력, 환경 상태       | 실패/이상 감지 |
| **테스트 결과**   | 성공/실패, 커버리지          | CI 완료        |
| **파일 변경**     | 생성/수정/삭제               | 파일 저장      |

### Extract Interface

```typescript
interface ExtractPipeline {
  // 세션 로그 수집
  collectLogs(sessionId: string): Promise<RawLog[]>;

  // Git 커밋 수집
  collectCommits(since: Date): Promise<Commit[]>;

  // 터미널 스냅샷 수집
  collectTerminalSnapshots(taskId: string): Promise<TerminalSnapshot[]>;

  // 테스트 결과 수집
  collectTestResults(runId: string): Promise<TestResult[]>;

  // 파일 변경 수집
  collectFileChanges(commitHash: string): Promise<FileChange[]>;
}

// Raw Types
interface RawLog {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface Commit {
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
  files: FileChange[];
  diff: string;
}

interface TerminalSnapshot {
  id: string;
  taskId: string;
  buffer: string;
  cwd: string;
  env: Record<string, string>;
  exitCode?: number;
  timestamp: Date;
}
```

---

## 2. Cognify (인지/변환)

### 변환 단계

1. **Atomic Fact 생성**: 원시 로그를 자기완결적 사실로 분해
2. **Skill 추출**: 반복 패턴을 구조화된 지식으로 응집
3. **Pattern 추출**: 성공 사례를 재사용 가능한 패턴으로 정리
4. **Gotcha 추출**: 실패/문제를 해결책과 함께 기록
5. **Code Graph 생성**: 코드 구조를 그래프로 인덱싱

### Cognify Interface

```typescript
interface CognifyPipeline {
  // Atomic Fact 생성 (SimpleMem 스타일)
  toAtomicFacts(logs: RawLog[], commits: Commit[]): Promise<AtomicFact[]>;

  // Skill 추출 (memU 스타일)
  extractSkills(facts: AtomicFact[]): Promise<Skill[]>;

  // Pattern 추출 (Auto-Claude 스타일)
  extractPatterns(facts: AtomicFact[]): Promise<Pattern[]>;

  // Gotcha 추출
  extractGotchas(
    logs: RawLog[],
    snapshots: TerminalSnapshot[],
  ): Promise<Gotcha[]>;

  // Code Graph 생성 (cognee 스타일)
  buildCodeGraph(files: string[]): Promise<CodeGraph>;
}

interface AtomicFact {
  id: string;
  content: string; // 자기완결적 문장
  entities: string[]; // 추출된 엔티티
  persons: string[]; // 언급된 인물
  timestamp: Date; // 절대 시간
  commit_hash?: string; // 관련 커밋
  file_paths?: string[]; // 관련 파일
  source_log_id: string; // 원본 로그 참조
}
```

### Atomic Fact 생성 규칙

SimpleMem에서 가져온 정규화 규칙:

```typescript
const ATOMIC_FACT_RULES = {
  // 1. 대명사 해소 (Coreference Resolution)
  resolveCoreferences: "He/She/It → 실제 이름",

  // 2. 시간 앵커링 (Temporal Anchoring)
  anchorTime: "yesterday → 2026-01-22T14:00:00",

  // 3. 자기완결성 (Independence)
  makeIndependent: "단독으로 이해 가능한 문장으로 변환",

  // 4. 커밋 연결 (Commit Linking)
  linkCommit: "관련 커밋 해시 연결",

  // 5. 엔티티 추출 (Entity Extraction)
  extractEntities: "파일명, 함수명, 변수명 등 추출",
};

// Example transformation
const rawLog = "I fixed the bug in the auth module yesterday";
const atomicFact = {
  content: "Agent fixed authentication bug in auth.service.ts on 2026-01-21",
  entities: ["auth.service.ts", "authentication bug"],
  timestamp: new Date("2026-01-21"),
  commit_hash: "abc1234",
  file_paths: ["src/auth/auth.service.ts"],
};
```

### Skill 추출 (memU 스타일)

```typescript
interface Skill {
  id: string;
  topic: string; // 주제
  context: string; // 적용 맥락
  core_principles: string[]; // 핵심 원칙
  pitfalls: string[]; // 함정/주의사항
  implementation_guide: string; // 구현 가이드
  source_observation_ids: string[]; // 원본 관찰 참조
}

async function extractSkills(facts: AtomicFact[]): Promise<Skill[]> {
  // 1. Topic clustering
  const clusters = await clusterByTopic(facts);

  // 2. Skill card generation per cluster
  const skills: Skill[] = [];
  for (const cluster of clusters) {
    if (cluster.size >= 3) {
      // 최소 3개 이상의 사실이 있을 때만
      const skill = await generateSkillCard(cluster.facts);
      skills.push(skill);
    }
  }

  return skills;
}
```

### Pattern & Gotcha 추출

```typescript
interface Pattern {
  id: string;
  title: string;
  description: string;
  context: string; // 언제 적용하는지
  example_code?: string; // 코드 예시
  success_criteria: string[]; // 성공 기준
  source_commit_hashes: string[]; // 성공 사례 커밋
}

interface Gotcha {
  id: string;
  title: string;
  description: string; // 문제 설명
  trigger_conditions: string[]; // 발생 조건
  resolution: string; // 해결 방법
  affected_files: string[];
  terminal_snapshot_id?: string; // 관련 스냅샷
}

// Pattern 추출: 성공 커밋에서
async function extractPatterns(
  commits: Commit[],
  testResults: TestResult[],
): Promise<Pattern[]> {
  const successfulCommits = commits.filter((c) =>
    testResults.some((t) => t.commitHash === c.hash && t.passed),
  );

  // Group by similar changes
  const groups = await groupByChangePattern(successfulCommits);

  return groups
    .filter((g) => g.occurrences >= 2) // 2회 이상 반복
    .map((g) => generatePattern(g));
}

// Gotcha 추출: 실패에서
async function extractGotchas(
  logs: RawLog[],
  snapshots: TerminalSnapshot[],
): Promise<Gotcha[]> {
  const failures = snapshots.filter((s) => s.exitCode !== 0);

  return Promise.all(
    failures.map(async (failure) => {
      const relatedLogs = findRelatedLogs(logs, failure);
      const resolution = await findResolution(relatedLogs, failure);

      return {
        title: extractErrorTitle(failure),
        description: extractErrorDescription(failure),
        trigger_conditions: extractTriggerConditions(failure),
        resolution: resolution ?? "Resolution not found",
        affected_files: extractAffectedFiles(failure),
        terminal_snapshot_id: failure.id,
      };
    }),
  );
}
```

---

## 3. Load (저장/인덱싱)

### Load Interface

```typescript
interface LoadPipeline {
  // 벡터 임베딩 생성
  generateEmbeddings(texts: string[]): Promise<number[][]>;

  // 관찰(Observation) 저장
  saveObservations(facts: AtomicFact[]): Promise<string[]>;

  // Skill 저장
  saveSkills(skills: Skill[]): Promise<string[]>;

  // Pattern 저장
  savePatterns(patterns: Pattern[]): Promise<string[]>;

  // Gotcha 저장
  saveGotchas(gotchas: Gotcha[]): Promise<string[]>;

  // Code Graph 저장
  saveCodeGraph(graph: CodeGraph): Promise<void>;

  // 인덱스 업데이트
  updateIndexes(): Promise<void>;
}
```

### Embedding Generation

```typescript
interface EmbeddingConfig {
  model: "openai/text-embedding-3-small" | "voyage-3" | "cohere-embed-v3";
  dimension: number; // 1024 recommended
  batchSize: number; // 100 for most APIs
}

async function generateEmbeddings(
  texts: string[],
  config: EmbeddingConfig,
): Promise<number[][]> {
  const batches = chunk(texts, config.batchSize);
  const embeddings: number[][] = [];

  for (const batch of batches) {
    const result = await embed(batch, config.model);
    embeddings.push(...result);
  }

  return embeddings;
}
```

### Bulk Save with Deduplication

```typescript
async function saveObservations(facts: AtomicFact[]): Promise<string[]> {
  const ids: string[] = [];

  for (const fact of facts) {
    // 1. Generate embedding
    const [embedding] = await generateEmbeddings([fact.content]);

    // 2. Check for duplicates
    const duplicates = await findDuplicates(embedding, 0.95);
    if (duplicates.length > 0) {
      // Skip or merge
      ids.push(duplicates[0].id);
      continue;
    }

    // 3. Save observation
    const observation = {
      content: fact.content,
      embedding,
      entities: fact.entities,
      persons: fact.persons,
      timestamp: fact.timestamp,
      commit_hash: fact.commit_hash,
      file_paths: fact.file_paths,
      scope: "task",
    };

    const id = await db
      .insert(observations)
      .values(observation)
      .returning("id");
    ids.push(id);

    // 4. Append event
    await appendEvent({
      event_type: "OBSERVED",
      payload: observation,
    });
  }

  return ids;
}
```

---

## Pipeline Orchestration

### Full Pipeline Run

```typescript
interface PipelineConfig {
  sessionId?: string;
  taskId?: string;
  since?: Date;
  commitHashes?: string[];
}

async function runPipeline(config: PipelineConfig): Promise<PipelineResult> {
  const result: PipelineResult = {
    observations: 0,
    skills: 0,
    patterns: 0,
    gotchas: 0,
    duration: 0,
  };

  const start = Date.now();

  // 1. EXTRACT
  const logs = config.sessionId
    ? await extractPipeline.collectLogs(config.sessionId)
    : [];
  const commits = await extractPipeline.collectCommits(
    config.since ?? lastRunDate,
  );
  const snapshots = config.taskId
    ? await extractPipeline.collectTerminalSnapshots(config.taskId)
    : [];

  // 2. COGNIFY
  const facts = await cognifyPipeline.toAtomicFacts(logs, commits);
  const skills = await cognifyPipeline.extractSkills(facts);
  const patterns = await cognifyPipeline.extractPatterns(facts);
  const gotchas = await cognifyPipeline.extractGotchas(logs, snapshots);

  // 3. LOAD
  const obsIds = await loadPipeline.saveObservations(facts);
  const skillIds = await loadPipeline.saveSkills(skills);
  const patternIds = await loadPipeline.savePatterns(patterns);
  const gotchaIds = await loadPipeline.saveGotchas(gotchas);

  await loadPipeline.updateIndexes();

  result.observations = obsIds.length;
  result.skills = skillIds.length;
  result.patterns = patternIds.length;
  result.gotchas = gotchaIds.length;
  result.duration = Date.now() - start;

  return result;
}
```

### Trigger Points

파이프라인이 실행되는 시점:

| 트리거          | 범위          | 실행 내용         |
| --------------- | ------------- | ----------------- |
| **세션 종료**   | 세션 로그     | facts, skills     |
| **커밋 후**     | 커밋 + 테스트 | patterns, gotchas |
| **테스트 실패** | 터미널 스냅샷 | gotchas           |
| **작업 완료**   | 전체 작업     | 모든 타입 + 승격  |
| **일일 배치**   | 누적 데이터   | 정리 + 재인덱싱   |

---

## 4. Memify (메모리 알고리즘)

> **참조**: cognee의 `memify()` 단계

Load 후 저장된 데이터에 메모리 알고리즘을 적용하는 단계입니다.

```
Extract → Cognify → Load → Memify (NEW!)
```

### Memify Interface

```typescript
interface MemifyPipeline {
  // 중요도 점수 계산
  calculateImportanceScores(entryIds: string[]): Promise<void>;

  // 감쇠 함수 적용
  applyDecayFunctions(cutoffDate: Date): Promise<DecayResult>;

  // 연관 강화
  strengthenAssociations(usageLog: UsageLog[]): Promise<void>;

  // 클러스터 재조직 (Self-Evolving)
  reorganizeClusters(): Promise<ClusterResult>;
}

interface ImportanceScore {
  entryId: string;
  score: number; // 0.0 ~ 1.0
  factors: {
    recency: number; // 최근성 (0.3)
    frequency: number; // 사용 빈도 (0.25)
    citationCount: number; // 인용 횟수 (0.25)
    userFeedback: number; // 사용자 피드백 (0.2)
  };
}
```

### 중요도 점수 계산

```typescript
async function calculateImportanceScores(entryIds: string[]): Promise<void> {
  for (const id of entryIds) {
    const entry = await getEntry(id);

    // 가중치 기반 점수 계산
    const score =
      0.3 * recencyScore(entry.createdAt) +
      0.25 * frequencyScore(entry.accessCount) +
      0.25 * citationScore(entry.citationCount) +
      0.2 * feedbackScore(entry.userRating);

    await updateImportanceScore(id, score);
  }
}

function recencyScore(createdAt: Date): number {
  const daysSinceCreation = daysSince(createdAt);
  // 30일 이내: 0.8~1.0, 90일 이내: 0.5~0.8, 그 이후: 0.0~0.5
  return Math.max(0, 1 - daysSinceCreation / 180);
}
```

### 감쇠 함수 (Decay Functions)

```typescript
interface DecayPolicy {
  type: "linear" | "exponential" | "step";
  halfLife: number; // days
  minScore: number; // 최소 점수 (이하면 제거 후보)
}

const DECAY_POLICIES: Record<EntryKind, DecayPolicy> = {
  episodic: { type: "exponential", halfLife: 30, minScore: 0.1 },
  knowledge: { type: "linear", halfLife: 180, minScore: 0.3 },
  state: { type: "step", halfLife: 14, minScore: 0.2 },
};

async function applyDecayFunctions(cutoffDate: Date): Promise<DecayResult> {
  const result: DecayResult = { decayed: 0, archived: 0 };

  for (const [kind, policy] of Object.entries(DECAY_POLICIES)) {
    const entries = await getEntriesByKindOlderThan(kind, cutoffDate);

    for (const entry of entries) {
      const decayedScore = applyDecay(
        entry.importanceScore,
        policy,
        entry.createdAt,
      );

      if (decayedScore < policy.minScore) {
        await archiveEntry(entry.id);
        result.archived++;
      } else {
        await updateImportanceScore(entry.id, decayedScore);
        result.decayed++;
      }
    }
  }

  return result;
}
```

### 연관 강화 (Association Strengthening)

```typescript
interface UsageLog {
  queryId: string;
  retrievedEntryIds: string[];
  selectedEntryId?: string; // 사용자가 실제 선택한 것
  timestamp: Date;
}

async function strengthenAssociations(usageLogs: UsageLog[]): Promise<void> {
  for (const log of usageLogs) {
    // 함께 검색된 항목들 간의 연관도 증가
    for (let i = 0; i < log.retrievedEntryIds.length; i++) {
      for (let j = i + 1; j < log.retrievedEntryIds.length; j++) {
        await increaseAssociation(
          log.retrievedEntryIds[i],
          log.retrievedEntryIds[j],
          0.01, // 공동 검색당 +0.01
        );
      }
    }

    // 실제 선택된 항목은 추가 보너스
    if (log.selectedEntryId) {
      await boostImportance(log.selectedEntryId, 0.05);
    }
  }
}
```

### Self-Evolving Memory (카테고리 재조직)

> **참조**: memU

```typescript
interface ClusterResult {
  created: string[];       // 새로 생성된 카테고리
  merged: string[][];      // 병합된 카테고리 쌍
  unchanged: number;
}

async function reorganizeClusters(): Promise<ClusterResult> {
  const result: ClusterResult = { created: [], merged: [], unchanged: 0 };

  // 1. 모든 항목 임베딩 가져오기
  const entries = await getAllEntriesWithEmbeddings();

  // 2. 클러스터링 수행
  const clusters = await kMeansClustering(entries, {
    minClusterSize: 5,
    maxClusters: 20,
  });

  // 3. 기존 카테고리와 비교
  for (const cluster of clusters) {
    const existingCategory = await findMatchingCategory(cluster.centroid);

    if (!existingCategory && cluster.size >= 5) {
      // 새 카테고리 생성
      const name = await generateCategoryName(cluster.entries);
      await createCategory(name, cluster.entryIds);
      result.created.push(name);
    } else if (existingCategory) {
      result.unchanged++;
    }
  }

  // 4. 너무 작은 카테고리 병합
  const smallCategories = await getCategoriesWithSize(lessThan: 3);
  for (const small of smallCategories) {
    const nearest = await findNearestCategory(small);
    if (nearest) {
      await mergeCategories(small, nearest);
      result.merged.push([small.name, nearest.name]);
    }
  }

  return result;
}
```

---

## 5. TerminalSnapshotService (상세)

> **참조**: emdash

터미널 스냅샷 캡처를 위한 전용 서비스입니다.

### Service Interface

```typescript
class TerminalSnapshotService {
  // 실패 감지 시 자동 캡처
  async captureOnFailure(context: FailureContext): Promise<string>;

  // 이상 패턴 감지 시 캡처
  async detectAndCapture(output: string): Promise<string | null>;

  // 수동 캡처
  async manualCapture(taskId: string): Promise<string>;

  // 민감정보 필터링
  sanitize(buffer: string): string;

  // 용량 관리
  prune(config: PruneConfig): Promise<PruneResult>;
}

interface FailureContext {
  exitCode: number;
  buffer: string;
  cwd: string;
  env: Record<string, string>;
  command?: string;
}
```

### 자동 캡처 로직

```typescript
async function captureOnFailure(context: FailureContext): Promise<string> {
  // 1. 민감정보 필터링
  const sanitizedBuffer = this.sanitize(context.buffer);
  const filteredEnv = this.filterEnv(context.env);

  // 2. 스냅샷 생성
  const snapshot: TerminalSnapshot = {
    id: generateId(),
    taskId: await getCurrentTaskId(),
    buffer: sanitizedBuffer,
    cwd: context.cwd,
    env: filteredEnv,
    exitCode: context.exitCode,
    command: context.command,
    timestamp: new Date(),
    trigger: "failure",
  };

  // 3. 저장
  await this.save(snapshot);

  return snapshot.id;
}

// 민감정보 필터링 패턴
const SENSITIVE_PATTERNS = [
  /API_KEY\s*=\s*['"]?[\w-]+['"]?/gi,
  /PASSWORD\s*=\s*['"]?[^'"]+['"]?/gi,
  /SECRET\s*=\s*['"]?[\w-]+['"]?/gi,
  /TOKEN\s*=\s*['"]?[\w.-]+['"]?/gi,
  /Bearer\s+[\w.-]+/gi,
];

function sanitize(buffer: string): string {
  let result = buffer;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, "[REDACTED]");
  }
  return result;
}
```

### 이상 패턴 감지

```typescript
const ANOMALY_PATTERNS = [
  { pattern: /error/i, severity: "high" },
  { pattern: /failed/i, severity: "high" },
  { pattern: /exception/i, severity: "high" },
  { pattern: /timeout/i, severity: "medium" },
  { pattern: /warning/i, severity: "low" },
  { pattern: /deprecated/i, severity: "low" },
];

async function detectAndCapture(output: string): Promise<string | null> {
  for (const { pattern, severity } of ANOMALY_PATTERNS) {
    if (pattern.test(output)) {
      if (severity === "high" || severity === "medium") {
        return this.captureOnFailure({
          exitCode: 0, // 실패는 아니지만 캡처
          buffer: output,
          cwd: process.cwd(),
          env: process.env as Record<string, string>,
        });
      }
    }
  }
  return null;
}
```

### 용량 관리 (Pruning)

```typescript
interface PruneConfig {
  maxAge: number; // days
  maxBytes: number; // 전체 용량 제한
  keepMinimum: number; // 최소 유지 개수
}

async function prune(config: PruneConfig): Promise<PruneResult> {
  const result: PruneResult = { deleted: 0, freedBytes: 0 };

  // 1. 오래된 스냅샷 삭제
  const oldSnapshots = await getSnapshotsOlderThan(config.maxAge);
  for (const snap of oldSnapshots) {
    if ((await getSnapshotCount()) > config.keepMinimum) {
      result.freedBytes += await getSnapshotSize(snap.id);
      await deleteSnapshot(snap.id);
      result.deleted++;
    }
  }

  // 2. 용량 초과 시 오래된 것부터 삭제
  let totalBytes = await getTotalSnapshotBytes();
  while (totalBytes > config.maxBytes) {
    const oldest = await getOldestSnapshot();
    if (!oldest || (await getSnapshotCount()) <= config.keepMinimum) break;

    result.freedBytes += await getSnapshotSize(oldest.id);
    await deleteSnapshot(oldest.id);
    result.deleted++;
    totalBytes = await getTotalSnapshotBytes();
  }

  return result;
}
```

---

## 전체 파이프라인 (ECLM)

```typescript
/**
 * 확장된 파이프라인: Extract → Cognify → Load → Memify
 */
async function runECLMPipeline(
  config: PipelineConfig,
): Promise<PipelineResult> {
  const result: PipelineResult = {};
  const start = Date.now();

  // 1. EXTRACT
  const logs = config.sessionId
    ? await extractPipeline.collectLogs(config.sessionId)
    : [];
  const commits = await extractPipeline.collectCommits(
    config.since ?? lastRunDate,
  );
  const snapshots = config.taskId
    ? await extractPipeline.collectTerminalSnapshots(config.taskId)
    : [];

  // 2. COGNIFY
  const facts = await cognifyPipeline.toAtomicFacts(logs, commits);
  const skills = await cognifyPipeline.extractSkills(facts);
  const patterns = await cognifyPipeline.extractPatterns(facts);
  const gotchas = await cognifyPipeline.extractGotchas(logs, snapshots);

  // 3. LOAD
  const obsIds = await loadPipeline.saveObservations(facts);
  const skillIds = await loadPipeline.saveSkills(skills);
  const patternIds = await loadPipeline.savePatterns(patterns);
  const gotchaIds = await loadPipeline.saveGotchas(gotchas);
  await loadPipeline.updateIndexes();

  // 4. MEMIFY (NEW!)
  const allIds = [...obsIds, ...skillIds, ...patternIds, ...gotchaIds];
  await memifyPipeline.calculateImportanceScores(allIds);
  await memifyPipeline.applyDecayFunctions(new Date());

  // 주기적으로 클러스터 재조직 (일일 배치에서만)
  if (config.trigger === "daily_batch") {
    await memifyPipeline.reorganizeClusters();
  }

  result.observations = obsIds.length;
  result.skills = skillIds.length;
  result.patterns = patternIds.length;
  result.gotchas = gotchaIds.length;
  result.duration = Date.now() - start;

  return result;
}
```
