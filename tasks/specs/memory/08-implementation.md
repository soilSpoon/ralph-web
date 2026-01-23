# Implementation Roadmap (Phase 9)

> **Goal**: Build the Cognitive Kernel (AgentDB + Middleware)
> **Approach**: Native Integration + Strict Quality Control

---

## Step 1: Foundation Setup (AgentDB)
- [ ] **Dependency**: `bun add agentdb@alpha`
- [ ] **Service Config**: `libs/memory/src/config.ts`
    - [ ] `hyperbolic` 임베딩 공간 설정.
    - [ ] `cypher` 쿼리 엔진 활성화.
    - [ ] `./src`에 대한 `autoIndex` 설정.
- [ ] **Bootstrap Script**: `scripts/bootstrap-memory.ts` (초기 인덱싱).

## Step 2: Cognify Middleware (The Input Gate)
- [ ] **Types**: `libs/memory/src/types.ts`
    - [ ] `DiagnosisPattern` 및 `SolutionPattern` 인터페이스 정의.
    - [ ] `AtomicFact` 인터페이스 정의.
- [ ] **Cognify Agent**: `libs/memory/src/pipeline/cognify.ts`
    - [ ] "Semantic Lossless Restatement" 프롬프트 구현.
    - [ ] 규칙 적용: 대명사 금지, 절대 시간 주입, 컨텍스트 바인딩.
    - [ ] 이전 윈도우(Last 5 Facts) 기반 중복 방지 로직.

## Step 3: Retrieval & Token Budgeting (The Output Filter)
- [ ] **TokenBudgetManager**: `libs/memory/src/retrieval/budget.ts`
    - [ ] `allocateBudget(maxTokens)` 로직 구현.
    - [ ] 예산 초과 시 `uplift` 기반 기억 제거(Pruning) 기능.
- [ ] **Retrieval Service**: `libs/memory/src/retrieval/service.ts`
    - [ ] `agentdb.recall()`을 Budgeting 로직으로 래핑.

## Step 4: Governance & Loop Integration
- [ ] **Governance Service**: `libs/memory/src/governance/service.ts`
    - [ ] **Jaccard Similarity** 기반 `CircularFixDetector` 구현 (Threshold 0.3).
    - [ ] 3회 이상 중복 시 `Strategy Pivot` 지시문 생성.
- [ ] **Ralph Loop Hook**:
    - [ ] **Pre-task**: `ReasoningBank`에서 Anti-Patterns 조회 및 경고 주입.
    - [ ] **Think**: Cypher를 통한 영향도 분석 결과 주입.
    - [ ] **Code**: 로그 버퍼링 및 Cognify 처리.
    - [ ] **Verify**: Circular Fix 검사 실행.
    - [ ] **Complete**: `reward` 기반 궤적 저장 및 패턴 승격.

## Step 5: Verification
- [ ] **Test Case 1**: 재진술 검증 (로그: "고쳤음" -> 사실: "auth.ts 수정").
- [ ] **Test Case 2**: Trajectory 학습 검증 (유사한 에러 발생 시 과거의 성공 경로를 추천하는지).
- [ ] **Test Case 3**: Cypher 쿼리를 통한 종속성 탐색 정확도 확인.
