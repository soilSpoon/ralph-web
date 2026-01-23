# Memory Governance

## 개요

병렬 에이전트 환경에서 메모리 일관성과 품질을 보장하기 위한 거버넌스 모델입니다.

> [!CAUTION]
> **Critical Gap**: 거버넌스 없이 5개의 병렬 에이전트가 동시에 쓰면:
>
> - 중복/모순된 항목 발생
> - Last-writer-wins 손상
> - 추적 불가능한 지식 출처

---

## Two-Phase Write Path

### 핵심 원칙

- **Staging (App State)**: `pglite`에 로우 로그(Raw Logs)를 스트리밍. 에이전트는 이곳에 자유롭게 씁니다.
- **Published (Wisdom)**: 검증(Verify)을 통과한 지식만 `agentdb`로 승격. 비용과 품질 관리.

```
┌─────────────────────────────────────────────────────────────┐
│              STAGING (pglite / Task-Scoped)                  │
│        Agents append logs, thoughts, tool outputs            │
│        → Source of Truth (Audit Log)                        │
└─────────────────────────────┬───────────────────────────────┘
                              │ PROMOTION GATE
                              │ (Triggered by 'Verify' Success)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              PUBLISHED (agentdb / Project-Scoped)            │
│        Reflexion Episodes, Skills, Causal Graphs             │
│        → Source of Wisdom (Semantic Search)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Scope Hierarchy

```typescript
type Scope = "task" | "worktree" | "project" | "org";

// Scope 계층
const SCOPE_HIERARCHY = {
  task: 1, // 단일 작업 내에서만 유효
  worktree: 2, // 워크트리 브랜치 내에서 유효
  project: 3, // 프로젝트 전체에서 유효
  org: 4, // 조직 전체에서 유효 (Cross-project)
} as const;

// 상위 스코프로 승격 가능 여부 확인
function canPromote(from: Scope, to: Scope): boolean {
  return SCOPE_HIERARCHY[from] < SCOPE_HIERARCHY[to];
}
```

---

## Promotion Pipeline

### 승격 프로세스 (Code View)

```typescript
// libs/memory/src/pipeline/promotion.ts

export async function promoteTaskToMemory(taskId: string): Promise<string> {
  // 1. Staging Log 조회 (from pglite)
  const taskLogs = await drizzle.models.taskLogs.findMany({
    where: eq(taskLogs.taskId, taskId),
  });

  // 2. Cognify (LLM으로 요약 및 비평)
  const analysis = await llm.analyzeTask(taskLogs);
  /**
   * Analysis Result:
   * - Success: true
   * - Critique: "OAuth2 구현 시 PKCE 플로우 누락됨"
   * - KeyDecisions: ["Use hono instead of express"]
   */

  // 3. Load to agentdb (ReflexionMemory)
  const episodeId = await agentdb.reflexion.storeEpisode({
    task: taskLogs[0].taskDescription,
    critique: analysis.critique,
    reward: analysis.score,
    success: analysis.success,
    input: JSON.stringify(taskLogs[0].context),
    output: JSON.stringify(analysis.result),
  });

  // 4. (Optional) 반복된 성공 시 Skill 생성
  if (analysis.success && analysis.isRepeatable) {
    await agentdb.skills.createSkill({
      name: analysis.suggestedSkillName,
      code: analysis.extractedCode,
      // ...
    });
  }

  return episodeId;
}
```

---

## Deduplication (agentdb Managed)

`agentdb`는 데이터 저장 시 자동으로 임베딩 유사도를 검사하여 중복을 방지하거나 병합 제안을 합니다.

- **Reflexion**: `storeEpisode` 시 유사한 에피소드가 있으면 연결 (Causal Graph).
- **ReasoningBank**: `storePattern` 시 의미적 중복(Semantic Duplicate) 자동 감지.

---

## Supersession Semantics

새로운 지식이 기존 지식을 대체할 때:

```typescript
interface SupersessionEntry {
  id: string;
  supersedes_id: string; // 대체하는 항목
  valid_from_commit: string; // 이 커밋부터 유효
  valid_to_commit?: string; // 이 커밋까지 유효 (deprecated)
  contradiction_note?: string; // 왜 대체되는지 설명
}

