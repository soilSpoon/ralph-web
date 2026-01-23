# Ralph Loop Integration

## 개요

Memory System과 Ralph Loop(Think → Code → Verify)의 통합 포인트를 정의합니다.

---

## Loop Phases Overview

```
┌───────────────────────────────────────────────────────────────┐
│                        THINK PHASE                             │
│             (Planning, Retrieval, Sufficiency)                 │
├───────────────────────────────────────────────────────────────┤
│ INJECT:                                                        │
│  • Constitution (always)                                       │
│  • Relevant Skills, Patterns, Gotchas                         │
│  • Code Symbols for touched files                              │
│                                                                │
│ CHECK:                                                         │
│  • Sufficiency before finalizing plan                         │
│  • Label uncited info as "hypothesis"                         │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                        CODE PHASE                              │
│             (Implementation, Discovery, Write)                 │
├───────────────────────────────────────────────────────────────┤
│ INJECT:                                                        │
│  • File-scoped gotchas                                         │
│  • Recent episodic timeline                                    │
│  • Circular fix patterns check                                 │
│                                                                │
│ WRITE (to STAGING only):                                       │
│  • Discoveries, Decisions, Commands                           │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                       VERIFY PHASE                             │
│             (Testing, Validation, Capture)                     │
├───────────────────────────────────────────────────────────────┤
│ INJECT:                                                        │
│  • Expected invariants from patterns                          │
│  • Prior failure cases                                         │
│                                                                │
│ CAPTURE:                                                       │
│  • Test outcomes                                               │
│  • Terminal snapshots on failure                              │
│  • Confidence updates                                          │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────────┐
│                    CONSOLIDATE PHASE                           │
│             (Promotion, Dedupe, Cleanup)                       │
├───────────────────────────────────────────────────────────────┤
│ ORCHESTRATOR ONLY:                                             │
│  • Promote staging → project                                   │
│  • Deduplicate                                                 │
│  • Resolve conflicts                                           │
│  • Update code graph                                           │
└───────────────────────────────────────────────────────────────┘
```

---

## Session Hydration

세션 시작 시 컨텍스트에 주입되는 내용:

```typescript
interface HydrationConfig {
  constitution: string; // 항상 로드
  relevantSkills: SkillEntry[]; // 작업 컨텍스트 기반
  recentGotchas: GotchaEntry[]; // 유사 파일/작업에서
  codeContext: CodeEntity[]; // 범위 내 심볼
  maxTokenBudget: number;
}

async function hydrateSession(
  taskContext: TaskContext,
): Promise<HydrationConfig> {
  const constitution = await loadConstitution();

  // 작업 컨텍스트 기반 Skill 검색
  const relevantSkills = await searchMemory(taskContext.description, {
    intent: "how_to",
    scope: "project",
    limit: 5,
  });

  // 관련 파일의 Gotcha 검색
  const recentGotchas = await getGotchasForFiles(taskContext.files);

  // 코드 심볼 로드
  const codeContext = await getCodeEntitiesForFiles(taskContext.files);

  return {
    constitution,
    relevantSkills,
    recentGotchas,
    codeContext,
    maxTokenBudget: 8000,
  };
}
```

---

## Think Phase Integration

### Injection Points

```typescript
interface ThinkPhaseInjection {
  // 1. Constitution (항상)
  constitution: string;

  // 2. 도메인 관련 지식
  skills: SkillEntry[];
  patterns: PatternEntry[];
  gotchas: GotchaEntry[];

  // 3. 코드 컨텍스트
  codeSymbols: CodeEntity[];
  codeRelations: CodeRelation[];

  // 4. 메타데이터
  sufficiency: SufficiencyCheck;
  citationRequirements: CitationRule[];
}

async function prepareThinkContext(task: Task): Promise<ThinkPhaseInjection> {
  // 병렬로 검색
  const [skills, patterns, gotchas, codeEntities] = await Promise.all([
    searchMemory(task.description, { intent: "how_to", limit: 5 }),
    searchPatterns(task.description, { limit: 3 }),
    searchGotchas(task.description, { files: task.files, limit: 5 }),
    getCodeEntitiesForFiles(task.files),
  ]);

  // 충분성 검사
  const sufficiency = await evaluateSufficiency(task, {
    skills,
    patterns,
    gotchas,
    codeEntities,
  });

  // 부족하면 추가 검색
  if (!sufficiency.isComplete) {
    for (const missing of sufficiency.missingTypes) {
      await expandSearch(task, missing);
    }
  }

  return {
    constitution: await loadConstitution(),
    skills,
    patterns,
    gotchas,
    codeSymbols: codeEntities,
    codeRelations: await getRelationsForEntities(codeEntities),
    sufficiency,
    citationRequirements: CITATION_RULES,
  };
}
```

