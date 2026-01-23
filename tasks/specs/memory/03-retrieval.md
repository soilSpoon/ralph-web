# Memory Retrieval System

## 개요

검색 시스템은 **Progressive Disclosure** 패턴을 따르며, 토큰 예산을 효율적으로 관리합니다.

> [!IMPORTANT]
> **토큰은 예산이다**: 검색은 비용 할당 문제로 접근해야 함
>
> - 항상 저비용 요약을 먼저 반환
> - 필요시에만 상세 정보 확장
> - 진행 전 충분성 검사 필수

---

## Multi-View Indexing

모든 성공적인 시스템은 다중 인덱스를 사용합니다:

```
┌─────────────────────────────────────────────────────────────┐
│              CANONICAL MEMORY UNIT                           │
│   (atomic fact / episode / skill card / observation)        │
├──────────────┬──────────────┬──────────────┬───────────────┤
│   Semantic   │   Lexical    │   Symbolic   │  Relational   │
│   (Vector)   │  (BM25/FTS)  │  (Metadata)  │   (Graph)     │
└──────────────┴──────────────┴──────────────┴───────────────┘
```

### 검색 방법별 특성

| 방법         | 강점                   | 약점             | 사용 시점               |
| ------------ | ---------------------- | ---------------- | ----------------------- |
| **Semantic** | 개념적 유사성, 동의어  | 정확한 용어 놓침 | "인증 처리 방법"        |
| **Lexical**  | 정확한 매칭, 기술 용어 | 의미적 변형 놓침 | "JWT token", "useState" |
| **Symbolic** | 구조화된 필터링        | 유연성 부족      | 파일 경로, 커밋 해시    |
| **Hybrid**   | 상호 보완              | 가중치 튜닝 필요 | 대부분의 쿼리           |

---

## Progressive Disclosure (3-Layer)

### Layer 1: Index (~50 tokens/result)

**Semantic & Causal Search** (by `agentdb.recall`)

```typescript
search_memory: {
  description: "Search relevant memories with causal reasoning",
  parameters: {
    query: string;
    intent: 'how_to' | 'what_happened' | 'gotchas' | 'code_structure';
    alpha: number; // Similarity weight (0.7)
    beta: number;  // Uplift weight (0.2)
    limit?: number;
  },
  returns: {
    results: Array<{
      id: string;
      summary: string;
      utilityScore: number; // Relevance + Causal Impact
      type: string;
      citations: Citation[];
    }>;
    certificate: {
      completenessScore: number;
      redundancyRatio: number;
    }
  }
}
```

### Layer 2: Timeline (~150 tokens/result)

**Chronological Context** (by `agentdb.getRecentEpisodes`)

```typescript
get_timeline: {
  description: "Get chronological context around an observation",
  parameters: {
    observation_id: string;
    window?: number;  // days before/after
  },
  returns: Array<{
    id: string;
    task: string;
    reward: number;
    timestamp: string;
    relation: 'before' | 'after' | 'same_task';
  }>
}
```

### Layer 3: Details (~500 tokens/result)

**Deep Dive** (by `pglite.task_logs`)

```typescript
get_details: {
  description: "Fetch full logs and snapshots from staging DB",
  parameters: {
    task_id: string;
  },
  returns: Array<{
    id: string;
    full_content: string; // Raw logs, terminal outputs
    metadata: Record<string, unknown>;
    citations: Citation[];
    relatedEntries: string[];
  }>
}
```

---

## Retrieval Intent

쿼리 의도에 따라 검색 전략이 달라집니다:

```typescript
type RetrievalIntent =
  | "how_to_do" // Skills, patterns → 높은 confidence 우선
  | "what_happened" // Episodic, task-specific → 시간순
  | "known_issues" // Gotchas, failures → 파일/심볼 매칭
  | "environment" // Snapshots, state → 최신순
  | "code_structure"; // Symbols, relations → 이름 매칭

interface MemoryQuery {
  intent: RetrievalIntent;
  budget: { maxTokens?: number; maxResults?: number };
  requiresCitations: boolean;
  scope: "task" | "worktree" | "project" | "org";
}
```

---

## Sufficiency Checking (CausalRecall)

`agentdb`의 **Explainable Recall** 기능은 검색 결과와 함께 `certificate`를 반환합니다. 이를 통해 충분성을 판단합니다.

