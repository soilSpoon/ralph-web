# Core User Stories (US-001 ~ US-012)

> 📌 Part of [User Stories](../user-stories.md)

Ralph 핵심 기능 사용자 스토리입니다.

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

## US-006: 영속적 기억 (Memory Layer)

- **설명**: 에이전트는 과거의 실수나 성공 패턴을 기억해야 합니다.
- **참조**: [Memory System Spec](./memory-system.md)
- **인수 조건**:

  **Phase 1 - 파일 기반 (MVP, Ralph 호환)**:
  - [ ] 작업 완료 시 `progress.txt`에 append-only 로그 기록.
  - [ ] **Codebase Patterns 섹션**: `progress.txt` 상단에 재사용 가능한 패턴 통합 관리.
  - [ ] 새 작업 시작 시 Codebase Patterns 섹션 우선 참조.

  **Phase 2 - 하이브리드 확장 (Auto-Claude 스타일)**:
  - [ ] **SQLite 동기화**: 파일 → SQLite DB 자동 동기화.
  - [ ] **벡터 임베딩**: 패턴/인사이트 의미 기반 검색 지원.
  - [ ] **Memory Explorer UI**: 저장된 패턴, gotchas, 인사이트 시각화.

---

## US-007: Fresh Context 아키텍처

- **설명**: 각 반복은 깨끗한 컨텍스트의 새로운 AI 인스턴스여야 합니다 (Ralph의 핵심 철학).
- **인수 조건**:
  - [ ] 매 반복마다 새로운 에이전트 프로세스 생성 (컨텍스트 오염 방지).
  - [ ] 메모리는 오직 git history, `progress.txt`, `prd.json`을 통해서만 전달.
  - [ ] 단일 스토리는 하나의 컨텍스트 윈도우 내에서 완료 가능한 크기로 제한.

---

## US-008: 자동 아카이빙 시스템

- **설명**: 새로운 기능 작업 시작 시 이전 실행을 자동으로 백업해야 합니다.
- **인수 조건**:
  - [ ] `branchName` 변경 감지 시 이전 `prd.json`, `progress.txt` 자동 아카이빙.
  - [ ] 아카이브 폴더: `archive/YYYY-MM-DD-feature-name/`.
  - [ ] UI에서 과거 아카이브 조회 및 복원 기능.

---

## US-009: 브라우저 검증 통합 (dev-browser)

- **설명**: 프론트엔드 스토리는 반드시 브라우저에서 검증되어야 합니다.
- **인수 조건**:
  - [ ] UI 관련 스토리에 "Verify in browser" 조건 자동 추가.
  - [ ] dev-browser 스킬 호출하여 페이지 탐색 및 상호작용.
  - [ ] 스크린샷 캡처 및 progress 로그에 첨부.

---

## US-010: 완료 신호 및 종료 조건

- **설명**: 모든 스토리 완료 시 명확한 종료 신호가 필요합니다.
- **인수 조건**:
  - [ ] 모든 스토리 `passes: true` 시 `<promise>COMPLETE</promise>` 신호 출력.
  - [ ] 오케스트레이터가 완료 신호 감지 후 루프 종료.
  - [ ] 최대 반복 횟수 도달 시 타임아웃 처리.

---

## US-011: 다중 태스크 병렬 관리

- **설명**: 여러 태스크를 동시에 실행하고 관리해야 합니다. **1 Task = 1 Ralph Loop = 1 Git Worktree** 원칙.
- **참조**: [Architecture Spec](./architecture.md)
- **인수 조건**:

  **태스크 격리**:
  - [ ] 각 태스크는 독립된 Git Worktree 보유.
  - [ ] 각 태스크는 독립된 메타데이터 디렉토리 보유.

  **오케스트레이션**:
  - [ ] **중앙 상태 DB**: SQLite로 모든 태스크 상태 통합 관리.
  - [ ] **병렬 실행 큐**: 최대 동시 실행 수 설정, 우선순위 기반 스케줄링.
  - [ ] **글로벌 패턴 공유**: 태스크 간 학습 내용은 `global-patterns.md`로 통합.

---

## US-012: 태스크 상태 데이터베이스

- **설명**: 파일 기반의 한계를 보완하기 위한 중앙 집중식 상태 관리.
- **참조**: [Database Schema](./database-schema.md)
- **인수 조건**:
  - [ ] SQLite DB 스키마 정의 (`ralph.db`).
  - [ ] 태스크 CRUD API (생성, 조회, 수정, 삭제).
  - [ ] 스토리 상태 실시간 동기화 (DB ↔ `prd.json`).
  - [ ] DB 손상 시 파일 기반 복구 메커니즘.
