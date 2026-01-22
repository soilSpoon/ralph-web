# Ralph-Web 개발 우선순위

> 📌 마지막 업데이트: 2026-01-22

---

## 현재 남은 작업 (세분화된 로드맵)

| 우선순위 | 작업                            | 설명                                                    | 상태    |
| -------- | ------------------------------- | ------------------------------------------------------- | ------- |
| ✅ 완료  | **Phase 7: Agent Orchestrator** | `node-pty` 기반 Provider 인터페이스 구현 및 Gemini 연결 | ✅ 완료 |
| ✅ 완료  | **Phase 8: Worktree Manager**   | `git worktree` 격리 환경 구축 및 환경 파일 링크         | ✅ 완료 |
| 🥉 3순위 | **Phase 9: Persistence (DB)**   | Drizzle ORM + SQLite 연동 및 상태 영속화                | ⏳ 대기 |
| 🏅 4순위 | **Phase 10: Queue Manager**     | 병렬 태스크 스케줄링 및 리소스 제어                     | ⏳ 대기 |
| 🏅 5순위 | **Phase 11: QA Loop (Fixer)**   | 자동 테스트 연동 및 에러 피드백 루프                    | ⏳ 대기 |
| 🎖️ 6순위 | **Phase 12: Memory Graph**      | 벡터 임베딩 기반 지능형 지식 탐색                       | ⏳ 대기 |
| 🎖️ 7순위 | **Phase 13: Multi-Provider**    | 다양한 에이전트 CLI 표준 어댑터 확장                    | ⏳ 대기 |
| 🎖️ 8순위 | **Authentication**              | 인증 시스템 (가장 후순위)                               | ⏳ 대기 |

---

## 상세 문서

**📄 [Phase 7-13 구현 상세](./specs/phases.md)** - 각 Phase별 코드 스니펫 및 구현 체크리스트

---

## 작업 요약

### Phase 7: Agent Orchestrator

**목표**: 외부 코딩 에이전트(Claude Code, Amp 등)를 서버사이드에서 제어

- `child_process.spawn`으로 CLI 실행
- 실시간 로그 스트리밍 (SSE)
- 완료 신호 감지

> **참조**: 1code - tRPC + Claude SDK 통합

---

### Phase 8: Worktree Manager

**목표**: 태스크별 완전 격리된 작업 환경 제공

- `git worktree add/remove` 자동화
- 환경 파일 보존 (`.env`, `.npmrc`)

> **참조**: emdash - WorktreeService 파일 보존 패턴

---

### Phase 9: Persistence & Data Layer

**목표**: 모든 상태를 SQLite에 영속화

- Drizzle ORM + SQLite (better-sqlite3)
- 앱 시작 시 auto-migrate

> **참조**: emdash/1code - Drizzle 스키마 패턴

---

### Phase 10: Queue Manager

**목표**: 병렬 태스크 스케줄링 및 리소스 제어

- 최대 동시 실행 수 설정
- 우선순위 기반 스케줄링

---

### Phase 11: QA Loop (Fixer)

**목표**: 자동 테스트 연동 및 에러 피드백 루프

- QA Reviewer → QA Fixer → 재검증 루프
- Playwright E2E 테스트 통합

> **참조**: Auto-Claude - QA 에이전트 패턴

---

### Phase 12: Memory Graph

**목표**: Graphiti 스타일 그래프 메모리

- 벡터 임베딩 기반 시맨틱 검색
- 세션 인사이트 자동 추출

> **참조**: Auto-Claude - Graphiti 메모리 시스템

---

### Phase 13: Multi-Provider

**목표**: 20+ CLI 에이전트 표준 어댑터 지원

| Provider    | CLI      | Auto-Approve                     |
| ----------- | -------- | -------------------------------- |
| Claude Code | `claude` | `--dangerously-skip-permissions` |
| Gemini      | `gemini` | `--yolomode`                     |
| Qwen        | `qwen`   | `--yolo`                         |
| + 17개 이상 | ...      | ...                              |

> **참조**: emdash - Provider 레지스트리 (20+ providers)

---

### Testing

- bun test 환경 개선
- E2E 테스트 (Playwright) 확장

---

### Authentication (후순위)

- JWT/세션 기반 인증
- Data Layer 완료 후 진행

> ⚠️ 가장 후순위 작업
