# 타입 안전성 강화 및 테스트 보완 계획

## 목표

- 프로젝트 전반의 타입 안전성 확보 (Loose typing, Type assertion 제거, Type guard 도입)
- 테스트 커버리지 확대 (E2E, Storybook, Unit)
- 빌드, 린트, 타입 체크, 테스트의 완전한 통과 (Zero warning)

## 분석 현황

- **타입 이슈**: `as` 키워드를 사용한 타입 단언이 다수 존재 (`lib/diff-highlighter.ts`, `actions.ts`, `kanban-board.tsx`).
- **테스트 이슈**:
  - `bun test` 일부 테스트(`dashboard.spec.ts`)가 DOM 환경 문제로 스킵됨.
  - `playwright` 환경 설정 문제(의존성 부족)로 실행 불가 가능성 있음.
  - Storybook 스토리가 부족함.
- **린트/포맷**: Biome 사용 중.

## 상세 계획

### Phase 1: 타입 안전성 강화 (Strict Type Safety)

타입 시스템을 속이지 않고 정직하게 선언하고 검증합니다.

1.  **`lib/diff-highlighter.ts` 리팩토링**
    - `as Root` 타입 단언 제거.
    - `shiki`의 반환 타입을 명확히 처리하거나, 타입 가드 함수 `isRoot(node)`를 구현하여 안전하게 캐스팅.
    - `Record<string, unknown>` 구체화.
2.  **`app/[locale]/actions.ts` 리팩토링**
    - `FormData` 처리에 `zod` 및 `zod-form-data` 도입.
    - `as string`, `as TaskStatus` 제거 및 유효성 검사 로직 추가.
3.  **DnD 타입 안전성 확보 (`kanban-board.tsx`)**
    - `@atlaskit` DnD의 `source.data`, `destination.data`에 대한 커스텀 타입 가드(`isTaskData`, `isColumnData`) 구현.
    - 런타임 검증을 통해 `as TaskStatus` 제거.

### Phase 2: 테스트 환경 및 커버리지 보완

1.  **Unit Test 환경 수정**
    - `tests/dashboard.spec.ts`의 `happy-dom`/`jsdom` 호환성 문제 해결 또는 클릭 이벤트 테스트 방식 변경.
    - `lib/diff-highlighter.ts`에 대한 유닛 테스트 추가.
2.  **Storybook 확장**
    - `DiffViewer` 스토리 추가 (Mock 데이터 활용).
    - `TaskCard`, `KanbanColumn`의 다양한 상태(Dragging, Hover 등) 스토리 추가.
3.  **E2E 테스트 시나리오 작성**
    - `tests/e2e/kanban.spec.ts`: 태스크 이동 시나리오.
    - `tests/e2e/review.spec.ts`: 리뷰 페이지 파일 트리 탐색 시나리오.
    - _Note_: CI/CD 환경에서의 실행을 보장하기 위해 Playwright 설정을 점검합니다.

### Phase 3: 최종 검증 (Verification)

다음 명령어가 모두 성공해야 함:

1.  `bun run check` (Biome Lint/Format)
2.  `bun run typecheck` (TypeScript `tsc --noEmit`)
3.  `bun run build` (Next.js Production Build)
4.  `bun test` (Unit Tests)

## 예상 결과물

- 수정된 소스 코드 (`lib/`, `components/`)
- 추가된 테스트 파일 (`*.test.tsx`, `*.spec.ts`, `*.stories.tsx`)
- Zero-warning 터미널 로그
