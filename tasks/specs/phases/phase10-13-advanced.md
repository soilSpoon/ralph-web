# Phase 10-13: Queue, QA, Memory, Multi-Provider

> 📌 Part of [Phase 7-13 구현 명세](../phases.md)

---

## Phase 10: Queue Manager

### 목표

병렬 태스크 스케줄링 및 리소스 제어

### 타입 정의

```typescript
interface QueueConfig {
  maxConcurrent: number; // 최대 동시 실행 수 (기본: 3)
  priorityWeight: boolean; // 우선순위 기반 스케줄링
  cooldownMs: number; // 실행 간 쿨다운 (기본: 1000)
}

interface QueuedTask {
  taskId: string;
  priority: number;
  queuedAt: Date;
  retryCount: number;
}
```

### 핵심 구현

```typescript
class QueueManager {
  private config: QueueConfig = {
    maxConcurrent: 3,
    priorityWeight: true,
    cooldownMs: 1000,
  };
  private running = new Map<string, RunningTask>();
  private pending: QueuedTask[] = [];

  async scheduleNext(): Promise<void> {
    if (this.running.size >= this.config.maxConcurrent) return;

    this.pending.sort((a, b) => b.priority - a.priority);
    const next = this.pending.shift();
    if (next) await this.startTask(next);
  }

  async onTaskComplete(taskId: string): Promise<void> {
    this.running.delete(taskId);
    setTimeout(() => this.scheduleNext(), this.config.cooldownMs);
  }
}
```

---

## Phase 11: QA Loop (Fixer)

### 목표

자동 테스트 연동 및 에러 피드백 루프

### 플로우

```
Coder 완료 → QA Reviewer → (실패) → QA Fixer → 재검증 (최대 3회)
```

### 타입 정의

```typescript
interface QAResult {
  passed: boolean;
  criteria: CriterionResult[];
  buildOutput?: string;
  testOutput?: string;
}

interface CriterionResult {
  criterion: string;
  passed: boolean;
  notes?: string;
}
```

### 핵심 구현

```typescript
class QALoop {
  private maxRetries = 3;

  async run(taskId: string): Promise<QAReport> {
    let attempts = 0;

    while (attempts < this.maxRetries) {
      attempts++;
      const result = await this.runReviewer(task);

      if (result.passed) return this.createReport(task, "passed", result);

      const fixRequest = this.generateFixRequest(result);
      await this.runFixer(task, fixRequest);
    }

    return this.createReport(task, "failed", result, { escalated: true });
  }
}
```

---

## Phase 12: Memory Graph

### 목표

Graphiti 스타일 그래프 메모리로 지능형 지식 탐색

### 인터페이스

```typescript
interface GraphitiMemory {
  getContextForSession(query: string): Promise<string>;
  addInsight(insight: string, category: InsightCategory): Promise<void>;
  search(query: string, limit?: number): Promise<Pattern[]>;
}

type InsightCategory = "pattern" | "gotcha" | "discovery";
```

### 핵심 구현

```typescript
class MemoryManager implements GraphitiMemory {
  async getContextForSession(query: string): Promise<string> {
    const patterns = await this.search(query, 5);
    if (patterns.length === 0) return "";

    return `
## Relevant Patterns from Previous Sessions
${patterns.map((p) => `- **${p.category}**: ${p.pattern}`).join("\n")}
    `.trim();
  }

  async search(query: string, limit = 10): Promise<Pattern[]> {
    return db.query.patterns.findMany({
      where: sql`patterns MATCH ${query}`,
      limit,
      orderBy: [desc(patterns.createdAt)],
    });
  }
}
```

---

## Phase 13: Multi-Provider

### 목표

20+ CLI 에이전트 표준 어댑터 지원

### Provider 레지스트리

```typescript
export const PROVIDER_IDS = [
  "claude",
  "codex",
  "gemini",
  "qwen",
  "amp",
  "cursor",
  "copilot",
  "opencode",
  "goose",
  "cline",
  "continue",
  "mistral",
] as const;

export type ProviderId = (typeof PROVIDER_IDS)[number];

export interface ProviderDefinition {
  id: ProviderId;
  name: string;
  cli: string;
  installCommand: string;
  autoApproveFlag?: string;
  initialPromptFlag?: string;
  resumeFlag?: string;
  planActivateCommand?: string;
  icon: string;
}
```

### 주요 Provider

| Provider    | CLI      | Auto-Approve                     |
| ----------- | -------- | -------------------------------- |
| Claude Code | `claude` | `--dangerously-skip-permissions` |
| Gemini      | `gemini` | `--yolomode`                     |
| Qwen        | `qwen`   | `--yolo`                         |
| Codex       | `codex`  | `--full-auto`                    |
| Amp         | `amp`    | -                                |
| + 15개 이상 | ...      | ...                              |

### 핵심 함수

```typescript
export function getProvider(id: ProviderId): ProviderDefinition | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export async function detectInstalledProviders(): Promise<ProviderId[]> {
  const installed: ProviderId[] = [];

  for (const provider of PROVIDERS) {
    if (provider.detectable === false) continue;

    try {
      execSync(`which ${provider.cli}`, { stdio: "ignore" });
      installed.push(provider.id);
    } catch {
      // Not installed
    }
  }

  return installed;
}
```
