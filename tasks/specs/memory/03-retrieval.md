# Retrieval System: Causal Recall (Native)

## 개요

**Strategy**: `agentdb.recall()` Tuning (Native Only)
**Benchmark**: `ruvector` (Scoring) vs `memU` (Custom Resolver)

별도의 복잡한 "Conflict Resolver(JS)"를 구현하지 않습니다. (Reinvention 방지)
`agentdb`의 **Causal Recall** 엔진이 `uplift`(성공 기여도)와 `decay`(시간 감쇠)를 계산하여, **"최신이면서 성공적인"** 기억을 자연스럽게 상위에 랭크하도록 파라미터를 튜닝합니다.

---

## 1. Native Retrieval (AgentDB)

`agentdb`의 검색 API를 있는 그대로 활용합니다.
상충되는 정보(예: 구버전 라이브러리 사용법 vs 신버전 사용법)는 `score` 차이로 자연스럽게 해결됩니다.

```typescript
// libs/memory/src/retrieval/service.ts

interface RetrievalOptions {
  limit?: number;
  minScore?: number;
  taskContext?: string; // 현재 수행하려는 작업 설명
}

async function searchMemory(query: string, options: RetrievalOptions) {
  // AgentDB Native Call
  return await agentdb.recall(query, {
    // 1. Causal Strategy: 인과관계 고려 (성공한 기억 우대)
    strategy: "causal", 
    
    // 2. Parameters Tuning (경험적 수치)
    // 이 파라미터 조합이 "Conflict Resolution"의 핵심입니다.
    params: {
      alpha: 0.6, // Semantic: 관련성
      beta: 0.5,  // Uplift: 성공 보상 가중치 (실패한 기억은 점수 하락)
      gamma: 0.3, // Decay: 시간 감쇠 (오래된 기억은 점수 하락)
    },
    
    // 3. Filter
    filter: {
      // 프로젝트 범위 제한 (Global + Current Project)
      scope: ["global", `project:${currentProjectId}`],
      // 가설 단계의 기억은 제외 (검증된 것만)
      status: ["verified", "published"] 
    },
    
    // 4. Native Graph Consistency (Staleness Check 대체)
    // 현재 파일 시스템 그래프(autoIndex)에 존재하는 노드와 연결된 기억만 반환
    graph_consistency: true, 

    limit: options.limit || 5
  });
}
```

---

## 2. 망각 (Decay) 전략

별도의 Garbage Collection 스크립트를 돌리기보다, `agentdb`의 `retention` 설정을 활용합니다.

*   **Config**: `retention.policy = "uplift_based"`
*   **Logic**:
    *   조회되지 않고(Low Access),
    *   성공에 기여하지 못했거나(Low Reward),
    *   오래된(High Age) 기억은
    *   `agentdb`가 내부적으로 인덱스에서 제거합니다.