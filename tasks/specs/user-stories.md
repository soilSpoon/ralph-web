# User Stories

> 📌 Part of [PRD: Ralph Web Platform](../prd-ralph-web.md)

---

## US-001: 프로젝트 스캐폴딩

- **설명**: 사용자는 필요한 설정이 완료된 상태로 새로운 Ralph-Web 프로젝트를 초기화하고 싶어 합니다.
- **인수 조건**:
  - [ ] Next.js 앱이 정상 실행되어야 함.
  - [ ] `.worktrees` 디렉토리가 git ignore에 추가되어야 함.
  - [ ] 기본적인 UI 쉘이 작동해야 함.

---

## US-002: Git Worktree 격리 및 병합

- **설명**: 각 태스크는 독립된 Git Worktree에서 실행되어 충돌을 방지하고, 완료 후 안전하게 병합해야 합니다.
- **인수 조건**:
  - [ ] **태스크별 Worktree 생성**: `git worktree add .worktrees/{task-id} ralph/{branch-name}`.
  - [ ] **Worktree ↔ Metadata 연결**: `.worktrees/task-001/` ↔ `.ralph/tasks/task-001/` 매핑.
  - [ ] 작업 완료 후 Worktree를 정리(제거)할 수 있어야 함.
  - [ ] 에이전트는 할당된 Worktree 경로 내에서만 실행되어야 함.
  - [ ] **병렬 Worktree 관리**: 여러 Worktree 동시 존재 및 독립 실행.
  - [ ] 병합 충돌 시 AI가 해결을 시도하는 로직 포함.

  **File Preservation Patterns (emdash 기반)**:
  - [ ] Worktree 생성 시 메인 브랜치에서 환경 파일 자동 복사.
  - [ ] 기본 보존 파일: `.env`, `.env.*`, `.npmrc`, `config/local.*`.
  - [ ] 사용자 정의 패턴 지원: `.ralph/preserve-patterns.json`.
  - [ ] 프로덕션 시크릿 제외 옵션 (`.env.production` 등).
  - [ ] Worktree 삭제 시 보존 파일 백업 옵션.

---

## US-003: 에이전트 어댑터 구현

- **설명**: 개발자는 다양한 AI 도구를 표준화된 방식으로 호출하고 싶어 합니다.
- **인수 조건**:
  - [ ] `Agent` 인터페이스 정의 (`run(prompt, path)`).
  - [ ] `ClaudeAgent` 구현 (`claude` CLI 호출).
  - [ ] `AmpAgent` 구현 (추후 예정).
  - [ ] UI 스트리밍을 위한 stdout/stderr 캡처.

---

## US-004: Ralph Loop & Self-QA

- **설명**: 시스템은 재귀적인 "생각-코딩-검증" 사이클을 실행하며, 오류를 스스로 수정해야 합니다.
- **인수 조건**:
  - [ ] 상태 머신 구현 (시작 → 에이전트 실행 → 검증 → 재시도/완료).
  - [ ] `prd.json`을 통해 각 스토리의 상태 추적.
  - [ ] 테스트 실패 시 자동 재시도 로직 (Self-Correction).
  - [ ] 최대 반복 횟수(Max Iterations) 제한 적용.

---

## US-005: 확장된 미션 컨트롤 UI

- **설명**: 사용자는 단순 로그뿐만 아니라 프로젝트 전반을 관리하고 싶어 합니다.
- **인수 조건**:
  - [ ] 칸반 보드 (ToDo, In Progress, Review, Done) 구현.
  - [ ] 로드맵 & 아이데이션 탭 구현.
  - [ ] 인사이트(메모리) 탐색 탭 구현.
  - [ ] 실시간 상태 표시기 및 터미널 뷰어.

---

## US-006: 영속적 기억 (Memory Layer) - 하이브리드 아키텍처

- **설명**: 에이전트는 과거의 실수나 성공 패턴을 기억해야 합니다.
- **참조**: [Memory System Spec](./memory-system.md)
- **인수 조건**:

  **Phase 1 - 파일 기반 (MVP, Ralph 호환)**:
  - [ ] 작업 완료 시 `progress.txt`에 append-only 로그 기록.
  - [ ] **Codebase Patterns 섹션**: `progress.txt` 상단에 재사용 가능한 패턴 통합 관리.
  - [ ] **Thread URL 로깅**: 각 작업에 Amp/Claude 스레드 URL 기록.
  - [ ] **AGENTS.md 자동 업데이트**: 발견한 패턴을 해당 디렉토리의 AGENTS.md에 기록.
  - [ ] 새 작업 시작 시 Codebase Patterns 섹션 우선 참조.

  **Phase 2 - 하이브리드 확장 (Auto-Claude 스타일)**:
  - [ ] **SQLite 동기화**: 파일 → SQLite DB 자동 동기화.
  - [ ] **벡터 임베딩**: 패턴/인사이트 의미 기반 검색 지원.
  - [ ] **`get_context(subtask)`**: 관련 과거 패턴 자동 로드.
  - [ ] **Memory Explorer UI**: 저장된 패턴, gotchas, 인사이트 시각화.
  - [ ] **Fallback 보장**: DB 실패 시 파일 기반으로 자동 전환.

