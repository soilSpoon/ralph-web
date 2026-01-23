# Phase 9: 자기 진화형 계층적 메모리 시스템 (Self-Evolving Hierarchical Memory Architecture)

> **Core Philosophy:** "Memory is not just storage; it is active cognition."
> 메모리는 단순한 저장소가 아니라, 에이전트가 사용자를 이해하고 성장하는 '능동적 인지 체계'여야 합니다.

## 1. 개요 (Overview)

기존의 단순 벡터 검색(RAG) 방식의 한계(문맥 손실, 정적 데이터)를 극복하기 위해, **SimpleMem(원자적 사실화)**, **memU(계층적 구조 & 출처 증명)**, **ruvector(학습형 인덱스)**, **cognee(그래프 연결)**의 핵심 원리를 통합한 새로운 메모리 아키텍처를 `ralph-web`에 도입합니다.

특히, 바퀴를 다시 발명하지 않고 **`agentdb`의 강력한 내장 기능(ReasoningBank, CausalGraph, GNN)**을 전적으로 활용하여 구현 복잡도를 낮추고 성능을 극대화합니다.

### 핵심 목표
1.  **명확성 (Disambiguation - SimpleMem):** 로그 수집 단계부터 모호함을 제거하여 "누가, 언제, 무엇을"을 명확히 하는 **구조화된 로깅(Structured Logging)**을 적용합니다.
2.  **출처 증명 (Provenance - memU):** 모든 지식은 그 출처(대화, 파일, 커밋)로 연결되는 역추적 링크를 가집니다. ("너 왜 그렇게 생각하니?" -> "이 대화 때문입니다.")
3.  **자기 진화 (Self-Evolution - agentdb):** `ReasoningBank`와 `GNN`을 활용하여 성공적인 사고 패턴을 스스로 학습하고 강화합니다.
4.  **범위 구분 (Scoping):** 사용자 공통 기억(Global)과 프로젝트별 기억(Project)을 명확히 구분하여 문맥 오염을 방지합니다.

---

## 2. 아키텍처 (Architecture)

시스템은 정보의 흐름에 따라 3단계 레이어로 구성되며, **agentdb**가 핵심 인지 엔진 역할을 수행합니다.

```mermaid
graph TD
    UserInput[User Input / Event] --> Perception
    
    subgraph Perception [Layer 1: Perception & Cognify]
        P1[De-ambiguation] -->|Structured Log| P2[Fact Extraction]
        P2 --> P3{Scope Classifier}
        P3 -->|Universal Rule| Global[Global Memory]
        P3 -->|Project Fact| Project[Project Memory]
    end
    
    Perception --> Structuring
    
    subgraph Structuring [Layer 2: Storage & Structure (agentdb)]
        S1[(Reflexion Memory)] <--> S2[(ReasoningBank)]
        S2 <--> S3[(Causal Graph)]
        S1 & S2 & S3 -->|Indexing| VectorDB[RuVector]
    end
    
    Structuring --> Retrieval
    
    subgraph Retrieval [Layer 3: Retrieval & Provenance]
        R1[Context Analysis] --> R2{Adaptive Search}
        R2 -->|Query| R3[Hybrid Search]
        R3 --> R4[Provenance Linking]
        R4 -->|Merge| Output[Context + Citations]
    end
    
    UserAction[User Feedback] --> Management
    
    subgraph Management [Layer 4: Active Consolidation]
        M1[Idle Time] --> M2[Clustering]
        M2 --> M3[Generalization]
        M3 -->|Promote| S2
    end
```

---

## 3. 상세 설계 (Detailed Design)

### Layer 1: Perception (지각 및 인지) - **SimpleMem Style Logging**
**Insight from `SimpleMem`**

로그를 남기는 시점부터 모호성을 제거해야 나중에 쓸모 있는 기억이 됩니다. 
`ralph-web`의 모든 로깅 시스템을 **SimpleMem 스타일**로 표준화합니다.

*   **De-ambiguation (모호성 제거):**
    *   ❌ Bad: "그거 고쳐줘" (로그 시점의 문맥 소실)
    *   ✅ Good: "`User` requested fix for `auth_module` error `ERR_401` at `2026-01-23`."
*   **Structured Logging Format:**
    *   모든 로그는 `Actor`, `Action`, `Target`, `Reasoning`, `Context`를 포함한 JSON 객체로 기록합니다.
    *   상세 내용은 `specs/memory/05-ecl-pipeline.md` 참조.

