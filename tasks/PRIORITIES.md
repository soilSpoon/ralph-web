# Ralph-Web 개발 우선순위

> 📌 마지막 업데이트: 2026-01-21

---

## 현재 남은 작업 (세분화된 로드맵)

| 우선순위 | 작업                            | 설명                                                              | 상태      |
| -------- | ------------------------------- | ----------------------------------------------------------------- | --------- |
| 🥇 1순위 | **Phase 7: Agent Orchestrator** | `child_process` 기반 에이전트(Claude/Amp) 연결 및 실시간 스트리밍 | 🔄 진행중 |
| 🥈 2순위 | **Phase 8: Worktree Manager**   | `git worktree` 격리 환경 구축 및 환경 파일 링크                   | ⏳ 대기   |
| 🥉 3순위 | **Phase 9: Persistence (DB)**   | Drizzle ORM + SQLite 연동 및 상태 영속화                          | ⏳ 대기   |
| 🏅 4순위 | **Phase 10: Queue Manager**     | 병렬 태스크 스케줄링 및 리소스 제어                               | ⏳ 대기   |
| 🏅 5순위 | **Phase 11: QA Loop (Fixer)**   | 자동 테스트 연동 및 에러 피드백 루프                              | ⏳ 대기   |
| 🎖️ 6순위 | **Authentication**              | 인증 시스템 (가장 후순위)                                         | ⏳ 대기   |

---

## 작업 상세

### Phase 7: Agent Orchestrator

**목표**: 외부 코딩 에이전트(Claude Code, Amp 등)를 서버사이드에서 제어

- `child_process.spawn`을 통한 CLI 실행 환경 구축
- 실시간 로그 캡처 및 클라이언트 스트리밍
- 완료 신호(`<promise>COMPLETE</promise>`) 감지 로직

---

### Phase 8: Worktree Manager

**목표**: 태스크별 완전 격리된 작업 환경 제공

- `git worktree add/remove` 자동화
- 프로젝트 환경(.env, node_modules) 자동 심볼릭 링크
- 격리된 공간에서의 명령어 실행 (CWD 제어)

---

### Phase 9: Persistence & Data Layer

**목표**: 모든 상태를 SQLite에 영속화

- Drizzle ORM + SQLite (better-sqlite3) 설정
- `prd.json` 파일 데이터와 DB 동기화
- 태스크 이력(Iteration Logs) 저장

**기술 스택**:

- **ORM**: Drizzle ORM
- **Database**: SQLite (better-sqlite3)
- **스키마**: `tasks/specs/database-schema.md` 기반

**포함 엔티티**:

- `tasks` - 태스크 관리
- `stories` - 스토리 관리
- `patterns` - 패턴/컨벤션
- `iterations` - 반복 로그
- `sessions` - Sub-Chat 세션
- `providers` - 멀티 프로바이더
- `mcp_status` - MCP 상태 캐시
- `qa_reports` - QA 리포트

---

### Testing

**목표**: 테스트 환경 안정화 및 커버리지 확대

**범위**:

- bun test 환경 설정 개선
- 단위 테스트 보완
- E2E 테스트 (Playwright) 확장
- Storybook 테스트 안정화

---

### Authentication (후순위)

**목표**: 실제 인증 시스템 구현

**고려사항**:

- 로그인/회원가입 UI
- JWT 또는 세션 기반 인증
- 보호된 라우트
- 사용자 상태 관리

> ⚠️ **NOTE**: 인증은 가장 후순위로 작업합니다. Data Layer와 Testing이 완료된 후 진행합니다.
