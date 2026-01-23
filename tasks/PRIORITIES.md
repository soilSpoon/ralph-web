# Ralph-Web 개발 우선순위

> 📌 마지막 업데이트: 2026-01-23

---

## 현재 남은 작업 (세분화된 로드맵)

| 우선순위  | 작업                                 | 설명                                                    | 상태      |
| --------- | ------------------------------------ | ------------------------------------------------------- | --------- |
| 🚀 진행중 | **Phase 7: Agent Orchestrator**      | `node-pty` 기반 Provider 인터페이스 구현 및 Gemini 연결 | 🚧 진행중 |
| 🚀 진행중 | **Phase 8: Worktree Manager**        | `git worktree` 격리 환경 구축 및 환경 파일 링크         | 🚧 진행중 |
| 🚀 진행중 | **Phase 9: Active Cognitive Kernel** | **AgentDB Native + Active Hooks** (능동적 인지 엔진)    | 🚧 진행중 |
| 🏅 4순위  | **Phase 10: Queue Manager**          | 병렬 태스크 스케줄링 및 리소스 제어                     | ⏳ 대기   |
| 🏅 5순위  | **Phase 11: QA Loop (Smart & Fast)** | **Agent Booster + Adaptive Routing** (초고속 자동 수정) | ⏳ 대기   |
| 🎖️ 6순위  | **Phase 12: Multi-Provider**         | 다양한 에이전트 CLI 표준 어댑터 확장                    | ⏳ 대기   |
| 🎖️ 7순위  | **Authentication**                   | 인증 시스템 (가장 후순위)                               | ⏳ 대기   |

---

## 작업 요약

### Phase 9: Active Cognitive Kernel (Memory & Learning)

**목표**: 단순 DB를 넘어, 입력 정제(Cognify)와 능동적 제어(Active Hooks)를 갖춘 지능형 인지 엔진 구축.

- **Strategy**: `agentdb`의 Native 기능을 100% 활용하고, 시스템이 먼저 정보를 주입하는 **Push (Active)** 전략을 강화한다.
- **Key Components**:
  - **Cognify Middleware**: `SimpleMem` 스타일의 **Semantic Lossless Restatement** (대명사 제거, 절대 문맥 주입).
  - **Active Loop Hooks**: 태스크 시작 전 **Pre-Mortem** 경고 주입 및 완료 후 **Reward 기반 궤적 학습**.
  - **Circular Fix Detection**: `Auto-Claude` 스타일의 **Jaccard 유사도(Threshold 0.3)** 기반 무한 루프 차단.
  - **Impact Analysis**: `ruvector`의 **Cypher Query**를 활용하여 코드 수정 시 영향도를 자동으로 분석하여 프롬프트에 주입.

> **참조**: [Phase 9 상세 스펙](./specs/memory/00-overview.md)

---

### Phase 10: Queue Manager

**목표**: 병렬 태스크 스케줄링 및 리소스 제어

- 최대 동시 실행 수 설정
- 우선순위 기반 스케줄링
- **Integration**: Phase 9의 메모리를 조회하여, 과거 실패율이 높은 태스크의 우선순위를 조정하거나 리소스를 더 할당.

---

### Phase 11: QA Loop (Smart & Fast Fixer)

**목표**: 하이브리드 자동 수정 및 에러 피드백 루프

- **Fast Fixer**: `agent-booster` (Rust/WASM)를 사용하여 단순 린트/타입 에러 1ms 내 수정.
- **Smart Fixer**: 복잡한 로직 오류는 LLM 기반 수정.
- **Adaptive Routing**: `agentdb` 조회 결과에 따라 Fast/Smart Fixer로 자동 라우팅.
- **Integration**: 테스트 실패 시 `agentdb`에 **Negative Reward**를 기록하여 회피 경로 학습.
