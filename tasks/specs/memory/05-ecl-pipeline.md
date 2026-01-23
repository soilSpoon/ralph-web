# ECL Pipeline (Extract → Cognify → Load)

## 개요

ECL Pipeline은 원시 데이터를 구조화된 메모리로 변환하는 3단계 파이프라인입니다.

```
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│    EXTRACT    │ →  │    COGNIFY    │ →  │     LOAD      │
│  (Staging DB) │    │   (AgentDB)   │    │  (Published)  │
└───────────────┘    └───────────────┘    └───────────────┘
```

**Implementation Strategy:**

- **Extract**: Raw logs & snapshots -> `pglite` (Staging)
- **Cognify**: Processing & Analysis -> In-memory / LLM
- **Load**: High-value Knowledge -> `agentdb` (Published)

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

### Cognify Interface (AgentDB Integration)

`agentdb` 패키지의 컨트롤러들을 활용하여 데이터를 구조화하고 변환합니다.

```typescript
import {
  ReflexionMemory,
  SkillLibrary,
  CausalMemoryGraph,
} from "@agentic/agentdb";

interface CognifyPipeline {
  // Atomic Fact 생성 -> ReflexionMemory 내부 처리
  // Skill 추출 -> SkillLibrary 활용
  // Pattern 추출 -> CausalMemoryGraph 활용
  // 실제로 Cognify 단계는 agentdb의 'storeEpisode' 전처리 과정 또는
  // NightlyLearner의 백그라운드 작업으로 통합됩니다.
}

// Data Handling Strategy
// 1. Raw Logs (from pglite) -> LLM Analysis -> Structured Episode
// 2. Structured Episode -> agentdb.ReflexionMemory.storeEpisode()
```

// Note: Skill, Pattern, Gotcha extraction logic is now handled by
// agentdb specific components or custom Logic referencing agentdb's structures.

---

## 3. Load (저장/인덱싱)

### Load Interface (AgentDB Integration)

`agentdb`의 컨트롤러 메서드에 직접 매핑됩니다.

```typescript
interface LoadPipeline {
  // 1. 에피소드 저장 (Cognify + Load)
  // 내부적으로 임베딩 생성, 그래프 노드 추가, 학습 데이터 생성을 수행함
  saveEpisode(episode: Episode): Promise<void>;

  // 2. 스킬 수동 추가 (Optional)
  saveSkill(skill: Skill): Promise<void>;

  // 3. 패턴/Gotcha -> Causal Memory Graph Update
  updateCausalGraph(nodes: CausalNode[]): Promise<void>;
}
```

#### Mapping to AgentDB

- `saveObservations` -> `agentdb.reflexion.storeEpisode()`
- `saveSkills` -> `agentdb.skillLibrary.addSkill()`
- `savePatterns` -> `agentdb.causalGraph.addPattern()` (conceptual)

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

## 4. Nightly Learner (Memify 대체)

기존의 수동 `Memify` 단계는 `agentdb`의 `NightlyLearner`로 대체됩니다.

### NightlyLearner 기능

1.  **Deduplication**: 중복된 에피소드 및 노드 통합.
2.  **Pruning (Decay)**: 오래되거나 중요도가 낮은 기억 정리.
3.  **Generalization**: 개별 에피소드에서 일반화된 스킬 추출.
4.  **Graph Optimization**: 인과 관계 그래프 재구성 및 강화.

```typescript
// agentdb/src/controllers/NightlyLearner.ts 참조
interface NightlyLearnerConfig {
  targetMemoryQuality: number; // 목표 메모리 품질 (0.0 - 1.0)
  pruningThreshold: number; // 삭제 임계값
}

// Nightly Job Example
async function runNightlyMaintenance() {
  console.log("Starting Nightly Learner...");
  const stats = await agentdb.nightlyLearner.runMaintenance();
  console.log(`Maintenance Complete: ${JSON.stringify(stats)}`);
}
```

---

## 5. TerminalSnapshotService (Staging)

터미널 스냅샷은 `pglite`의 `terminal_snapshots` 테이블에 저장되어 원시 데이터를 제공합니다.
상세 검색(Layer 3) 시 `agentdb`에 저장된 메타데이터를 통해 `pglite`의 원본을 조회할 수 있습니다.

(이하 TerminalSnapshotService 내용은 pglite 기반 implementation으로 유지)
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

```
