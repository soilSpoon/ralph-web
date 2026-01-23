# Retrieval System & Context Budgeting

## 개요

검색 시스템은 단순히 데이터를 가져오는 것이 아니라, **한정된 토큰 예산(Token Budget) 안에서 최적의 정보를 구성하는 경제적 문제**입니다.
`claude-mem`의 **Context Accountant** 패턴을 도입하여 비용 효율적인 컨텍스트를 구성합니다.

---

## 1. Context Accountant (Token Economics)

에이전트에게 전달할 컨텍스트의 총량을 제어합니다.

```typescript
// libs/memory/src/retrieval/accountant.ts

export interface ContextBudget {
  total: number;       // e.g., 8000 tokens
  reserved: {
    system: number;    // System prompt
    task: number;      // Current task description
    files: number;     // Active file contents
  };
  // 남은 예산 = total - reserved
  availableForMemory: number; 
}

export class ContextAccountant {
  calculateCost(text: string): number {
    // Simple approximation: char length / 4
    return Math.ceil(text.length / 4);
  }

  allocate(budget: number, items: MemoryUnit[]): MemoryUnit[] {
    let used = 0;
    const selected: MemoryUnit[] = [];

    // 우선순위 정렬 (Confidence * Relevance)
    const sorted = items.sort((a, b) => b.score - a.score);

    for (const item of sorted) {
      const cost = this.calculateCost(JSON.stringify(item));
      if (used + cost <= budget) {
        selected.push(item);
        used += cost;
      } else {
        // 예산 초과 시 요약본(Summary) 시도 또는 스킵
        break;
      }
    }
    
    return selected;
  }
}
```

---

## 2. Retrieval Strategy (Priority Layers)

`claude-mem`의 전략을 참조하여, 정보의 종류에 따라 우선순위를 둡니다.

| 우선순위 | 종류 | 설명 | 출처 |
| :--- | :--- | :--- | :--- |
| **P1** | **Global Skills** | 검증된 성공 패턴. 가장 압축률이 높고 가치가 큼. | `ReasoningBank` |
| **P2** | **Project Rules** | 프로젝트별 컨벤션 및 금지 사항. | `Constitution` |
| **P3** | **Recent Errors** | 동일한 실수를 반복하지 않기 위한 최근 실패 기록. | `Reflexion (Failures)` |
| **P4** | **Similar Episodes** | 현재 태스크와 유사한 과거 사례. | `Reflexion (Vector)` |

### Retrieval Flow

```mermaid
graph TD
    Query[Query Task] --> Search
    
    subgraph Search [Parallel Search]
        S1[Search Patterns (P1)]
        S2[Load Constitution (P2)]
        S3[Search Failures (P3)]
        S4[Vector Recall (P4)]
    end
    
    S1 & S2 & S3 & S4 --> Candidates[Candidate Pool]
    
    Candidates --> Budgeter{Context Accountant}
    
    Budgeter -->|Fits Budget| Full[Full Content]
    Budgeter -->|Over Budget| Summary[Summarized View]
    
    Full & Summary --> Final[Prompt Context]
```

---

## 3. Timeline Rendering (Visual Context)

`claude-mem`은 검색 결과를 단순 나열하지 않고, **타임라인(Timeline)** 형태로 렌더링하여 시간적 인과관계를 보여줍니다.

```markdown
# 🧠 Memory Context (Timeline View)

## 📅 2026-01-20 (Project Setup)
- [PATTERN] Established `Next.js 14` directory structure.
- [DECISION] Selected `Tailwind CSS` over `Chakra UI` for performance.

## 📅 2026-01-22 (Auth Feature)
- [FAILURE] Encountered `JWT expired` error in Edge Runtime.
- [FIX] Switched to `jose` library (See: ReasoningPattern #42).

## 📅 Today (Current Context)
- [GOAL] Implement User Profile page.
- [WARNING] Remember to use `jose` for JWT handling (Derived from 2026-01-22).
```

---

## 4. Cognitive Gate (Verification)

검색된 정보가 현재 코드베이스와 모순되지 않는지 검증합니다.

```typescript
async function cognitiveGate(memories: MemoryUnit[]): Promise<MemoryUnit[]> {
  const validMemories = [];
  
  for (const mem of memories) {
    // 1. 파일 존재 여부 확인
    if (mem.citations.some(c => c.type === 'file' && !fileExists(c.path))) {
      // 파일이 삭제되었다면 이 기억은 낡은 것임 -> 제외
      continue;
    }
    
    // 2. 심볼 존재 여부 확인 (Optional)
    // ...
    
    validMemories.push(mem);
  }
  
  return validMemories;
}
```