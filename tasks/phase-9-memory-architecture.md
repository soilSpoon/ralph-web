# Phase 9: Active Cognitive Kernel

> **Status**: Ready for Implementation (2026-01-23 Updated)
> **Goal**: Build the Active Brain that Optimizes, Protects, and Learns.

## 1. Vision: The Active Kernel

우리는 단순한 RAG(검색) 시스템을 만드는 것이 아닙니다. 에이전트가 경험을 통해 배우고(Learning), 실수를 반복하지 않으며(Governance), 스스로의 지식을 정제(Cognify)하는 **"능동적 인지 커널(Active Cognitive Kernel)"**을 구축합니다.

이 커널은 **AgentDB(Engine)**와 **Ralph Middleware(Controller)**의 결합으로 이루어지며, 시스템이 먼저 정보를 주입하는 **Active Hook** 기반으로 동작합니다.

---

## 2. 핵심 차별화 포인트 (Benchmarked Insights)

### 2.1 Input: Semantic Lossless (from SimpleMem)
*   **Problem**: "그거 고쳤음" 식의 모호한 로그 저장.
*   **Solution**: **Cognify Middleware**가 대명사를 제거하고 절대 문맥을 주입하여 **Atomic Fact** 생성.

### 2.2 Safety: Jaccard Governance (from Auto-Claude)
*   **Problem**: A 수정 시 B가 깨지는 무한 수정 루프.
*   **Solution**: **CircularFixDetector**가 키워드 유사도(Jaccard > 0.3)를 검사하여 루프 발생 시 전략 변경(Pivot) 강제.

### 2.3 Context: Pre-Mortem Push (from Agentic-Flow)
*   **Problem**: 에이전트가 과거의 실패를 잊고 같은 실수를 반복.
*   **Solution**: 태스크 시작 전 `ReasoningBank`를 자동 조회하여 **실패 사례 경고**를 프롬프트 최상단에 주입.

### 2.4 Structure: Graph Impact Analysis (from RuVector)
*   **Problem**: 파일 수정이 프로젝트 전체에 미치는 영향 파악 불가.
*   **Solution**: **Cypher Query**를 통해 영향도 그래프를 탐색하고 에이전트에게 주의 사항 제공.

---

## 3. Core Components (상세 스펙)

| 문서 | 제목 | 핵심 내용 |
| :--- | :--- | :--- |
| **[00-Overview](./specs/memory/00-overview.md)** | **Strategy** | Active Kernel + Push & Pull 전략 |
| **[01-Architecture](./specs/memory/01-architecture.md)** | **System Design** | Engine(AgentDB) vs Controller 구조 |
| **[04-Governance](./specs/memory/04-governance.md)** | **Safety** | **Jaccard Similarity** & Strategy Pivot |
| **[05-ECL-Pipeline](./specs/memory/05-ecl-pipeline.md)** | **Input Gate** | **Semantic Lossless Restatement** 프롬프트 |
| **[07-Integration](./specs/memory/07-integration.md)** | **Loop Hooks** | **Pre-Mortem** & **Reward Feedback** 훅 |
| **[08-Implementation](./specs/memory/08-implementation.md)** | **Roadmap** | 단계별 구현 체크리스트 |

---

## 4. Next Steps

> **[08-Implementation](./specs/memory/08-implementation.md)** 문서에 따라 구현을 시작합니다.

1.  **Foundation**: `AgentDB` 설치 및 서비스 설정.
2.  **Middleware**: `Cognify` 재진술 파이프라인 구현.
3.  **Active Hooks**: Ralph Loop에 Pre-task/Post-task 연결.