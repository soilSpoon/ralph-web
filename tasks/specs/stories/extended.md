# Extended User Stories (US-013 ~ US-020)

> 📌 Part of [User Stories](../user-stories.md)

1code, Auto-Claude, emdash 분석에서 도출된 확장 기능 사용자 스토리입니다.

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
  - [ ] 각 Provider별 메타데이터 정의 (`id`, `name`, `cli`, `autoApproveFlag`).
  - [ ] Provider 설치 상태 자동 감지.

  **지원 Provider (초기)**:
  - [ ] Claude Code, Amp, Gemini, Qwen Code

  **UI 통합**:
  - [ ] Provider 선택 드롭다운.
  - [ ] 태스크별 Provider 지정 가능.

---

## US-016: Sub-Chat/Session Resume

- **출처**: 1code
- **설명**: 하나의 Task 내에서 여러 시도(세션)를 관리하고 재개할 수 있습니다.
- **인수 조건**:

  **세션 관리**:
  - [ ] Task 내 다중 Sub-Chat 생성.
  - [ ] 각 Sub-Chat에 고유 `sessionId` 할당.
  - [ ] 세션별 메시지 히스토리 저장.

  **세션 재개**:
  - [ ] 이전 세션 선택하여 대화 재개.
  - [ ] `sessionId` 기반 Claude SDK 세션 복원.

  **UI 통합**:
  - [ ] 세션 목록 사이드바.
  - [ ] 세션 간 전환 탭.

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
  - [ ] `click_by_text`, `fill_input`, `verify_element`, `take_screenshot`

---

## US-018: MCP 서버 상태 캐싱

- **출처**: 1code
- **설명**: MCP 서버 상태를 디스크에 캐시하여 앱 재시작 후에도 유지합니다.
- **인수 조건**:

  **캐시 메커니즘**:
  - [ ] MCP 서버별 상태 저장 (`running`, `failed`, `needs-auth`).
  - [ ] TTL 기반 자동 갱신 (기본: 5분).
  - [ ] 디스크 캐시 파일: `.ralph/cache/mcp-status.json`.

  **UI 통합**:
  - [ ] MCP 서버 상태 표시기.
  - [ ] 수동 새로고침 버튼.

---

## US-019: Issue Tracker 통합

- **출처**: emdash, Auto-Claude
- **설명**: Linear, Jira, GitHub Issues와 양방향 동기화합니다.
- **인수 조건**:

  **지원 플랫폼**:
  - [ ] Linear, Jira, GitHub Issues

  **동기화**:
  - [ ] 이슈 → Task 자동 변환.
  - [ ] Task 상태 변경 시 이슈 업데이트.
  - [ ] Task 완료 시 PR 링크 이슈에 첨부.

  **UI 통합**:
  - [ ] 이슈 목록 패널.
  - [ ] 연결된 이슈 상태 배지.

---

## US-020: Security Model (3계층 보안)

- **출처**: Auto-Claude
- **설명**: 에이전트 실행 시 3계층 보안 모델을 적용하여 시스템을 보호합니다.
- **인수 조건**:

  **1계층: OS Sandbox**:
  - [ ] Bash 명령 격리 실행 환경.
  - [ ] 프로세스 리소스 제한 (CPU, 메모리, 시간).

  **2계층: Filesystem Permissions**:
  - [ ] 에이전트 작업은 Worktree 경로 내로 제한.
  - [ ] 민감 파일 접근 로깅 (`.env`, `.ssh/` 등).

  **3계층: Dynamic Command Allowlist**:
  - [ ] 프로젝트 스택 분석하여 허용 명령어 자동 생성.
  - [ ] 위험 명령 (`rm -rf`, `sudo`) 기본 차단.