### Sufficiency Check Before Plan

```typescript
async function validatePlanReadiness(
  task: Task,
  context: ThinkPhaseInjection,
): Promise<PlanValidation> {
  const { sufficiency } = context;

  if (!sufficiency.isComplete) {
    if (sufficiency.recommendation === "expand_search") {
      return {
        ready: false,
        action: "expand",
        message: `Missing context: ${sufficiency.missingTypes.join(", ")}`,
      };
    }

    if (sufficiency.recommendation === "request_human") {
      return {
        ready: false,
        action: "ask_human",
        message: "Need human input for missing context",
        questions: generateClarificationQuestions(sufficiency),
      };
    }
  }

  // 인용되지 않은 정보 레이블링
  for (const entry of [...context.skills, ...context.patterns]) {
    if (!entry.citations?.length) {
      entry.label = "[HYPOTHESIS]";
    }
  }

  return { ready: true };
}
```

---

## Code Phase Integration

### Injection Points

```typescript
interface CodePhaseInjection {
  // 1. 수정 중인 파일의 Gotcha
  fileGotchas: GotchaEntry[];

  // 2. 최근 에피소드 타임라인
  recentTimeline: ObservationEntry[];

  // 3. 순환 수정 감지 결과
  circularFixCheck: CircularFixResult;
}

async function prepareCodeContext(
  task: Task,
  modifyingFiles: string[],
): Promise<CodePhaseInjection> {
  // 파일별 Gotcha
  const fileGotchas = await getGotchasForFiles(modifyingFiles);

  // 최근 타임라인 (관련 파일에 대한)
  const recentTimeline = await getRecentObservations({
    files: modifyingFiles,
    limit: 10,
    window: { days: 7 },
  });

  // 순환 수정 체크
  const circularFixCheck = await checkCircularFix(
    task.id,
    task.proposedApproach,
  );

  return {
    fileGotchas,
    recentTimeline,
    circularFixCheck,
  };
}
```

### Write Points (Staging Only)

Code Phase에서 에이전트가 staging 메모리에 쓰는 내용:

```typescript
interface CodePhaseWrite {
  // 발견 사항: "이 함수는 실제로 X를 수행함"
  discoveries: Discovery[];

  // 결정 사항: 접근법에 대한 근거
  decisions: Decision[];

  // 명령어: 중요한 터미널 상호작용
  commands: CommandCapture[];
}

// Discovery 쓰기
async function recordDiscovery(
  taskId: string,
  content: string,
  files: string[],
): Promise<void> {
  await appendEvent({
    event_type: "OBSERVED",
    payload: {
      content,
      type: "discovery",
    },
    task_id: taskId,
    scope: "task", // 항상 task scope로 쓰기
    file_paths: files,
  });
}

// Decision 쓰기
async function recordDecision(
  taskId: string,
  decision: string,
  rationale: string,
): Promise<void> {
  await appendEvent({
    event_type: "OBSERVED",
    payload: {
      content: decision,
      type: "decision",
      rationale,
    },
    task_id: taskId,
    scope: "task",
  });
}
```

---

## Verify Phase Integration

### Injection Points

```typescript
interface VerifyPhaseInjection {
  // 1. 패턴에서 기대되는 불변성
  expectedInvariants: Invariant[];

  // 2. 유사 변경에 대한 이전 실패 사례
  priorFailures: FailureCase[];

  // 3. 새 지식의 모순 체크
  contradictionCheck: ContradictionResult;
}

async function prepareVerifyContext(
  task: Task,
  changes: FileChange[],
): Promise<VerifyPhaseInjection> {
  // 패턴에서 불변성 추출
  const patterns = await getPatternsForChanges(changes);
  const expectedInvariants = extractInvariants(patterns);

  // 이전 실패 사례
  const priorFailures = await getFailuresForSimilarChanges(changes);

  // 새 관찰과 기존 지식의 모순 체크
  const recentObservations = await getRecentObservations({ taskId: task.id });
  const contradictionCheck = await checkContradictions(recentObservations);

  return {
    expectedInvariants,
    priorFailures,
    contradictionCheck,
  };
}
```

