# Implementation Roadmap (Phase 9)

> **Goal**: Build a Self-Evolving Memory System
> **Timeline**: 3 Weeks (Estimated)

---

## Phase 9.1: Cognify Middleware (The "Input" Layer) - Week 1
**목표:** 쓰레기 데이터 방지 및 고품질 로그 수집 체계 구축 (SimpleMem 기반).

### 1. LogBuffer Implementation
- [ ] `libs/memory/src/pipeline/buffer.ts`: `LogBuffer` 클래스 구현 (Window size: 10).
- [ ] `libs/memory/src/pipeline/types.ts`: `RawLogEntry`, `AtomicFact` 인터페이스 정의.

### 2. Cognify Agent
- [ ] `prompts/cognify.md`: Disambiguation 프롬프트 작성 (SimpleMem 스타일).
- [ ] `libs/memory/src/pipeline/cognify.ts`: LLM 호출 및 JSON 파싱 로직 구현.
- [ ] **Test**: 모호한 로그("그거 고쳐줘")를 주입하여 구체적 사실로 변환되는지 단위 테스트.

---

## Phase 9.2: Cognitive Engine (The "Storage" Layer) - Week 2
**목표:** `agentdb` 연결 및 데이터 영속화 (memU 출처 관리 포함).

### 1. AgentDB Setup
- [ ] `bun add agentdb` (Latest Alpha).
- [ ] `libs/memory/src/engine.ts`: `RalphMemoryService` 래퍼 구현 (Singleton).
- [ ] `agentdb.createDatabase()` 초기화 및 `ruvector` 백엔드 연결.

### 2. Schema Integration
- [ ] `metadata` 필드에 `Citation` 스키마 강제 적용 로직 추가.
- [ ] `Loader`: Cognify된 데이터를 `agentdb.reflexion` 및 `agentdb.reasoningBank`로 라우팅하는 로직 구현.

---

## Phase 9.3: Context Budgeter (The "Output" Layer) - Week 3
**목표:** 토큰 경제성을 고려한 지능형 검색 (claude-mem 기반).

### 1. Context Accountant
- [ ] `libs/memory/src/retrieval/accountant.ts`: `calculateCost` 및 `allocate` 함수 구현.
- [ ] **Prioritization Logic**: Skills -> Recent -> Old 순으로 예산 할당 알고리즘 구현.

### 2. Timeline Renderer
- [ ] `libs/memory/src/retrieval/renderer.ts`: 메모리 객체를 Markdown Timeline 포맷으로 변환.
- [ ] **Integration**: Ralph Loop의 `Think Phase`에 검색 결과 주입.

---

## Checklist for Start

- [ ] `agentdb` 패키지 설치 확인.
- [ ] Gemini API Key (Cognify용 Fast Model) 준비.
- [ ] `LogBuffer` -> `Cognify` -> `Loader` 흐름 설계 검토 완료.