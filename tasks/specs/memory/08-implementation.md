# Implementation Roadmap

## 개요

Phase 9는 거버넌스를 먼저 구축한 후 점진적으로 기능을 확장하는 방식으로 진행합니다.

> [!IMPORTANT]
> **Phase 9A (거버넌스)가 반드시 먼저 완료되어야 합니다.**
> 거버넌스 없이 스키마를 확장하면 병렬 에이전트로 인한 데이터 손상이 발생합니다.

---

## Phase Breakdown

```
Week 1: Foundation & Governance (Staging vs Published)
Week 2: Retrieval & Intelligence (3-Layer + SkillLibrary)
Week 3: Optimization & Causal Learning (Graph + NightlyLearner)
```

---

## Phase 9A: Memory Governance (Foundation)

**목표**: Staging(pglite)과 Published(agentdb)를 분리하여 안전한 메모리 쓰기 보장

### Checklist

- [ ] `npm install agentdb@alpha` & `drizzle-orm` 설정
- [ ] Staging Schema: `task_logs`, `terminal_snapshots` (pglite)
- [ ] Published Schema: `agentdb` Reflexion/Skill tables
- [ ] **Promotion Pipeline**: Verify Success → `agentdb.storeEpisode()`
- [ ] Scope hierarchy: `worktree` → `task` → `project`

### Deliverables

| 파일                                      | 설명                   |
| ----------------------------------------- | ---------------------- |
| `libs/memory/src/store/interface.ts`      | MemoryStore 인터페이스 |
| `libs/memory/src/store/sqlite.ts`         | SQLite 구현체          |
| `libs/memory/src/governance/scope.ts`     | 스코프 관리            |
| `libs/memory/src/governance/promotion.ts` | 승격 파이프라인        |
| `libs/memory/src/governance/dedupe.ts`    | 중복 제거              |

### SQL Migrations

```sql
-- 001_memory_events.sql
CREATE TABLE memory_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    agent_id TEXT,
    task_id TEXT,
    worktree_id TEXT,
    scope TEXT DEFAULT 'task',
    created_at TEXT DEFAULT (datetime('now'))
);

-- 002_observations.sql
CREATE TABLE observations (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES memory_events(id),
    content TEXT NOT NULL,
    scope TEXT DEFAULT 'task',
    supersedes_id TEXT,
    deprecated_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
```

---

## Phase 9B: Progressive Retrieval

**목표**: `agentdb` 기반 토큰 효율적 3단계 검색 시스템

### Checklist

- [ ] Layer 1 (Semantic): `agentdb.reflexion.retrieveRelevant()`
- [ ] Layer 2 (Temporal): `agentdb.getRecentEpisodes()`
- [ ] Layer 3 (Detail): `drizzle.staging_logs.select()` (필요 시 원본 조회)
- [ ] Sufficiency checking with `CausalRecall` utility score
- [ ] Intent-based routing (Skill vs Pattern vs Episode)

### Deliverables

| 파일                                       | 설명            |
| ------------------------------------------ | --------------- |
| `libs/memory/src/retrieval/search.ts`      | 하이브리드 검색 |
| `libs/memory/src/retrieval/progressive.ts` | 3단계 검색      |
| `libs/memory/src/retrieval/sufficiency.ts` | 충분성 검사     |
| `apps/mcp-server/src/tools/memory.ts`      | MCP 도구        |

### MCP Tools

```typescript
// search_memory - Layer 1
// get_timeline - Layer 2
// get_details - Layer 3
// get_skill
// search_patterns
// search_gotchas
```

---

## Phase 9C: ECL Pipeline

**목표**: 원시 데이터를 구조화된 메모리로 변환

### Checklist

- [ ] Extract: logs, commits, terminal snapshots
- [ ] Cognify: atomic facts (SimpleMem rules—coreference, temporal anchoring)
- [ ] Load: embeddings + lexical index
- [ ] Skill extraction (memU-style consolidation)

### Deliverables

| 파일                                       | 설명            |
| ------------------------------------------ | --------------- |
| `libs/memory/src/pipeline/extract.ts`      | 데이터 수집     |
| `libs/memory/src/pipeline/cognify.ts`      | 변환 로직       |
| `libs/memory/src/pipeline/load.ts`         | 저장 및 인덱싱  |
| `libs/memory/src/pipeline/orchestrator.ts` | 파이프라인 조율 |

---

## Phase 9D: Code Indexing

**목표**: 코드베이스 구조 인덱싱

### Checklist

- [ ] Code entities with stable IDs
- [ ] Incremental updates keyed by commit
- [ ] Relations table (calls, extends, imports, uses)
- [ ] TypeScript parser (LSP fallback to AST)

### Deliverables

| 파일                                  | 설명             |
| ------------------------------------- | ---------------- |
| `libs/memory/src/code/parser.ts`      | TypeScript 파서  |
| `libs/memory/src/code/graph.ts`       | 코드 그래프 관리 |
| `libs/memory/src/code/incremental.ts` | 증분 업데이트    |
| `apps/mcp-server/src/tools/code.ts`   | MCP 도구         |

### MCP Tools

```typescript
// search_code
// get_code_relations
// index_codebase
```

---

## Phase 9E: Patterns, Gotchas, Confidence

**목표**: 성공/실패 패턴 학습 및 신뢰도 관리

### Checklist