async function supersede(
  newEntryId: string,
  oldEntryId: string,
  reason: string,
): Promise<void> {
  // 1. 새 항목에 supersedes 링크 추가
  await update(newEntryId, {
    supersedes_id: oldEntryId,
  });

  // 2. 기존 항목 deprecated 처리
  await update(oldEntryId, {
    deprecated_at: new Date(),
    valid_to_commit: await getCurrentCommit(),
    contradiction_note: reason,
  });

  // 3. 이벤트 기록
  await appendEvent({
    event_type: "SUPERSEDED",
    payload: {
      old: oldEntryId,
      new: newEntryId,
      reason,
    },
  });
}
```

---

## Confidence & Trust Scoring

### Trust Metadata

```typescript
interface TrustMetadata {
  confidence: number; // 0-1
  validation_source?: ValidationSource;
  last_validated_at?: Date;
  validation_count: number;
  decay_policy: "recency_bias" | "stable" | "manual_only";
}

type ValidationSource =
  | "tests_passed"
  | "pr_merged"
  | "human_approved"
  | "repeated_success";
```

### Confidence Update Rules

```typescript
const CONFIDENCE_RULES = {
  // 검증 소스별 신뢰도 증가량
  validation_boosts: {
    tests_passed: 0.2,
    pr_merged: 0.3,
    human_approved: 0.4,
    repeated_success: 0.15,
  },

  // 시간에 따른 감소
  decay_rates: {
    recency_bias: 0.1, // 월간 10% 감소
    stable: 0.02, // 월간 2% 감소
    manual_only: 0, // 자동 감소 없음
  },

  // 최대/최소값
  bounds: {
    min: 0.1,
    max: 1.0,
    initial_draft: 0.3,
    initial_verified: 0.6,
  },
} as const;

async function updateConfidence(
  entryId: string,
  signal: ValidationSource,
): Promise<number> {
  const entry = await getById(entryId);
  const boost = CONFIDENCE_RULES.validation_boosts[signal];

  const newConfidence = Math.min(
    entry.confidence + boost,
    CONFIDENCE_RULES.bounds.max,
  );

  await update(entryId, {
    confidence: newConfidence,
    validation_source: signal,
    last_validated_at: new Date(),
    validation_count: entry.validation_count + 1,
  });

  return newConfidence;
}
```

---

## Circular Fix Detection

반복되는 실패 접근법 감지:

```typescript
interface CircularFixDetector {
  // 동일한 접근법이 반복되는지 감지
  detectRepeatedApproach(taskId: string, approach: string): Promise<boolean>;

  // 실패한 접근법 목록 조회
  getFailedApproaches(taskId: string): Promise<FailedApproach[]>;

  // 작업 교착 상태 표시
  markSubtaskStuck(taskId: string, reason: string): Promise<void>;
}

interface FailedApproach {
  approach: string;
  attemptCount: number;
  lastAttemptAt: Date;
  failureReasons: string[];
}

// Think 단계에서 사용
async function validateApproach(
  taskId: string,
  proposedApproach: string,
): Promise<ApproachValidation> {
  const isRepeated = await detector.detectRepeatedApproach(
    taskId,
    proposedApproach,
  );

  if (isRepeated) {
    const failedApproaches = await detector.getFailedApproaches(taskId);

    return {
      valid: false,
      reason: "이 접근법은 이미 실패했습니다",
      suggestion: "대안 접근법을 시도하거나 인간 개입을 요청하세요",
      failedHistory: failedApproaches,
    };
  }

  return { valid: true };
}
```

---

## Write Access Control

### 스코프별 쓰기 권한

```typescript
interface WritePermission {
  scope: Scope;
  allowedActors: ActorType[];
  requiresValidation: boolean;
}

type ActorType = "agent" | "orchestrator" | "human" | "system";

const WRITE_PERMISSIONS: WritePermission[] = [
  {
    scope: "task",
    allowedActors: ["agent", "orchestrator"],
    requiresValidation: false,
  },
  {
    scope: "worktree",
    allowedActors: ["agent", "orchestrator"],
    requiresValidation: false,
  },
  {
    scope: "project",
    allowedActors: ["orchestrator", "human"],
    requiresValidation: true,
  },
  {
    scope: "org",
    allowedActors: ["human", "system"],
    requiresValidation: true,
  },
];

function canWrite(actor: ActorType, scope: Scope): boolean {
  const permission = WRITE_PERMISSIONS.find((p) => p.scope === scope);
  return permission?.allowedActors.includes(actor) ?? false;
}
```

---

## Retention Policies (agentdb Managed)

`agentdb`의 `BatchOperations.pruneData`를 사용하여 주기적으로 오래되거나 낮은 가치의 메모리를 정리합니다.

```typescript
// Nightly Maintenance Job
await agentdb.batchOps.pruneData({
  maxAge: 90, // 90일 이상 된 데이터
  minReward: 0.3, // 낮은 보상(실패) 에피소드
  minSuccessRate: 0.5, // 성공률 낮은 스킬
  keepMinPerTask: 5, // 태스크당 최소 5개는 유지
});
```