```typescript
// Usage in Think phase
async function ensureSufficiency(
  query: string,
  context: RetrievedContext,
): Promise<void> {
  const { certificate } = await agentdb.recall(query);

  if (certificate.completenessScore < 0.6) {
    // 1. 점수가 낮으면 더 넓은 범위(Layer 1 Expand) 검색
    const expanded = await agentdb.recall(query, {
      alpha: 0.5,
      beta: 0.5,
      limit: 20,
    });
    context.merge(expanded.results);

    // 2. 여전히 부족하면 Layer 2 (Timeline) 탐색 제안
    if (expanded.certificate.completenessScore < 0.7) {
      console.log("Suggestion: Check timeline context or request human input");
    }
  }
}
```

---

## MCP Tools Design

### Skill & Pattern Tools

```typescript
// Skill 조회
get_skill: {
  description: "Get structured skill profile for a topic",
  parameters: {
    topic: string;
  },
  returns: {
    topic: string;
    context: string;
    core_principles: string[];
    pitfalls: string[];
    implementation_guide: string;
    confidence: number;
    citations: Citation[];
  }
}

// Pattern 조회
search_patterns: {
  description: "Search successful patterns in project history",
  parameters: {
    query: string;
    limit?: number;
  },
  returns: Array<{
    title: string;
    description: string;
    example_code?: string;
    success_count: number;
  }>
}

// Gotcha 조회
search_gotchas: {
  description: "Search known issues and resolutions",
  parameters: {
    query: string;
    files?: string[];  // Filter by affected files
    limit?: number;
  },
  returns: Array<{
    title: string;
    description: string;
    resolution: string;
    occurrence_count: number;
    trigger_conditions: string[];
  }>
}
```

---

## Hybrid Search Implementation (Internal)

`agentdb`는 `search` 메서드 내부에서 HNSW(Vector)와 SQL(Keyword) 검색을 결합합니다. **우리는 별도의 로직을 구현할 필요 없이 `agentdb` API만 호출하면 됩니다.**

```typescript
// agentdb 내부 동작 원리 (참고용)
async function searchHybrid(query: string) {
  // 1. RuVector HNSW Search
  const semantic = await vectorBackend.search(queryEmbedding);

  // 2. Keyword Search (Optional if enabled)
  const lexical = await sqlBackend.searchFTS(query);

  // 3. Causal Re-ranking (Uplift Score)
  return causalRecall.rerank(semantic, lexical);
}
```

---

## Citation Contract

모든 검색 응답은 인용을 포함해야 합니다:

```typescript
type Citation =
  | { kind: "commit"; hash: string }
  | { kind: "file"; path: string; startLine?: number; endLine?: number }
  | { kind: "symbol"; id: string; name: string; file: string }
  | { kind: "terminal_snapshot"; id: string }
  | { kind: "log"; pointer: string };

interface RetrievalResult {
  content: string;
  citations: Citation[]; // REQUIRED - empty means uncited
  isCited: boolean; // Convenience flag
}

// Uncited content should be labeled as hypothesis
function formatForContext(result: RetrievalResult): string {
  if (!result.isCited) {
    return `[HYPOTHESIS] ${result.content}`;
  }
  return result.content;
}
```

---

## Token Budget Management

```typescript
interface TokenBudget {
  total: number;
  used: number;
  remaining: number;
  allocation: {
    constitution: number; // ~500-1000 tokens
    skills: number; // ~1000-2000 tokens
    context: number; // ~2000-4000 tokens
    codeSymbols: number; // ~500-1000 tokens
  };
}

async function hydrateContext(budget: TokenBudget): Promise<Context> {
  const context: Context = {};

  // Always load constitution (fixed cost)
  context.constitution = await loadConstitution();
  budget.used += estimateTokens(context.constitution);

  // Load skills within budget
  const skillBudget = Math.min(budget.remaining, budget.allocation.skills);
  context.skills = await loadRelevantSkills(skillBudget);
  budget.used += estimateTokens(context.skills);

  // Progressive loading for remaining budget
  if (budget.remaining > 1000) {
    context.recentGotchas = await loadRecentGotchas(budget.remaining / 2);
    // ...
  }

  return context;
}
```

---

## Complexity-Aware Retrieval

> **참조**: SimpleMem