### Capture Points

```typescript
interface VerifyPhaseCapture {
  // 테스트 결과
  testOutcomes: TestOutcome[];

  // 실패 시 터미널 스냅샷
  terminalSnapshots: TerminalSnapshot[];

  // 신뢰도 업데이트
  confidenceUpdates: ConfidenceUpdate[];
}

// 테스트 통과 시
async function onTestsPassed(
  taskId: string,
  testResults: TestResult[],
): Promise<void> {
  // 관련 항목 신뢰도 업데이트
  const relatedEntries = await getRecentObservations({ taskId });
  for (const entry of relatedEntries) {
    await updateConfidence(entry.id, "tests_passed");
  }

  // 검증됨 표시
  await markEntriesAsVerified(relatedEntries.map((e) => e.id));
}

// 테스트 실패 시
async function onTestsFailed(taskId: string, error: TestError): Promise<void> {
  // 터미널 스냅샷 캡처
  const snapshot = await captureTerminalState();

  // Gotcha 후보 생성
  const gotchaCandidate = {
    title: `Test failure: ${error.testName}`,
    description: error.message,
    trigger_conditions: extractTriggerConditions(error),
    terminal_snapshot_id: snapshot.id,
    scope: "task",
  };

  await saveGotcha(gotchaCandidate);

  // 실패 접근법 기록 (순환 수정 감지용)
  await recordFailedApproach(taskId, error.approach);
}
```

---

## Consolidate Phase Integration

작업 완료 또는 머지 시 오케스트레이터가 실행:

```typescript
interface ConsolidateConfig {
  taskId: string;
  commitHash: string;
  mergeTarget: "main" | "develop";
}

async function consolidateOnMerge(
  config: ConsolidateConfig,
): Promise<ConsolidateResult> {
  const { taskId, commitHash } = config;

  // 1. 작업 스코프에서 고가치 항목 추출
  const stagingEntries = await getStagingEntries(taskId);
  const highValueEntries = filterHighValue(stagingEntries);

  // 2. 프로젝트 메모리와 중복 체크
  const { unique, duplicates } =
    await deduplicateAgainstProject(highValueEntries);

  // 3. 충돌 해결 (대체 시맨틱)
  const conflicts = await detectConflicts(unique);
  for (const conflict of conflicts) {
    await resolveWithSupersession(conflict);
  }

  // 4. 프로젝트 스코프로 승격
  for (const entry of unique) {
    await promoteEntry(entry.id, "task", "project");
  }

  // 5. 변경된 파일의 코드 그래프 업데이트
  const changedFiles = await getChangedFiles(commitHash);
  await updateCodeGraph(changedFiles);

  return {
    promoted: unique.length,
    deduplicated: duplicates.length,
    conflictsResolved: conflicts.length,
    codeEntitiesUpdated: await getUpdatedEntityCount(),
  };
}
```

---

## Hook Registration

Ralph Loop에서 Memory 훅 등록:

```typescript
interface MemoryHooks {
  // 세션 시작
  onSessionStart: (session: Session) => Promise<HydrationConfig>;

  // 커밋 후
  onCommit: (commit: Commit) => Promise<void>;

  // 작업 완료
  onTaskComplete: (task: Task) => Promise<ConsolidateResult>;

  // 파일 변경 감지
  onFileChange: (files: string[]) => Promise<void>;
}

function registerMemoryHooks(ralphLoop: RalphLoop): void {
  ralphLoop.on("session:start", async (session) => {
    const hydration = await hydrateSession(session.context);
    session.injectContext(hydration);
  });

  ralphLoop.on("commit", async (commit) => {
    const logs = await collectRecentLogs();
    const facts = await cognifyToFacts(logs, commit);
    await saveObservations(facts);
  });

  ralphLoop.on("task:complete", async (task) => {
    const observations = await getSessionObservations(task.id);
    const skills = await extractSkills(observations);
    const patterns = await extractPatterns(observations);
    await saveSkills(skills);
    await savePatterns(patterns);
    return consolidateOnMerge({
      taskId: task.id,
      commitHash: task.commitHash,
      mergeTarget: task.branch,
    });
  });

  ralphLoop.on("file:change", async (files) => {
    await updateCodeGraph(files);
  });
}
```

---

## Session Resume (세션 재개)

> **참조**: 1code, claude-mem

작업 중단 후 재개 시 이전 컨텍스트를 복원하는 메커니즘입니다.

### Session 스키마

