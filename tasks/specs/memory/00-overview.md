# Phase 9: Active Cognitive Kernel (Implementation Spec)

> **Status**: Ready for Implementation (2026-01-23 Updated)
> **Goal**: Build an Active Engine that Optimizes, Protects, and Learns.

## 1. Vision: The Active Kernel

우리는 `agentdb`를 단순한 수동 저장소(Passive RAG)가 아닌, **능동적인 인지 엔진(Active Cognitive Kernel)**으로 정의합니다.
이 커널은 에이전트가 "무엇을 할지" 고민하기 전에 필요한 지식을 **Push** 방식으로 먼저 주입하고, 에이전트의 실행 결과를 **Reward** 기반으로 학습하여 스스로 진화합니다.

---

## 2. 핵심 전략 (The Intelligence Loop)

우리는 데이터의 **정제(Perception)**, **보호(Governance)**, **가속(Booster)**을 아우르는 4계층 루프를 구축합니다.

```mermaid
graph TD
    subgraph "Layer 1: Perception & Cognify (SimpleMem)"
        Raw[Raw Logs] --> Cognify[Cognify Middleware]
        Cognify -->|Atomic Restatement| AtomicFacts[Atomic Facts]
    end

    subgraph "Layer 2: The Engine (AgentDB Native)"
        AtomicFacts --> AgentDB[(AgentDB)]
        
        AgentDB <--> ReasoningBank[ReasoningBank / SONA]
        Note right of ReasoningBank: Reward-based Trajectory Learning
        
        AgentDB <--> GraphIndex[Code Graph / Cypher]
        Note right of GraphIndex: Impact Analysis & Circular Detection
    end

    subgraph "Layer 3: Safety & Governance (Auto-Claude)"
        AgentDB -->|Loop Detected?| SafetyGate[CircularFixDetector]
        SafetyGate -->|Threshold > 0.3| Pivot[Strategy Pivot]
    end

    subgraph "Layer 4: Active Loop Integration"
        AgentDB -->|Pre-Mortem| Push[Active Injection]
        Push --> Agent[LLM Agent]
    end
```

---

## 3. Key Differentiators (벤치마킹 반영)

### 3.1 Push & Pull 하이브리드 전략
*   **Push (Active)**: 태스크 시작 전 `Pre-Mortem` (과거 실패 사례 경고) 및 `Impact Analysis` (영향도 분석) 결과를 프롬프트 최상단에 자동 주입.
*   **Pull (Passive)**: 일반적인 구현 패턴은 에이전트가 `consult_memory` 도구를 통해 필요할 때 직접 검색.

### 3.2 Multi-tier 학습 루프 (from RuVector)
*   **Instant Loop**: `Micro-LoRA` 수준의 즉각적인 런타임 적응.
*   **Consolidated Loop**: `ReasoningBank`에 성공/실패 궤적(Trajectory) 저장 및 패턴 승격.

### 3.3 Semantic Lossless Restatement (from SimpleMem)
*   모든 로그는 대명사가 제거된 **독립적인 사실(Atomic Facts)**로 변환되어 저장됨으로써 검색 정확도를 비약적으로 향상.

### 3.4 Jaccard Similarity Governance (from Auto-Claude)
*   에러 메시지와 수정 시도의 키워드 유사도를 계산하여 지능적으로 순환 수정을 차단.
