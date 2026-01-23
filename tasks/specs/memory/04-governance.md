# Memory Governance & Safety (Cognitum Gate)

## 개요

**Source Inspiration**: `RuVector` (Cognitum Gate), `Auto-Claude` (Circular Detection & Jaccard Similarity)

기존의 "LLM에게 다시 물어보는" 방식은 느리고 비용이 많이 들며, LLM 자체의 환각 가능성이 있습니다.
우리는 `ruvector`의 **Cognitum Gate**를 활용하여 수학적으로 증명된 안전장치를 구축하고, `Auto-Claude` 스타일의 **Jaccard 유사도 검사**를 통해 무한 루프를 원천 차단합니다.

---

## 1. Cognitum Gate (Mathematical Safety)

**원리**: Min-Cut 알고리즘을 사용하여 지식 그래프 내의 **논리적 모순(Contradiction)**을 탐지합니다.
새로운 기억이나 행동이 기존의 확립된 사실(Verified Facts)과 모순될 경우, Gate가 닫히며 행동이 거부됩니다.

### 1.1 Implementation Concept

```typescript
// libs/memory/src/governance/gate.ts
import { agentdb } from '../service'; 

const gate = agentdb.governance.createGate();

async function validateAction(action: AgentAction, context: Context) {
  // 1. Check for Logical Contradictions (Math-based)
  const coherence = await gate.evaluate({
    action: action,
    context: context,
    witnesses: await agentdb.getVerifiedFacts() 
  });

  if (!coherence.permitted) {
    throw new Error(`Safety Gate Blocked: ${coherence.reason}`);
  }

  return true;
}
```

---

## 2. Circular Fix Detection (Jaccard Similarity)

**원리**: 에이전트가 유사한 실패를 반복하는 것을 막기 위해, **현재 시도의 키워드 집합**과 **과거 실패 이력의 키워드 집합** 간의 유사도를 계산합니다.

### 2.1 Jaccard 유사도 알고리즘 (Auto-Claude 스타일)
*   **알고리즘**: `J(A, B) = |A ∩ B| / |A ∪ B|`
*   **Threshold**: 유사도가 **0.3 (30%)** 이상이면 순환 수정 시도로 간주.
*   **데이터**: 에러 메시지 + 에이전트가 제안한 `Fix Strategy` 키워드.

### 2.2 Native Graph Cycle Detection

```typescript
// libs/orchestrator/safety/circular.ts

async function checkCircularFix(taskId: string, proposedFix: FixStrategy) {
  // 1. Jaccard Similarity Check (Auto-Claude Logic)
  const attempts = await agentdb.history.getRecentAttempts(taskId, 3);
  const currentKeywords = extractKeywords(proposedFix);
  
  for (const prev of attempts) {
    const similarity = calculateJaccard(currentKeywords, prev.keywords);
    if (similarity > 0.3) {
      return {
        allowed: false,
        reason: "Circular Fix Detected (Jaccard Similarity > 0.3)",
        history: prev.action
      };
    }
  }

  // 2. Graph-based Cycle Detection (AgentDB Native)
  const cycle = await agentdb.graph.detectCycle({
    taskId: taskId,
    node: proposedFix
  });

  return cycle.detected ? { allowed: false, reason: "Graph Cycle Detected" } : { allowed: true };
}
```

---

## 3. Strategy Pivot (강제 전략 변경)

순환 수정이 감지될 경우, 시스템은 에이전트에게 단순히 "다시 시도해"가 아닌 **명시적인 Pivot 지시**를 내립니다.
*   **Instruction**: "You have tried X and Y multiple times. DO NOT use these patterns. Try a DIFFERENT approach (e.g., use a different library, simplify the logic, or check the caller function)."