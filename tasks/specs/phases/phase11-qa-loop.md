# Phase 11: QA Loop (Smart & Fast Fixer)

> 📌 Part of [Phase 7-13 구현 명세](../phases.md)
> **Goal**: 자동 테스트 및 수정 루프 (Agent Booster 기반 Fast Fixer 도입)

---

## 1. 개요

QA Loop는 구현된 기능이 요구사항을 충족하는지 검증하고, 오류 발생 시 자동으로 수정하는 **Self-Healing** 시스템입니다.
기존의 LLM 기반 수정 방식은 느리고 비싸기 때문에, **Rust/WASM 기반의 `agent-booster`를 도입하여 단순 에러를 1ms 내에 즉시 수정(Fast Fixer)**하고, 복잡한 논리적 오류만 LLM(Smart Fixer)에게 위임하는 **하이브리드 전략**을 사용합니다.

```mermaid
graph TD
    Build[Build & Test] -->|Error| Classifier{Error Type?}
    
    Classifier -->|Lint / Type / Syntax| FastFixer[⚡ Fast Fixer (Agent Booster)]
    Classifier -->|Logic / Runtime| SmartFixer[🧠 Smart Fixer (LLM)]
    
    FastFixer -->|Apply Edit (1ms)| Verify[Re-Verify]
    SmartFixer -->|Plan & Edit| Verify
    
    Verify -->|Pass| Success[✅ Complete]
    Verify -->|Fail| Retry{Retry Count < 3?}
    
    Retry -- Yes --> Classifier
    Retry -- No --> Escalate[🚨 Escalate to User]
```

---

## 2. Fast Fixer (`agent-booster`)

**`agent-booster`**는 LLM을 거치지 않고 코드 패턴 매칭(Template & Similarity)을 통해 즉시 코드를 변환하는 엔진입니다.

### 적용 대상 (Templates)
- **TypeScript Errors**: 타입 누락, 인터페이스 불일치 수정.
- **Syntactic Sugar**: `var` -> `const`, Arrow Function 변환.
- **Safety Checks**: Null Check 추가 (`if (!val) return`), Try-Catch 래핑.
- **Async/Await**: Promise 체이닝 변환.

### 구현 전략 (Adaptive Recommendation)
단순 정규식이 아닌, **AgentDB의 벡터 검색**을 통해 가장 적절한 Booster Template을 찾습니다.
*   **Logic**: "이 에러 로그는 과거 98% 확률로 'async_await_wrapper' 템플릿으로 해결됨" → Booster 실행.

---

## 3. Smart Fixer (LLM Agent)

Fast Fixer가 해결할 수 없는 복잡한 문제(로직 오류, 무한 루프, 비즈니스 로직 변경 등)를 처리합니다.

- **역할**: 에러 원인 분석 -> 수정 계획 수립 -> 코드 수정
- **Learning Integration**:
    - **ReasoningBank**를 조회하여 과거에 유사한 에러를 해결했던 패턴(Proven Fix)이 있는지 확인합니다.
    - 실패했던 접근 방식(Anti-Pattern)은 프롬프트에 "Avoid Constraints"로 주입됩니다.
- **도구**: `agentdb` (Reflexion & ReasoningBank).

---

## 4. Adaptive Routing 상세 Workflow

1.  **Test Execution**: `npm test` 또는 `npm run build` 실행.
2.  **Error Analysis**: stderr 파싱 및 에러 시그니처 생성.
3.  **Route (Adaptive)**:
    *   **Consult Memory**: `agentdb` 조회 -> "이 에러 패턴(Signature)에 대해 Fast Fixer가 성공한 적이 있는가?"
    *   **Decision**:
        *   **Fast Fixer**: 단순 패턴 에러이고, 과거 성공 사례가 있을 때 (1ms).
        *   **Smart Fixer**: 복잡한 에러이거나, **이전에 Fast Fixer로 해결을 시도했다가 실패했을 때** (LLM 호출).
4.  **Loop Control**: 최대 3회 재시도. 동일 에러 반복 시(Circular Fix) 중단 및 에스컬레이션.

---

## 5. 기대 효과

| 항목 | 기존 (LLM Only) | 개선 (Hybrid) |
| :--- | :--- | :--- |
| **수정 속도** | ~10초 | **~1ms (Fast Fix)** |
| **수정 비용** | ~$0.05 | **$0 (Fast Fix)** |
| **성공률** | 환각 가능성 있음 | **결정론적 수정 (100% 신뢰)** |

---

## 6. Implementation Checklist

- [ ] `agent-booster` 패키지 설치 및 WASM 바인딩.
- [ ] 에러 로그 파서 구현 (Lint/Type 에러 식별).
- [ ] Adaptive Routing 로직 구현 (`libs/orchestrator/qa/fixer.ts`).
- [ ] Playwright E2E 테스트 러너 통합.