### Layer 2: Structuring (저장 및 구조화) - **agentdb 활용**
**Insight from `agentdb` & `agentic-flow`**

직접 DB 스키마를 짜는 대신, `agentdb`의 검증된 컨트롤러를 사용합니다.

#### 2.1 Core Entities (Mapped to agentdb)

1.  **`Reflexion Memory` (Episodic):**
    *   개별 사건, 시도, 결과 기록.
    *   **Trajectory Branching:** 선택되지 않은 대안(Alternatives)도 함께 저장하여 "왜 그 방법을 안 썼는지" 학습.
2.  **`ReasoningBank` (Semantic/Patterns):**
    *   성공한 사고 과정과 패턴을 저장.
    *   `agentdb`의 GNN이 유사한 상황에서 성공 패턴을 추천.
3.  **`Causal Graph` (Relations):**
    *   사건 간의 인과 관계(Caused, Solved, Relates_to)를 그래프로 연결.

#### 2.2 Active Consolidation (능동적 통합)
*   **Nightly Learner:** 에이전트가 유휴 상태일 때, 파편화된 `Reflexion` 기억들을 분석하여 일반화된 `Skill`이나 `Pattern`으로 승격(Promotion)시킵니다.
*   **Generalization:** 특정 프로젝트의 변수명/경로를 템플릿화하여 범용 지식으로 변환합니다.

### Layer 3: Retrieval & Learning (회상 및 학습)

*   **Adaptive Retrieval:** `SimpleMem`의 복잡도 인식 검색을 도입하여, 간단한 질문엔 Index만, 복잡한 질문엔 Full Content를 제공합니다.
*   **Cognitive Gate:** 검색된 지식이 현재 코드베이스와 모순되지 않는지 검증(Witness Check)하여 환각을 방지합니다.

### Layer 4: Provenance & UX (출처 증명) - **New**
**Insight from `memU`**

사용자의 신뢰를 얻기 위해 모든 기억의 출처를 투명하게 공개합니다.

*   **Citation System:**
    *   모든 `Semantic Node`(지식)는 하나 이상의 `Citation`(출처)을 가집니다.
    *   출처 타입: `Conversation`(대화 링크), `Commit`(코드 변경), `File`(파일 위치), `Terminal`(실행 로그).
*   **"Why?" Interface:**
    *   사용자가 에이전트의 판단에 의문을 가질 때, 근거가 된 메모리 원본을 보여줍니다.

---

## 4. UI/UX 전략 (Visualization & Control)

### 4.1 Provenance View (출처 역추적)
*   **기능:** 에이전트가 답변 시, 참조한 메모리 카드를 함께 표시합니다.
*   **인터랙션:** 메모리 카드를 클릭하면, 해당 메모리가 생성된 시점의 **타임라인(Timeline)**으로 이동하여 전후 맥락을 확인할 수 있습니다.

### 4.2 Knowledge Graph Explorer
*   **Visual Map:** `agentdb`의 Causal Graph를 시각화하여 지식의 연결 고리를 보여줍니다.
*   **Scope Coloring:** Global(파랑) vs Project(초록) 노드를 구분하여 보여줍니다.

---

## 5. 구현 로드맵 (Implementation Roadmap)

### Step 1: Foundation (agentdb 통합)
*   [ ] `agentdb` 설치 및 초기화 (`agentdb.createDatabase`).
*   [ ] **SimpleMem 스타일 로깅 포맷 정의 및 적용 (P0).**

### Step 2: Perception Pipeline
*   [ ] 로그 수집기를 `agentdb.reflexion`에 연결.
*   [ ] Trajectory Recorder 구현 (대안 포함 수집).

### Step 3: Retrieval & Provenance
*   [ ] **Citation Contract** 구현 (출처 없는 지식은 `hypothesis` 상태로 격리).
*   [ ] Cognitive Gate (현재 코드와 모순 검사) 구현.

### Step 4: Active Consolidation
*   [ ] 유휴 시간 백그라운드 작업 스케줄러 구현.
*   [ ] Generalization (일반화) 로직 구현.

---

## 6. 기대 효과 (Expected Outcome)

*   **Trust:** "근거 있는" 답변을 통해 에이전트에 대한 사용자 신뢰도 상승.
*   **Efficiency:** `agentdb` 활용으로 복잡한 그래프/벡터 로직 구현 비용 절감.
*   **Evolution:** 사용할수록 똑똑해지는(Self-Learning) 메모리 시스템 구축.