---

## US-007: Fresh Context 아키텍처

- **설명**: 각 반복은 깨끗한 컨텍스트의 새로운 AI 인스턴스여야 합니다 (Ralph의 핵심 철학).
- **인수 조건**:
  - [ ] 매 반복마다 새로운 에이전트 프로세스 생성 (컨텍스트 오염 방지).
  - [ ] 메모리는 오직 git history, `progress.txt`, `prd.json`을 통해서만 전달.
  - [ ] 단일 스토리는 하나의 컨텍스트 윈도우 내에서 완료 가능한 크기로 제한.
  - [ ] 컨텍스트 90% 도달 시 자동 핸드오프 지원 (대형 스토리 처리).

---

## US-008: 자동 아카이빙 시스템

- **설명**: 새로운 기능 작업 시작 시 이전 실행을 자동으로 백업해야 합니다.
- **인수 조건**:
  - [ ] `branchName` 변경 감지 시 이전 `prd.json`, `progress.txt` 자동 아카이빙.
  - [ ] 아카이브 폴더: `archive/YYYY-MM-DD-feature-name/`.
  - [ ] 아카이빙 후 새로운 `progress.txt` 초기화.
  - [ ] UI에서 과거 아카이브 조회 및 복원 기능.

---

## US-009: 브라우저 검증 통합 (dev-browser)

- **설명**: 프론트엔드 스토리는 반드시 브라우저에서 검증되어야 합니다.
- **인수 조건**:
  - [ ] UI 관련 스토리에 "Verify in browser" 조건 자동 추가.
  - [ ] dev-browser 스킬 호출하여 페이지 탐색 및 상호작용.
  - [ ] 스크린샷 캡처 및 progress 로그에 첨부.
  - [ ] 브라우저 검증 실패 시 스토리 미완료 처리.

---

## US-010: 완료 신호 및 종료 조건

- **설명**: 모든 스토리 완료 시 명확한 종료 신호가 필요합니다.
- **인수 조건**:
  - [ ] 모든 스토리 `passes: true` 시 `<promise>COMPLETE</promise>` 신호 출력.
  - [ ] 오케스트레이터가 완료 신호 감지 후 루프 종료.
  - [ ] 최대 반복 횟수 도달 시 타임아웃 처리 및 상태 리포트.

---

## US-011: 다중 태스크 병렬 관리 (Multi-Task Orchestration)

- **설명**: 여러 태스크를 동시에 실행하고 관리해야 합니다. **1 Task = 1 Ralph Loop = 1 Git Worktree** 원칙.
- **참조**: [Architecture Spec](./architecture.md)
- **인수 조건**:

  **태스크 격리 (Per-Task Isolation)**:
  - [ ] 각 태스크는 독립된 Git Worktree 보유 (`.worktrees/{task-id}/`).
  - [ ] 각 태스크는 독립된 메타데이터 디렉토리 보유 (`.ralph/tasks/{task-id}/`).
  - [ ] 각 태스크는 독립된 Ralph Loop 실행 (Fresh Context per iteration).
  - [ ] 에이전트는 Worktree 경로에서 실행, Metadata 경로의 prd.json/progress.txt 참조.

  **오케스트레이션 (Orchestration)**:
  - [ ] **중앙 상태 DB**: SQLite로 모든 태스크 상태 통합 관리 (`ralph.db`).
  - [ ] **병렬 실행 큐**: 최대 동시 실행 수 설정, 우선순위 기반 스케줄링.
  - [ ] **태스크 생명주기**: `pending` → `queued` → `running` → `review` → `merged` / `failed`.
  - [ ] **글로벌 패턴 공유**: 태스크 간 학습 내용은 `global-patterns.md`로 통합.
  - [ ] **충돌 감지**: 동일 파일 수정 시 태스크 간 충돌 경고.

  **동시성 제어 (Concurrency)**:
  - [ ] 설정 가능한 최대 동시 태스크 수 (기본값: 3).
  - [ ] 시스템 리소스(CPU/RAM) 모니터링 및 자동 조절.
  - [ ] API 속도 제한 고려한 태스크 스케줄링.

