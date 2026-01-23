# Code Indexing System

## 개요

코드베이스의 구조를 인덱싱하여 에이전트가 코드 심볼과 관계를 효율적으로 검색할 수 있게 합니다.

---

## Code Graph 구조

```
┌─────────────────────────────────────────────────────────────┐
│                      CODE GRAPH                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌─────────┐    calls     ┌─────────┐                     │
│    │ Function├─────────────►│ Function│                     │
│    └────┬────┘              └─────────┘                     │
│         │ belongs_to                                         │
│         ▼                                                    │
│    ┌─────────┐   extends    ┌─────────┐                     │
│    │  Class  ├─────────────►│  Class  │                     │
│    └────┬────┘              └─────────┘                     │
│         │ uses                                               │
│         ▼                                                    │
│    ┌─────────┐                                              │
│    │ Variable │                                              │
│    └─────────┘                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Schema

### Code Entities

```sql
CREATE TABLE code_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identity
    entity_type TEXT NOT NULL,    -- 'class' | 'function' | 'variable' | 'interface' | 'type'
    name TEXT NOT NULL,
    qualified_name TEXT,          -- 전체 경로 (e.g., "auth.service.AuthService.login")

    -- Location
    file_path TEXT NOT NULL,
    start_line INTEGER,
    end_line INTEGER,

    -- Content
    signature TEXT,               -- 함수/메서드 시그니처
    description TEXT,             -- 추출된 설명 또는 JSDoc
    embedding vector(1024),

    -- Metadata
    visibility TEXT,              -- 'public' | 'private' | 'protected'
    is_exported BOOLEAN DEFAULT FALSE,
    is_async BOOLEAN DEFAULT FALSE,

    -- Stable Identity (for tracking renames)
    content_hash TEXT,            -- 시그니처 + 첫 N줄 해시

    -- Provenance
    last_commit_hash TEXT,
    project_id UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_code_entities_name ON code_entities (name);
CREATE INDEX idx_code_entities_file ON code_entities (file_path);
CREATE INDEX idx_code_entities_type ON code_entities (entity_type);
CREATE INDEX idx_code_entities_embedding ON code_entities
    USING ivfflat (embedding vector_cosine_ops);
CREATE UNIQUE INDEX idx_code_entities_qualified ON code_entities (qualified_name, project_id);
```

### Code Relations

```sql
CREATE TABLE code_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    source_id UUID REFERENCES code_entities(id) ON DELETE CASCADE,
    target_id UUID REFERENCES code_entities(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL,
    -- 'calls' | 'extends' | 'implements' | 'imports' | 'uses' | 'overrides' | 'belongs_to'

    -- Context
    context TEXT,                 -- 호출/사용 컨텍스트
    line_number INTEGER,          -- 관계가 발생하는 줄

    project_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(source_id, target_id, relation_type)
);

-- Indexes
CREATE INDEX idx_code_relations_source ON code_relations (source_id);
CREATE INDEX idx_code_relations_target ON code_relations (target_id);
CREATE INDEX idx_code_relations_type ON code_relations (relation_type);
```

---

## TypeScript Types

```typescript
interface CodeEntity {
  id: string;
  entityType: "class" | "function" | "variable" | "interface" | "type" | "enum";
  name: string;
  qualifiedName: string;
  filePath: string;
  startLine: number;
  endLine: number;
  signature?: string;
  description?: string;
  embedding?: number[];
  visibility?: "public" | "private" | "protected";
  isExported?: boolean;
  isAsync?: boolean;
  contentHash: string;
  lastCommitHash?: string;
}

interface CodeRelation {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: RelationType;
  context?: string;
  lineNumber?: number;
}

type RelationType =
  | "calls" // 함수가 다른 함수를 호출
  | "extends" // 클래스가 다른 클래스를 상속
  | "implements" // 클래스가 인터페이스를 구현
  | "imports" // 모듈 import
  | "uses" // 변수/타입 사용
  | "overrides" // 메서드 오버라이드
  | "belongs_to"; // 멤버가 클래스에 속함
```

---

## Parsing Strategy

### LSP-First Approach

```typescript
interface CodeParser {
  // LSP 기반 파싱 (정확도 높음)
  parseWithLSP(files: string[]): Promise<ParseResult>;

