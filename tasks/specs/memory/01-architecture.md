# Memory System Architecture

## 개요

Memory System은 다양한 환경(Personal → Team → Enterprise)에서 동작하며, 일관된 인터페이스를 통해 다양한 스토리지 백엔드를 지원합니다.

---

## 환경별 권장 조합

```

```

┌─────────────────────────────────────────────────────────────────────────┐
│ SELECTED STACK │
├─────────────────┬─────────────────┬─────────────────┬───────────────────┤
│ Component │ Technology │ Role │ Notes │
├─────────────────┼─────────────────┼─────────────────┼───────────────────┤
│ **Staging DB** │ pglite (Drizzle)│ Source of Truth │ App State & Logs │
│ **Cognitive DB**│ agentdb (RuVector)│ Source of Wisdom│ Memory & Learning │
│ **Embeddings** │ all-MiniLM-L6-v2│ Semantic Vector │ Local & Fast │
└─────────────────┴─────────────────┴─────────────────┴───────────────────┘

````

---

## 관계형 DB 비교

| DB             | 장점                                   | 단점                          | 비용     | 추천 환경          |
| -------------- | -------------------------------------- | ----------------------------- | -------- | ------------------ |
| **SQLite**     | 가볍고 빠름, 파일 1개, FTS5 지원       | 동시 쓰기 제한, 네트워크 불가 | 무료     | Personal (Node)    |
| **pglite**     | Postgres 호환, 브라우저 지원, tsvector | WASM 느림 (~15MB), 확장 제한  | 무료     | Personal (Browser) |
| **PostgreSQL** | 풀기능, 동시성, 하이브리드 쿼리        | 서버 필요                     | 무료     | Team, Enterprise   |
| **Supabase**   | Postgres + 호스팅 + Auth               | 종속성, 무료티어 제한         | 무료티어 | 빠른 프로토타입    |
| **Turso**      | SQLite 호환, Edge 분산                 | 상대적으로 새로움             | 무료티어 | Edge/분산 환경     |

---

| Vector DB      | 장점                                                              | 단점                        | 추천 환경          |
| :------------- | :---------------------------------------------------------------- | :-------------------------- | :----------------- |
| **agentdb**    | **150x Faster (RuVector)**, 에이전트 특화 패턴, ACID, Zero-Config | 신규 기술                   | **Personal, Team** |
| **pgvector**   | Postgres 통합, SQL로 하이브리드 쿼리                              | 대규모(100M+) 성능 제한     | Team, Enterprise   |
| **sqlite-vec** | SQLite 통합, 초경량                                               | 기능 제한, 인덱스 옵션 적음 | (Deprecated)       |
| **Pinecone**   | 완전 관리형, 확장성                                               | 종속, 비용 높음             | 관리 부담 최소화   |

---

## Graph DB 비교

| Graph DB       | 장점                                  | 단점                      | 비용               | 추천 환경           |
| -------------- | ------------------------------------- | ------------------------- | ------------------ | ------------------- |
| **Neo4j**      | 가장 성숙, Cypher 쿼리, 풍부한 생태계 | 무거움, CE 기능 제한      | **유료** (CE 무료) | Enterprise (필요시) |
| **FalkorDB**   | Redis 기반, 빠름, Cypher 호환         | 상대적으로 덜 성숙        | 무료               | 그래프 필요시       |
| **LadybugDB**  | 임베디드 그래프, 가벼움               | 문서 부족                 | 무료               | 임베디드 환경       |
| **PostgreSQL** | 관계를 JSONB/테이블로 모델링          | 복잡한 그래프 쿼리 어색함 | 무료               | 단순 관계           |

> [!TIP]
> **핵심 원칙**: Graph DB는 **복잡한 관계 탐색이 정말 필요할 때만** 추가.
> 대부분의 관계는 PostgreSQL의 `JSONB` + `RECURSIVE CTE`로 충분.

---

## Neo4j 도입 시점

다음 조건이 충족될 때만 도입:

- 3-6+ hop 탐색이 핵심 UX 기능
- 그래프 알고리즘 (centrality, community) 필요
- Cross-project/org 관계 추론 대규모 필요

그 전까지: `code_entities` + `code_relations` 테이블로 충분

---

### `agentdb` Integration

`agentdb`는 자체적으로 `createDatabase()` 팩토리를 제공하며 백엔드(RuVector, HNSW, SQLite)를 자동 선택합니다. 우리는 이를 감싸는 `RalphMemoryService`를 구현합니다.

```typescript
// libs/memory/src/service.ts

export class RalphMemoryService {
  private agentdb: AgentDB;
  private reflexion: ReflexionMemory;
  private skills: SkillLibrary;

  constructor(config: MemoryConfig) {
    this.agentdb = createDatabase(config.path);
    // ... initialize controllers
  }

  // ECL Pipeline: Staging -> Published
  async promoteToMemory(taskId: string): Promise<string> {
    // 1. pglite에서 Staging 로그 조회
    const logs = await this.drizzle.query.stagingLogs({ taskId });

    // 2. Cognify (Summarize & Critique)
    const critique = await this.llm.critique(logs);

    // 3. Load to agentdb
    return this.reflexion.storeEpisode({
      task: logs.taskDescription,
      critique,
      // ...
    });
  }
}
````

### Preset Configurations

```typescript
const PRESETS = {
  personal: {
    type: "sqlite",
    vectorBackend: "sqlite-vec",
    dataDir: ".ralph/memory",
  },

  personalBrowser: {
    type: "pglite",
    vectorBackend: "pgvector",
    dataDir: "indexeddb://ralph-memory",
  },

  team: {
    type: "postgres",
    vectorBackend: "pgvector",
    connectionString: process.env.DATABASE_URL,
  },
} as const;

// 환경 자동 감지
function detectPreset(): keyof typeof PRESETS {
  if (typeof window !== "undefined") return "personalBrowser";
  if (process.env.DATABASE_URL) return "team";
  return "personal";
}
```
