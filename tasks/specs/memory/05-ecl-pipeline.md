# ECL Pipeline (Extract → Cognify → Load)

## 개요

**Source Inspiration**: `SimpleMem` (Semantic Lossless Restatement)

데이터 품질의 핵심은 **"모호성 제거(De-referencing)"**입니다. 
`Cognify` 단계에서 모든 대명사를 없애고, 상대 시간을 절대 시간으로 변환하여, 로그 하나만 떼어놓고 봐도 완벽하게 이해할 수 있는 **Atomic Fact**로 만듭니다.

---

## 1. Cognify Strategy (The Input Gate)

### 1.1 The "No Pronoun" Rule (SimpleMem 스타일)

프롬프트 엔지니어링의 핵심은 모델에게 "요약해줘"가 아니라 **"재진술(Restate)해줘"**라고 요청하는 것입니다.

*   ❌ **Bad (Summary)**: "He fixed the auth bug." (누가? 무슨 버그?)
*   ✅ **Good (Restatement)**: "The agent `claude-code` fixed the `InvalidTokenError` in `src/lib/auth.ts` by adding a Bearer prefix check."

### 1.2 핵심 변환 규칙 (F_θ Transformation)
1.  **Coreference Resolution (Φ_coref)**: 모든 대명사(it, that, he, she)를 실제 엔티티 명칭으로 교체.
2.  **Temporal Anchoring (Φ_time)**: "yesterday", "now" 등을 절대 날짜와 시간(`2026-01-23T14:00`)으로 변환.
3.  **Environment Binding**: 현재 Git Commit Hash, 작업 중인 파일 경로, 태스크 ID를 문장 내에 명시적으로 포함.

### 1.3 Pipeline Steps

1.  **Raw Stream**: 에이전트의 stdout/stderr 및 파일 변경 이벤트를 수집.
2.  **Buffering**: 2~5초 단위 또는 문맥(Context) 단위로 로그 버퍼링.
3.  **Context Injection**: 중복 저장을 막기 위해 **최근 저장된 5개의 Atomic Facts**를 프롬프트에 로드.
4.  **Cognify (LLM)**: `SimpleMem` 스타일 프롬프트를 사용하여 Atomic Fact로 변환.
    *   Input: Raw Logs + Current Context + Metadata
    *   Output: JSON List of Atomic Facts
5.  **Load**: `agentdb`에 저장하며 Vector Indexing 및 Graph Linking 수행.

---

## 2. Prompt Strategy (See `prompts/memory/cognify.md`)

구체적인 프롬프트는 별도 파일로 관리하여 버전을 제어합니다.
핵심 요구사항:
1.  **Semantic Lossless**: 기술적 세부사항(에러 코드, 변수명) 유지.
2.  **Absolute Context**: 상대적 표현 제거.
3.  **Intent/Outcome Separation**: 시도한 것과 결과를 분리.
4.  **Density Optimization**: 중복된 정보는 필터링하여 토큰 효율성 극대화.
