# Ralph Loop Integration

## 개요

**Memory System**과 **Ralph Loop** (Think → Code → Verify)의 구체적인 통합 포인트입니다.
단순 API 호출이 아니라, 시스템이 먼저 필요한 정보를 주입하는 **Push (Active)** 전략과 에이전트가 필요할 때 찾는 **Pull (Passive)** 전략을 병행합니다.

---

## 1. Loop Phases & Active Hooks

우리는 **"Push & Pull"** 하이브리드 전략을 사용합니다.

### 1.1 Pre-task Hook: Pre-Mortem (Push)
작업을 시작하기 전, 시스템이 `ReasoningBank`를 자동으로 조회하여 **과거 실패 사례(Anti-Patterns)**를 경고로 주입합니다.
*   **Action**: `agentdb.searchPatterns(taskDesc, { onlyFailures: true })`
*   **Outcome**: "⚠️ Warning: Similar tasks failed because of DB Lock. Check 'src/db/pool.ts' first."

### 1.2 Think Phase: Impact Analysis (Push)
수정하려는 대상 파일과 연결된 그래프를 탐색하여 영향도를 주입합니다.
*   **Tool**: Cypher Query
*   **Outcome**: "🕸️ Graph Insight: Modifying 'auth.ts' affects 12 components including 'admin-panel.tsx'."

### 1.3 Post-task Hook: Reward Assignment (Feedback)
작업 결과에 따라 궤적에 보상을 부여하고 패턴으로 승격합니다.
*   **Success (reward: 1.0)**: Test Passed + Lint Clean.
*   **Failure (reward: 0.0)**: Recursive Errors + Max Iterations.

---

## 2. Phase-specific Strategy

| Phase | Strategy | Mechanism |
| :--- | :--- | :--- |
| **Think** | **Push (Inject)** | [Impact Analysis] + [Critical Warnings] |
| **Think** | **Pull (Tool)** | `agent.use("consult_memory", { query: "..." })` |
| **Code** | **Middleware** | `Cognify` (Raw Logs -> Atomic Facts) + Git Binding |
| **Verify** | **Governance** | `CircularFixDetector` (Jaccard Similarity Check) |
| **Consolidate** | **Feedback** | `Reward Loop` (Finalize Trajectory & Update Patterns) |

---

## 3. Think Phase: Context Injection Prompt

에이전트가 계획을 세울 때, 시스템은 다음과 같은 컨텍스트를 프롬프트 최상단에 주입합니다.

```typescript
// libs/orchestrator/prompts/think-context.ts

export const THINK_CONTEXT_PROMPT = (context: RetrievedContext) => `
# 🧠 Cognitive Kernel Insights

## ⚠️ Pre-Mortem Warnings (Past Failures)
Based on similar past tasks, watch out for:
${context.antiPatterns.map(p => `- 🚨 [FAIL] ${p.content} (Similarity: ${p.score})`).join('\n')}

## 🕸️ Code Impact Analysis
Your proposed changes affect the following dependencies:
${context.impactNodes.map(n => `- **${n.name}** (${n.relation})`).join('\n')}

---
**Instruction**: 
1. If you need implementation examples, USE the \`consult_memory\` tool.
2. Address the "Pre-Mortem Warnings" explicitly in your implementation plan.
`;
```

---

## 4. Consolidate Phase: Reward Signal

작업이 완료되면 성과를 측정하고 `agentdb`에 피드백을 줍니다.

```typescript
// libs/orchestrator/completion/handler.ts

async function finalizeTask(task: Task, result: TaskResult) {
  // 1. Calculate Reward based on outcomes
  let reward = result.success ? 1.0 : 0.0;
  
  // 2. Multi-tier Learning Loop (from RuVector)
  // - Instant: Micro-LoRA update (<1ms)
  // - Consolidated: ReasoningBank Pattern storage
  await agentdb.reasoningBank.storeTrajectory(task.trajectory, {
    task: task.description,
    reward: reward,
    metadata: { git_commit: task.commitHash }
  });
}
```

---

## 5. Session Resume (Hydration)

중단된 작업을 재개할 때, `agentdb`에서 "현재 상태"를 복원하는 로직입니다.

```typescript
// libs/memory/src/hydration.ts

async function hydrateSession(taskId: string) {
  // Get latest 5 verified facts
  const recentFacts = await agentdb.reflexion.search({
    task: taskId,
    limit: 5,
    sort: 'timestamp_desc'
  });

  return `
# 🔄 Session Resumed
Last known state (from Memory):
${recentFacts.map(f => `- ${f.content} (${f.metadata.source.type})`).join('\n')}

**Current Git State**: ${await git.getCurrentStatus()}
  `;
}
```