- [ ] Auto-Claude style separation (insight/pattern/gotcha/outcome)
- [ ] Confidence scoring (0-1)
- [ ] Validation signals from Verify loop (tests passed, PR merged)
- [ ] Circular fix detection

### Deliverables

| 파일                                   | 설명           |
| -------------------------------------- | -------------- |
| `libs/memory/src/knowledge/pattern.ts` | 패턴 추출      |
| `libs/memory/src/knowledge/gotcha.ts`  | Gotcha 관리    |
| `libs/memory/src/trust/confidence.ts`  | 신뢰도 계산    |
| `libs/memory/src/trust/circular.ts`    | 순환 수정 감지 |

---

## Phase 9F: Evaluation + Pruning

**목표**: 검색 품질 평가 및 보존 정책

### Checklist

- [ ] Golden queries per project
- [ ] Retrieval regression checks
- [ ] Retention policies per entry kind
- [ ] Size-based + time-based pruning (emdash-style)

### Deliverables

| 파일                                     | 설명           |
| ---------------------------------------- | -------------- |
| `libs/memory/src/eval/golden.ts`         | 골든 쿼리 평가 |
| `libs/memory/src/eval/regression.ts`     | 회귀 검사      |
| `libs/memory/src/lifecycle/retention.ts` | 보존 정책      |
| `libs/memory/src/lifecycle/pruning.ts`   | 정리 작업      |

---

## Prioritized Action Items

### 🔴 P0: Must Do First (Foundation)

| #   | Action                                                 | Effort | Impact   |
| --- | ------------------------------------------------------ | ------ | -------- |
| 1   | Implement staging vs published write governance        | M      | Critical |
| 2   | Add `memory_events` append-only table                  | M      | High     |
| 3   | Define citation contract + enforce in tools            | S-M    | High     |
| 4   | Implement sufficiency checking                         | S-M    | High     |
| 5   | MemoryStore abstraction with SQLite+sqlite-vec default | M      | High     |

### 🟡 P1: High Impact for Team/Enterprise

| #   | Action                                  | Effort | Impact |
| --- | --------------------------------------- | ------ | ------ |
| 6   | Confidence scoring + validation signals | M      | High   |
| 7   | Contradiction/supersession semantics    | M      | High   |
| 8   | Circular fix detection                  | M      | High   |
| 9   | Terminal snapshots on failure           | M      | Medium |
| 10  | Entry kind policies (decay, retention)  | M      | Medium |

### 🟢 P2: Nice to Have

| #   | Action                                 | Effort | Impact  |
| --- | -------------------------------------- | ------ | ------- |
| 11  | Golden queries evaluation harness      | M      | Medium  |
| 12  | Memory Explorer UI                     | L      | Medium  |
| 13  | Neo4j integration (defer until needed) | L      | Low now |
| 14  | Cross-project knowledge sharing        | L      | Low now |

---

## Future Phases

### Phase 10A: Memory Explorer UI

- Visualize memory entries by type/scope/time
- Manual promotion/deprecation
- Confidence adjustment
- Search debugging

### Phase 10B: Enterprise Features (Optional)

- Neo4j integration when graph queries become dominant
- Cross-org knowledge sharing
- Advanced multi-tenancy
- Compliance/audit logging

---

## Dependencies

### External Packages

```json
{
  "dependencies": {
    "better-sqlite3": "^9.0.0",
    "sqlite-vec": "^0.1.0",
    "drizzle-orm": "^0.29.0",
    "openai": "^4.0.0"
  }
}
```

### Internal Dependencies

```
libs/memory
├── depends on: libs/sim-toolkit (config, types)
├── depends on: libs/ai (embedding generation)
└── depends on: apps/mcp-server (tool registration)
```

---

## Testing Strategy

### Unit Tests

```typescript
describe("MemoryStore", () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new InMemoryMemoryStore();
  });

  it("should save and search observations", async () => {
    await store.saveObservation({ content: "test", scope: "task" });
    const results = await store.searchSemantic("test");
    expect(results).toHaveLength(1);
  });

  it("should enforce scope hierarchy", async () => {
    // task scope 항목은 project scope에서 보이지 않음
  });
});
```

### Integration Tests

```typescript
describe("ECL Pipeline", () => {
  it("should extract atomic facts from logs", async () => {
    const logs = [
      /* mock logs */
    ];
    const facts = await cognifyPipeline.toAtomicFacts(logs, []);
    expect(facts[0].content).not.toContain("he"); // 대명사 해소 확인
  });
});
```

### E2E Tests

```typescript
describe("Memory in Ralph Loop", () => {
  it("should hydrate context on session start", async () => {
    const session = await startSession({ taskDescription: "auth bug" });
    expect(session.context.skills).toContainEqual(
      expect.objectContaining({ topic: "authentication" }),
    );
  });
});
```

---

## Rollout Plan (3-Week Sprint)

1. **Week 1: Governance & Foundation**
   - `agentdb` 설치 및 Drizzle 연동
   - Staging(pglite) 스키마 정의 및 로깅 훅 구현
   - Promotion(승격) 로직 구현

2. **Week 2: Retrieval & Intelligence**
   - 3단계 검색 MCP 도구 구현 (`search_memory`, `get_timeline`, `get_details`)
   - SkillLibrary 연동 및 자동화
   - 1차 통합 테스트

3. **Week 3: Causal Learning & Final Polish**
   - Causal Graph 연동 (실패 원인 분석)
   - NightlyLearner 설정 (자동 패턴 발견)
   - 최종 벤치마크 및 문서화
