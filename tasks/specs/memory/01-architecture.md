# Memory System Architecture

## Unified Server Architecture

> **핵심**: Node.js 서버는 **컨트롤러(Controller)** 역할만 수행하며, 실제 인지/저장/검색/학습은 **AgentDB(Engine)**에 위임합니다.

---

## 1. System Components

### 1.1 The Brain: AgentDB (Native Integration)
우리는 `agentdb`를 라이브러리가 아닌 **능능적 인지 서비스**로 활용합니다.

*   **Backend**: `ruvector` (HNSW + SONA)
*   **ReasoningBank**: 궤적 학습 및 가중치 최적화
*   **Graph Engine**: Cypher 쿼리를 통한 실시간 영향도 분석

### 1.2 The Gatekeeper: Perception Layer
`agentdb` 앞단에서 입력을 정제하고 무결성을 보장합니다.

*   **CognifyService**: LLM을 사용하여 로그를 **Atomic Facts**로 변환 (대명사 제거).
*   **GitBinding**: 모든 기억에 커밋 해시 및 파일 지문을 강제 주입.

### 1.3 The Controller: Active Hook Layer
Ralph Loop의 각 단계에서 인지 엔진과 상호작용합니다.

*   **PreMortemHook**: 태스크 시작 전 실패 사례 경고 주입.
*   **GovernanceGate**: Jaccard 유사도 기반 순환 수정 방지.

---

## 2. Data Flow (The Active Loop)

```mermaid
sequenceDiagram
    participant Agent as CLI Agent
    participant Loop as Ralph Loop
    participant Kernel as Cognitive Kernel (Middleware)
    participant DB as AgentDB (Engine)

    Note over Agent, DB: [PRE-TASK] Active Injection
    Loop->>DB: searchPatterns(taskDesc, onlyFailures=true)
    DB-->>Loop: Anti-Patterns
    Loop->>Loop: Inject Pre-Mortem Warnings to Prompt

    Note over Agent, DB: [THINK] Impact Analysis
    Loop->>DB: graphQuery(targetFiles)
    DB-->>Loop: Dependent Components
    Loop->>Loop: Inject Impact Analysis to Prompt

    Note over Agent, DB: [CODE] Perception & Load
    Agent->>Kernel: Raw Logs ("Modified auth")
    Kernel->>Kernel: Cognify ("Added Bearer prefix to src/auth.ts")
    Kernel->>DB: storeEpisode(atomicFact, metadata)

    Note over Agent, DB: [VERIFY] Governance
    Loop->>Kernel: validateAction(proposedFix)
    Kernel->>Kernel: JaccardSimilarityCheck(current, history)
    alt Similarity > 0.3
        Kernel-->>Loop: REJECT (Circular Fix)
        Loop->>Agent: Force Strategy Pivot
    else Similarity <= 0.3
        Kernel-->>Loop: ALLOW
    end

    Note over Agent, DB: [COMPLETE] Reward Feed
    Loop->>DB: storeTrajectory(trajectory, reward)
```

---

## 3. Configuration Strategy

하드코딩을 피하고 `agentdb`의 설정을 최대한 활용합니다.

```typescript
// libs/memory/src/config.ts

export const MEMORY_CONFIG = {
  // AgentDB Native Settings
  agentDb: {
    path: "./.ralph/agentdb",
    vectorBackend: "ruvector",
    
    // 그래프 자동 인덱싱 (cognee 대체)
    graph: {
      enabled: true,
      autoIndex: {
        watch: ["./src"],
        ignore: ["**/*.test.ts", "dist/"],
        debounce: 1000
      }
    },

    // 망각 곡선 설정 (오래된 기억 감쇠)
    reasoning: {
      decayRate: 0.05, // 하루에 5%씩 점수 하락 (재사용 시 회복)
      minConfidence: 0.6
    }
  },

  // Perception Layer Settings
  perception: {
    model: "gemini-1.5-flash", // 빠르고 저렴한 모델 사용
    bufferInterval: 2000 // 2초 단위로 로그 번들링
  }
};
```