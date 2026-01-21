# User Stories

> 📌 Part of [PRD: Ralph Web Platform](../prd-ralph-web.md)

---

## 상세 문서

| 문서                                         | 범위            | 설명                                 |
| -------------------------------------------- | --------------- | ------------------------------------ |
| [📄 Core Stories](./stories/core.md)         | US-001 ~ US-012 | Ralph 핵심 기능 스토리               |
| [📄 Extended Stories](./stories/extended.md) | US-013 ~ US-020 | 1code, Auto-Claude, emdash 확장 기능 |

---

## 스토리 요약 테이블

### Core Stories (Ralph 기반)

| ID     | 제목                       | Phase    |
| ------ | -------------------------- | -------- |
| US-001 | 프로젝트 스캐폴딩          | P0       |
| US-002 | Git Worktree 격리 및 병합  | P0       |
| US-003 | 에이전트 어댑터 구현       | P0       |
| US-004 | Ralph Loop & Self-QA       | P0       |
| US-005 | 확장된 미션 컨트롤 UI      | P1       |
| US-006 | 영속적 기억 (Memory Layer) | P0/P2/P3 |
| US-007 | Fresh Context 아키텍처     | P0       |
| US-008 | 자동 아카이빙 시스템       | P1       |
| US-009 | 브라우저 검증 통합         | P1       |
| US-010 | 완료 신호 및 종료 조건     | P0       |
| US-011 | 다중 태스크 병렬 관리      | P1       |
| US-012 | 태스크 상태 데이터베이스   | P1       |

### Extended Stories (1code, Auto-Claude, emdash 기반)

| ID     | 제목                        | Phase | 출처                |
| ------ | --------------------------- | ----- | ------------------- |
| US-013 | Spec Creation Pipeline      | P2    | Auto-Claude         |
| US-014 | QA Loop (Reviewer → Fixer)  | P1    | Auto-Claude         |
| US-015 | Multi-Provider Registry     | P2    | emdash              |
| US-016 | Sub-Chat/Session Resume     | P2    | 1code               |
| US-017 | E2E Testing Integration     | P2    | Auto-Claude         |
| US-018 | MCP 서버 상태 캐싱          | P2    | 1code               |
| US-019 | Issue Tracker 통합          | P3    | emdash, Auto-Claude |
| US-020 | Security Model (3계층 보안) | P1    | Auto-Claude         |

---

## Phase 매핑

| Phase                | 스토리                                                         |
| -------------------- | -------------------------------------------------------------- |
| **P0 (MVP)**         | US-001, US-002, US-003, US-004, US-006 Phase 1, US-007, US-010 |
| **P1 (Enhanced UX)** | US-005, US-008, US-009, US-011, US-012, US-014, US-020         |
| **P2 (Advanced)**    | US-006 Phase 2-3, US-013, US-015, US-016, US-017, US-018       |
| **P3 (Ecosystem)**   | US-019                                                         |
