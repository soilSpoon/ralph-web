# Code Indexing System (AgentDB Native)

## 개요

**Source Inspiration**: `ruvector` (Cypher Support, Hyperbolic Embeddings)

**Strategy**: `agentdb`를 단순 저장소가 아닌 **Graph Engine**으로 활용합니다.
**Cypher** 쿼리를 통해 영향도를 분석하고, **Hyperbolic 임베딩**을 사용하여 코드 계층 구조를 정밀하게 이해합니다.

---

## 1. AgentDB Graph Configuration

```typescript
// libs/memory/src/service.ts

const db = createDatabase({
  // ...
  
  // 1. Vector Backend (RuVector)
  embedding: {
    model: "text-embedding-3-small",
    // 트리/계층 구조(파일 시스템, AST)에 최적화된 쌍곡 기하학 공간 사용
    space: "hyperbolic", 
  },

  // 2. Graph Engine
  graph: {
    enabled: true,
    queryEngine: "cypher", // 네이티브 Cypher 쿼리 엔진 활성화
    
    // Auto-Indexing
    autoIndex: {
      enable: true,
      watch: ["./src", "./lib"],
      ignore: ["**/node_modules/**", "**/*.test.ts"],
      language: ["typescript", "javascript"],
      strategy: "shallow", 
    }
  }
});
```

---

## 2. Bootstrapping (Cold Start)
(이전과 동일)

---

## 3. Querying the Graph (Cypher)

별도의 수동 순회 로직 대신 **Cypher** 쿼리를 사용하여 영향도를 분석합니다.

```typescript
// 예시: "auth 모듈을 임포트하는 모든 파일 찾기"

const query = `
  MATCH (auth:File {path: 'src/lib/auth.ts'})<-[:IMPORTS]-(dependents:File)
  RETURN dependents.path
`;

const result = await agentdb.graph.query(query);
console.log("Impact Analysis:", result.records);
```

### Impact Analysis 주입 로직

`Think Phase`에서 에이전트에게 정보를 제공할 때 사용합니다.

```typescript
async function getImpactContext(changedFile: string) {
  // 특정 파일을 수정할 때 영향받는 함수들을 탐색
  const query = `
    MATCH (target:File {path: $path})-[:CONTAINS]->(fn:Function)
    MATCH (caller:Function)-[:CALLS]->(fn)
    RETURN caller.name, caller.file
  `;
  
  return await agentdb.graph.query(query, { path: changedFile });
}
```