  // AST 기반 파싱 (폴백)
  parseWithAST(files: string[]): Promise<ParseResult>;

  // 심볼 추출
  extractSymbols(file: string): Promise<CodeEntity[]>;

  // 관계 추출
  extractRelations(
    file: string,
    entities: CodeEntity[],
  ): Promise<CodeRelation[]>;
}

interface ParseResult {
  entities: CodeEntity[];
  relations: CodeRelation[];
  errors: ParseError[];
}
```

### TypeScript 파서 구현

```typescript
import ts from "typescript";

async function extractSymbolsFromTS(filePath: string): Promise<CodeEntity[]> {
  const program = ts.createProgram([filePath], {});
  const sourceFile = program.getSourceFile(filePath);
  const entities: CodeEntity[] = [];

  function visit(node: ts.Node) {
    // Class 추출
    if (ts.isClassDeclaration(node) && node.name) {
      entities.push({
        entityType: "class",
        name: node.name.text,
        qualifiedName: getQualifiedName(node),
        filePath,
        startLine:
          sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        endLine:
          sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1,
        signature: getClassSignature(node),
        description: getJSDocComment(node),
        visibility: getVisibility(node),
        isExported: hasExportModifier(node),
        contentHash: computeContentHash(node),
      });
    }

    // Function 추출
    if (ts.isFunctionDeclaration(node) && node.name) {
      entities.push({
        entityType: "function",
        name: node.name.text,
        qualifiedName: getQualifiedName(node),
        filePath,
        startLine:
          sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        endLine:
          sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1,
        signature: getFunctionSignature(node),
        description: getJSDocComment(node),
        isAsync: hasAsyncModifier(node),
        isExported: hasExportModifier(node),
        contentHash: computeContentHash(node),
      });
    }

    // Interface 추출
    if (ts.isInterfaceDeclaration(node)) {
      entities.push({
        entityType: "interface",
        name: node.name.text,
        // ...
      });
    }

    // Type Alias 추출
    if (ts.isTypeAliasDeclaration(node)) {
      entities.push({
        entityType: "type",
        name: node.name.text,
        // ...
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return entities;
}
```

---

## Stable Identity

리네이밍을 추적하기 위한 안정적인 ID 전략:

```typescript
interface StableIdentity {
  // 컨텐츠 해시: 시그니처 + 본문 첫 N줄
  contentHash: string;

  // 위치 기반 ID: 파일 + 줄 범위
  locationId: string;

  // 복합 ID: contentHash 우선, 없으면 locationId
  stableId: string;
}

function computeContentHash(node: ts.Node): string {
  const signature = getSignature(node);
  const bodyPreview = getBodyPreview(node, 10); // 첫 10줄
  return hash(`${signature}::${bodyPreview}`);
}

// 리네이밍 감지
async function detectRenames(
  oldEntities: CodeEntity[],
  newEntities: CodeEntity[],
): Promise<RenameEvent[]> {
  const renames: RenameEvent[] = [];

  for (const newEntity of newEntities) {
    // 같은 contentHash를 가진 기존 엔티티 찾기
    const oldEntity = oldEntities.find(
      (e) =>
        e.contentHash === newEntity.contentHash && e.name !== newEntity.name,
    );

    if (oldEntity) {
      renames.push({
        oldName: oldEntity.name,
        newName: newEntity.name,
        oldPath: oldEntity.filePath,
        newPath: newEntity.filePath,
        entityType: newEntity.entityType,
      });
    }
  }

  return renames;
}
```

---

## Incremental Update

커밋 기반 증분 업데이트:

```typescript
interface IncrementalIndexer {
  // 변경된 파일만 인덱싱
  indexChangedFiles(commitHash: string): Promise<IndexResult>;

  // 삭제된 파일의 엔티티 제거
  removeDeletedEntities(deletedFiles: string[]): Promise<number>;

  // 리네이밍 처리
  handleRenames(renames: RenameEvent[]): Promise<void>;
}

async function indexChangedFiles(commitHash: string): Promise<IndexResult> {
  // 1. 변경된 파일 목록 가져오기
  const diff = await git.diff(commitHash, `${commitHash}^`);
  const changedFiles = diff.files.filter(
    (f) => f.extension === "ts" || f.extension === "tsx",
  );

  // 2. 파일별 처리
  for (const file of changedFiles) {
    if (file.status === "deleted") {
      await removeEntitiesByFile(file.path);
    } else {
      // Modified or Added
      const entities = await extractSymbolsFromTS(file.path);
      const relations = await extractRelations(file.path, entities);

      // Upsert entities
      for (const entity of entities) {
        await upsertCodeEntity(entity);
      }

      // Update relations
      await updateRelationsForFile(file.path, relations);
    }
  }

  // 3. 리네이밍 감지 및 처리
  const oldEntities = await getEntitiesByCommit(`${commitHash}^`);
  const newEntities = await getEntitiesByCommit(commitHash);
  const renames = await detectRenames(oldEntities, newEntities);
  await handleRenames(renames);

  return {
    indexed: changedFiles.length,
    entities: entities.length,
    relations: relations.length,
    renames: renames.length,
  };
}
```

---

## MCP Tools

### Code Search

```typescript
search_code: {
  description: "Search code entities by name or description",
  parameters: {
    query: string;
    entityType?: 'class' | 'function' | 'variable' | 'interface' | 'type';
    filePath?: string;          // Filter by file path pattern
    limit?: number;
  },
  returns: Array<{
    id: string;
    entityType: string;
    name: string;
    qualifiedName: string;
    filePath: string;
    startLine: number;
    signature?: string;
    description?: string;
    score: number;
  }>
}
```

### Relation Exploration

```typescript
get_code_relations: {
  description: "Get relationships of a code entity",
  parameters: {
    entityId: string;
    relationType?: RelationType;
    direction?: 'incoming' | 'outgoing' | 'both';
    depth?: number;             // For multi-hop traversal
  },
  returns: Array<{
    source: CodeEntity;
    relation: RelationType;
    target: CodeEntity;
    context?: string;
  }>
}
```

### Codebase Indexing

```typescript
index_codebase: {
  description: "Index codebase structure (classes, functions, relations)",
  parameters: {
    directory: string;
    extensions?: string[];      // Default: ['ts', 'tsx', 'js', 'jsx']
    excludePatterns?: string[]; // Default: ['node_modules', 'dist', '.git']
    incremental?: boolean;      // Use incremental update if available
  },
  returns: {
    indexedFiles: number;
    entities: number;
    relations: number;
    duration_ms: number;
  }
}
```

---

## File Watcher Integration

실시간 인덱싱을 위한 파일 감시:

```typescript
import { watch } from "chokidar";

function setupFileWatcher(projectRoot: string): FSWatcher {
  const watcher = watch([`${projectRoot}/**/*.ts`, `${projectRoot}/**/*.tsx`], {
    ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
    persistent: true,
  });

  watcher.on("change", async (path) => {
    // Debounce + reindex
    await debounce(() => reindexFile(path), 500);
  });

  watcher.on("add", async (path) => {
    await indexNewFile(path);
  });

  watcher.on("unlink", async (path) => {
    await removeEntitiesByFile(path);
  });

  return watcher;
}
```

---

## Usage Examples

### 함수 호출 관계 탐색

```typescript
// "handleAuth 함수가 어떤 함수들을 호출하는지?"
const relations = await getCodeRelations({
  entityId: "handleAuth-id",
  relationType: "calls",
  direction: "outgoing",
});

// 결과:
// handleAuth -> validateToken
// handleAuth -> fetchUser
// handleAuth -> createSession
```

### 클래스 상속 관계 탐색

```typescript
// "UserService가 상속하는 클래스와 구현하는 인터페이스?"
const inheritance = await getCodeRelations({
  entityId: "UserService-id",
  relationType: "extends",
  direction: "outgoing",
});

const implementations = await getCodeRelations({
  entityId: "UserService-id",
  relationType: "implements",
  direction: "outgoing",
});
```

### 특정 인터페이스를 구현하는 모든 클래스

```typescript
// "IAuthProvider를 구현하는 모든 클래스?"
const implementations = await getCodeRelations({
  entityId: "IAuthProvider-id",
  relationType: "implements",
  direction: "incoming",
});
```