모든 쿼리에 동일한 검색 깊이를 사용하는 것은 비효율적입니다. 쿼리 복잡도에 따라 동적으로 검색 깊이를 조절합니다.

### 쿼리 복잡도 측정

```typescript
interface QueryComplexity {
  score: number; // 0.0 ~ 1.0
  factors: {
    length: number; // 쿼리 길이
    entityCount: number; // 언급된 엔티티 수
    temporal: boolean; // 시간 참조 여부
    multiHop: boolean; // 추론 필요 여부
    scope: "narrow" | "broad";
  };
}

function calculateComplexity(query: string): QueryComplexity {
  const words = query.split(/\s+/);
  const entities = extractEntities(query);

  const factors = {
    length: Math.min(words.length / 20, 1),
    entityCount: Math.min(entities.length / 5, 1),
    temporal: hasTemporalReference(query),
    multiHop: requiresReasoning(query),
    scope: determineScopeWidth(query),
  };

  // 가중 평균 계산
  const score =
    0.2 * factors.length +
    0.25 * factors.entityCount +
    0.2 * (factors.temporal ? 1 : 0) +
    0.25 * (factors.multiHop ? 1 : 0) +
    0.1 * (factors.scope === "broad" ? 1 : 0);

  return { score, factors };
}

// 예시
// "JWT란?" → score: 0.1 (단순)
// "이 프로젝트의 인증 시스템 전체 아키텍처와 최근 3개월간 변경 이력" → score: 0.8 (복잡)
```

### 동적 검색 깊이

```typescript
interface DynamicRetrievalConfig {
  baseK: number; // 기본 결과 수 (10)
  delta: number; // 조절 계수 (3)
  minK: number; // 최소 결과 수 (5)
  maxK: number; // 최대 결과 수 (50)
}

function calculateDynamicK(
  complexity: QueryComplexity,
  config: DynamicRetrievalConfig = { baseK: 10, delta: 3, minK: 5, maxK: 50 },
): number {
  // k_dynamic = floor(k_base * (1 + delta * C_q))
  const k = Math.floor(config.baseK * (1 + config.delta * complexity.score));
  return Math.max(config.minK, Math.min(config.maxK, k));
}

// 예시 결과:
// 단순 쿼리 (C_q = 0.1): k = 10 * (1 + 3 * 0.1) = 13개
// 복잡 쿼리 (C_q = 0.8): k = 10 * (1 + 3 * 0.8) = 34개
```

### 적응형 검색 워크플로우

```typescript
async function adaptiveSearch(
  query: string,
  options: SearchOptions = {},
): Promise<SearchResult> {
  // 1. 복잡도 측정
  const complexity = calculateComplexity(query);

  // 2. 동적 K 계산
  const k = calculateDynamicK(complexity);

  // 3. 복잡도에 따른 검색 전략 선택
  const strategy = selectStrategy(complexity);

  // 4. 검색 실행
  let results: MemoryEntry[];

  switch (strategy) {
    case "simple":
      // 단순 쿼리: semantic만
      results = await semanticSearch(query, k);
      break;

    case "standard":
      // 표준 쿼리: hybrid search
      results = await hybridSearch(query, k);
      break;

    case "complex":
      // 복잡 쿼리: hybrid + graph traversal
      results = await hybridSearch(query, k);
      const expanded = await expandWithGraph(results);
      results = [...results, ...expanded];
      break;
  }

  // 5. 결과 토큰 예산 확인
  const tokenEstimate = estimateResultTokens(results, complexity);

  return {
    results,
    metadata: {
      complexity: complexity.score,
      strategy,
      resultCount: results.length,
      estimatedTokens: tokenEstimate,
    },
  };
}

function selectStrategy(
  complexity: QueryComplexity,
): "simple" | "standard" | "complex" {
  if (complexity.score < 0.3) return "simple";
  if (complexity.score < 0.7) return "standard";
  return "complex";
}
```

### 토큰 예산과 복잡도 연계

```typescript
function estimateResultTokens(
  results: MemoryEntry[],
  complexity: QueryComplexity,
): number {
  // 복잡한 쿼리일수록 더 상세한 결과 필요
  const detailLevel = complexity.score > 0.5 ? "detailed" : "summary";

  const tokensPerResult = detailLevel === "detailed" ? 500 : 100;

  return results.length * tokensPerResult;
}
```