```typescript
interface Session {
  id: string; // 자동 생성 UUID
  taskId: string; // 연결된 Task
  sessionId?: string; // 외부 SDK 세션 ID (Claude SDK 등)
  state: "active" | "paused" | "completed" | "failed";
  mode: "plan" | "agent"; // 실행 모드

  // 재개용 컨텍스트
  lastCheckpoint: Date; // 마지막 체크포인트
  resumeContext?: string; // 재개 시 주입할 컨텍스트 요약

  // 메시지 히스토리
  messages: SessionMessage[]; // JSON 배열

  createdAt: Date;
  updatedAt: Date;
}

interface SessionMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    sessionId?: string; // SDK 세션 ID
    toolsUsed?: string[]; // 사용된 도구 목록
  };
}
```

### 세션 재개 흐름

```typescript
async function resumeSession(sessionId: string): Promise<ResumedSession> {
  // 1. 기존 세션 조회
  const session = await getSessionById(sessionId);
  if (!session) throw new Error("Session not found");

  // 2. 마지막 체크포인트 확인
  const timeSinceCheckpoint = Date.now() - session.lastCheckpoint.getTime();
  const needsContextRefresh = timeSinceCheckpoint > 30 * 60 * 1000; // 30분

  // 3. 컨텍스트 복원
  let context: HydrationConfig;
  if (needsContextRefresh) {
    // 오래된 경우: 전체 hydration 다시 수행
    context = await hydrateSession({ taskId: session.taskId });
  } else {
    // 최근인 경우: resumeContext 사용
    context = {
      resumeContext: session.resumeContext,
      recentMessages: session.messages.slice(-10),
    };
  }

  // 4. 세션 상태 업데이트
  await updateSession(sessionId, {
    state: "active",
    lastCheckpoint: new Date(),
  });

  return { session, context };
}
```

### 체크포인트 저장

```typescript
// 주요 지점에서 체크포인트 저장
async function saveCheckpoint(
  sessionId: string,
  context: CheckpointContext,
): Promise<void> {
  const resumeContext = await generateResumeContext(context);

  await updateSession(sessionId, {
    lastCheckpoint: new Date(),
    resumeContext,
    messages: context.messages,
  });
}

// 체크포인트 트리거 시점:
// 1. 도구 사용 후 (PostToolUse hook)
// 2. 사용자 메시지 수신 후
// 3. 일정 간격 (5분마다)
// 4. 에러 발생 전
```

### Lifecycle Hooks (claude-mem 스타일)

```typescript
type LifecycleHook =
  | "SessionStart" // 세션 시작 시
  | "UserPromptSubmit" // 사용자 입력 시
  | "PostToolUse" // 도구 사용 후
  | "Stop" // 세션 종료 시
  | "SessionEnd"; // 세션 완료 시

interface HookHandlers {
  SessionStart: (session: Session) => Promise<void>;
  UserPromptSubmit: (input: UserInput) => Promise<void>;
  PostToolUse: (tool: ToolResult) => Promise<void>;
  Stop: (session: Session) => Promise<void>;
  SessionEnd: (session: Session) => Promise<void>;
}

// 훅 등록 및 실행
function registerLifecycleHooks(handlers: Partial<HookHandlers>): void {
  for (const [hook, handler] of Object.entries(handlers)) {
    ralphLoop.on(hook as LifecycleHook, handler);
  }
}

// 예시: 도구 사용 후 관찰 기록
async function postToolUseHandler(tool: ToolResult): Promise<void> {
  // 1. 체크포인트 저장
  await saveCheckpoint(tool.sessionId, {
    lastTool: tool.name,
    messages: tool.context.messages,
  });

  // 2. 관찰 기록 (Memory에 저장)
  await recordObservation({
    type: "tool_use",
    content: `Used ${tool.name}: ${summarize(tool.output)}`,
    sessionId: tool.sessionId,
  });
}
```

### SQL 테이블 (sessions)

```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id),
    session_id TEXT,                    -- 외부 SDK 세션 ID
    state TEXT DEFAULT 'active',        -- active | paused | completed | failed
    mode TEXT DEFAULT 'agent',          -- plan | agent

    -- 재개용 컨텍스트
    last_checkpoint DATETIME,
    resume_context TEXT,                -- 요약된 컨텍스트

    -- 메시지
    messages TEXT,                      -- JSON 배열

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_task ON sessions(task_id);
CREATE INDEX idx_sessions_state ON sessions(state);
```