---

## US-012: 태스크 상태 데이터베이스 (Task State Database)

- **설명**: 파일 기반의 한계를 보완하기 위한 중앙 집중식 상태 관리.
- **참조**: [Database Schema](./database-schema.md)
- **인수 조건**:
  - [ ] SQLite DB 스키마 정의 (`ralph.db`).
  - [ ] 태스크 CRUD API (생성, 조회, 수정, 삭제).
  - [ ] 스토리 상태 실시간 동기화 (DB ↔ `prd.json`).
  - [ ] 태스크 필터링/정렬 (상태, 우선순위, 생성일).
  - [ ] DB 손상 시 파일 기반 복구 메커니즘.

---

## US-013: Spec Creation Pipeline (복잡도 기반)

- **출처**: Auto-Claude
- **설명**: 태스크 생성 시 복잡도에 따라 동적으로 Spec 생성 파이프라인을 조정합니다.
- **인수 조건**:

  **복잡도 판정**:
  - [ ] 태스크 설명 분석하여 자동 복잡도 분류 (SIMPLE/STANDARD/COMPLEX).
  - [ ] 사용자가 명시적으로 복잡도 오버라이드 가능.

  **파이프라인 단계**:
  - [ ] **SIMPLE (3단계)**: Discovery → Quick Spec → Validate
  - [ ] **STANDARD (6단계)**: Discovery → Requirements → Context → Spec → Plan → Validate
  - [ ] **COMPLEX (8단계)**: 전체 파이프라인 + Research + Self-Critique

  **출력물**:
  - [ ] `spec.md` - 기능 명세서
  - [ ] `requirements.json` - 구조화된 요구사항
  - [ ] `context.json` - 발견된 코드베이스 컨텍스트
  - [ ] `implementation_plan.json` - 서브태스크 기반 계획

---

## US-014: QA Loop (Reviewer → Fixer)

- **출처**: Auto-Claude
- **설명**: 구현 완료 후 자동으로 QA 검증 루프를 실행하여 품질을 보장합니다.
- **인수 조건**:

  **QA Reviewer**:
  - [ ] Acceptance Criteria 기반 자동 검증.
  - [ ] 빌드/테스트 실행 및 결과 분석.
  - [ ] `qa_report.md` 생성 (통과/실패 항목).
  - [ ] 프론트엔드 변경 시 E2E 테스트 수행 (US-017 연계).

  **QA Fixer**:
  - [ ] QA 실패 시 자동 수정 시도.
  - [ ] `QA_FIX_REQUEST.md` 기반 수정 수행.
  - [ ] 수정 후 재검증 루프.

  **루프 제어**:
  - [ ] 최대 QA 루프 횟수 설정 (기본: 3).
  - [ ] 루프 실패 시 사용자에게 에스컬레이션.

---

## US-015: Multi-Provider Registry

- **출처**: emdash
- **설명**: 20+ CLI 에이전트를 표준화된 인터페이스로 지원합니다.
- **인수 조건**:

  **Provider Definition**:
  - [ ] 각 Provider별 메타데이터 정의:
    - `id`, `name`, `cli`, `installCommand`
    - `autoApproveFlag`, `initialPromptFlag`, `resumeFlag`
    - `planActivateCommand`, `icon`
  - [ ] Provider 설치 상태 자동 감지.

  **지원 Provider (초기)**:
  - [ ] Claude Code (`@anthropic-ai/claude-code`)
  - [ ] Amp (`@sourcegraph/amp`)
  - [ ] Gemini (`@google/gemini-cli`)
  - [ ] Qwen Code (`@qwen-code/qwen-code`)

  **UI 통합**:
  - [ ] Provider 선택 드롭다운.
  - [ ] 설치되지 않은 Provider에 설치 안내 표시.
  - [ ] 태스크별 Provider 지정 가능.

---

## US-016: Sub-Chat/Session Resume

