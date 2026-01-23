# Memory System Schema Design

## 개요

Event-Sourced 아키텍처를 기반으로 하여 전체 히스토리를 추적하고, 현재 상태는 이벤트의 Materialized View로 구성합니다.

---

## Hybrid Schema Strategy

**Staging (pglite)** 과 **Published (agentdb)** 두 가지 저장소를 사용하는 하이브리드 전략을 채택합니다.

### 1. Staging Schema (pglite/Drizzle)

에이전트의 실시간 작업 로그와 Raw 데이터를 저장합니다.

```sql
-- task_logs: 모든 작업의 원형 (Source of Truth)
CREATE TABLE task_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    level TEXT NOT NULL, -- 'info', 'warn', 'error', 'thought', 'tool'
    content TEXT NOT NULL,
    metadata JSONB, -- tool_name, args, duration 등
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- terminal_snapshots: 에러 발생 시점의 상태
CREATE TABLE terminal_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    content TEXT NOT NULL,
    trigger_reason TEXT, -- 'error', 'manual'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- memory_events: 중요 이벤트 기록 (Append Only)
CREATE TABLE memory_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    agent_id TEXT,
    task_id UUID,
    scope TEXT DEFAULT 'task',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## EntryKind Classification & Policies

저장되는 데이터의 성격에 따라 3가지 EntryKind로 분류하고, 각각 다른 감쇠(Decay) 및 검증 정책을 적용합니다.

### Classification

| EntryKind     | 설명                               | 포함 대상 (테이블)                                        | 감쇠 정책                   | 인용 필수 |
| ------------- | ---------------------------------- | --------------------------------------------------------- | --------------------------- | --------- |
| **Episodic**  | 일회성 사건, 시간 흐름에 따른 기록 | `observations` (기본), `terminal_snapshots`, `iterations` | **Fast** (지수 감쇠, 30일)  | 선택      |
| **Knowledge** | 지속적 지식, 일반화된 사실         | `skills`, `patterns`                                      | **Slow** (선형 감쇠, 180일) | **필수**  |
| **State**     | 현재 상태 정보, 최신성 중요        | `gotchas`, `sessions`                                     | **Step** (해결 시 만료)     | **필수**  |

### EntryKind Mapping Definition

```typescript
const ENTRY_KIND_MAPPING = {
  // Episodic: 발생 시점이 중요하며 시간이 지나면 가치가 떨어짐
  episodic: ["observations", "terminal_snapshots", "iterations", "qa_reports"],

  // Knowledge: 시간이 지나도 가치가 유지되거나 강화됨 (검증 필요)
  knowledge: ["skills", "patterns", "code_graph"],

  // State: 현재 유효한지 여부가 중요 (해결/변경 시 즉시 무효화)
  state: ["gotchas", "sessions", "tasks", "stories"],
};
```

### Retention Policies

```typescript
const RETENTION_POLICIES = {
  episodic: {
    decayFunction: "exponential",
    halfLifeDays: 30,
    archiveAfterDays: 90,
    vectorIndexParams: { efConstruction: 64, m: 16 }, // 검색 속도 중시
  },
  knowledge: {
    decayFunction: "linear",
    halfLifeDays: 180,
    archiveAfterDays: 365,
    vectorIndexParams: { efConstruction: 128, m: 32 }, // 정확도 중시
  },
  state: {
    decayFunction: "step", // 상태 변경 시 1.0 -> 0.0
    halfLifeDays: 14, // (참고용)
    archiveAfterDays: 30, // 완료/해결 후 보관 기간
    vectorIndexParams: { efConstruction: 64, m: 16 },
  },
};
```

---

## Published Tables (agentdb Managed)

`agentdb`는 다음과 같은 논리적 엔티티를 관리합니다. (직접 SQL로 접근하지 않고 API 사용)

### 1. Reflexion Episode

```typescript
interface Episode {
  taskId: string;
  task: string; // "Fix auth bug"
  critique: string; // "Token expiration logic was wrong"
  reward: number; // 0.0 - 1.0
  success: boolean;
  input: string; // Task Context
  output: string; // Tool Outputs
}
```

### 2. Skill

```typescript
interface Skill {
  name: string;
  description: string;
  code: string;
  usage_count: number;
  success_rate: number;
}
```

### 3. Causal Edge

```typescript
interface CausalEdge {
  cause: string;
  effect: string;
  confidence: number;
  source_episode_id: string;
}
```

---

## TypeScript Types

### Core Types

```typescript
interface MemoryEntry {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  scope: "task" | "worktree" | "project" | "org";
  createdAt: Date;
  updatedAt: Date;
}

interface MemoryLifecycle {
  supersedes_id?: string;
  deprecated_at?: Date;
  valid_from_commit?: string;
  valid_to_commit?: string;
  contradiction_note?: string;
}

interface TrustMetadata {
  confidence: number; // 0-1
  validation_source?: ValidationSource;
  last_validated_at?: Date;
  decay_policy: "recency_bias" | "stable" | "manual_only";
}

type ValidationSource =
  | "tests_passed"
  | "pr_merged"
  | "human_approved"
  | "repeated_success";
```

### Entry Kind & Validation

```typescript
type EntryKind = "episodic" | "knowledge" | "state";
type ValidationStatus = "draft" | "verified" | "deprecated";

interface TypedMemoryEntry extends MemoryEntry {
  kind: EntryKind;
  validation_status: ValidationStatus;
  confidence: number;
  decay_policy: "fast" | "slow" | "manual";
}
```

### Citation Types

```typescript
type Citation =
  | { kind: "commit"; hash: string }
  | { kind: "file"; path: string; startLine?: number; endLine?: number }
  | { kind: "symbol"; id: string; name: string; file: string }
  | { kind: "terminal_snapshot"; id: string }
  | { kind: "log"; pointer: string };

interface CitedEntry {
  content: string;
  citations: Citation[];
  isCited: boolean; // If false, treat as hypothesis
}
```