- **출처**: 1code
- **설명**: 하나의 Task 내에서 여러 시도(세션)를 관리하고 재개할 수 있습니다.
- **인수 조건**:

  **세션 관리**:
  - [ ] Task 내 다중 Sub-Chat 생성.
  - [ ] 각 Sub-Chat에 고유 `sessionId` 할당.
  - [ ] 세션별 메시지 히스토리 저장 (JSON).
  - [ ] 세션 모드 지정 (`plan` / `agent`).

  **세션 재개**:
  - [ ] 이전 세션 선택하여 대화 재개.
  - [ ] `sessionId` 기반 Claude SDK 세션 복원.
  - [ ] 이전 세션 결과 참조하여 컨텍스트 주입.

  **UI 통합**:
  - [ ] 세션 목록 사이드바.
  - [ ] 세션 간 전환 탭.
  - [ ] 세션 아카이브/삭제.

---

## US-017: E2E Testing Integration

- **출처**: Auto-Claude
- **설명**: QA 에이전트가 브라우저 자동화를 통해 UI를 검증합니다.
- **인수 조건**:

  **Playwright 통합**:
  - [ ] 프론트엔드 변경 감지 시 E2E 테스트 자동 트리거.
  - [ ] 스크린샷 캡처 및 저장.
  - [ ] 테스트 실패 시 상세 로그 제공.

  **테스트 명령**:
  - [ ] `click_by_text` - 텍스트로 요소 클릭.
  - [ ] `fill_input` - 입력 필드 채우기.
  - [ ] `verify_element` - 요소 존재 확인.
  - [ ] `take_screenshot` - 스크린샷 캡처.

  **US-009 확장**:
  - [ ] dev-browser 스킬과 E2E Testing 통합.
  - [ ] 스크린샷을 progress 로그에 자동 첨부.

---

## US-018: MCP 서버 상태 캐싱

- **출처**: 1code
- **설명**: MCP 서버 상태를 디스크에 캐시하여 앱 재시작 후에도 유지합니다.
- **인수 조건**:

  **캐시 메커니즘**:
  - [ ] MCP 서버별 상태 저장 (`running`, `failed`, `needs-auth`).
  - [ ] TTL 기반 자동 갱신 (기본: 5분).
  - [ ] 디스크 캐시 파일: `.ralph/cache/mcp-status.json`.

  **필터링**:
  - [ ] 실패한 서버 자동 필터링.
  - [ ] 인증 필요 서버 사용자에게 알림.
  - [ ] 캐시 만료 시 자동 재검사.

  **UI 통합**:
  - [ ] MCP 서버 상태 표시기.
  - [ ] 수동 새로고침 버튼.

---

## US-019: Issue Tracker 통합

- **출처**: emdash, Auto-Claude
- **설명**: Linear, Jira, GitHub Issues와 양방향 동기화합니다.
- **인수 조건**:

  **지원 플랫폼**:
  - [ ] **Linear**: API Key 인증, 이슈 가져오기/업데이트.
  - [ ] **Jira**: Site URL + Email + API Token 인증.
  - [ ] **GitHub Issues**: `gh auth login` 기반 인증.

  **동기화**:
  - [ ] 이슈 → Task 자동 변환.
  - [ ] Task 상태 변경 시 이슈 업데이트.
  - [ ] Task 완료 시 PR 링크 이슈에 첨부.

  **UI 통합**:
  - [ ] 이슈 목록 패널.
  - [ ] 이슈 선택하여 Task 생성.
  - [ ] 연결된 이슈 상태 배지.

---

## US-020: Security Model (3계층 보안)

- **출처**: Auto-Claude
- **설명**: 에이전트 실행 시 3계층 보안 모델을 적용하여 시스템을 보호합니다.
- **인수 조건**:

  **1계층: OS Sandbox**:
  - [ ] Bash 명령 격리 실행 환경.
  - [ ] 프로세스 리소스 제한 (CPU, 메모리, 시간).
  - [ ] 네트워크 접근 제어 (선택적).

  **2계층: Filesystem Permissions**:
  - [ ] 에이전트 작업은 Worktree 경로 내로 제한.
  - [ ] 프로젝트 루트 외 경로 접근 차단.
  - [ ] 민감 파일 접근 로깅 (`.env`, `.ssh/` 등).

  **3계층: Dynamic Command Allowlist**:
  - [ ] 프로젝트 스택 분석 (Node.js, Python, Go 등).
  - [ ] 스택별 허용 명령어 자동 생성.
  - [ ] 사용자 정의 허용/차단 목록 지원.
  - [ ] 보안 프로필 캐시: `.ralph/security-profile.json`.

  **위험 명령 처리**:
  - [ ] 위험 명령 실행 전 사용자 확인 요청.
  - [ ] `rm -rf`, `sudo`, `chmod 777` 등 기본 차단.
  - [ ] 보안 이벤트 로깅 및 알림.
