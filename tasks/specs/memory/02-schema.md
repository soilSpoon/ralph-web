# Memory Schema Specification

## 개요

모든 메모리는 **AgentDB**에 저장되지만, 엄격한 **TypeScript 인터페이스**를 통해 데이터의 무결성을 보장합니다.
핵심 원칙은 **"Provenance First (출처 우선)"**입니다. (`memU` 참조)

---

## 1. Base Memory Unit & Citation (from memU)

모든 메모리는 반드시 출처(`Citation`)를 가져야 합니다. 출처 없는 정보는 '환각' 또는 '가설'로 취급됩니다.

```typescript
// libs/memory/src/types.ts

export type MemoryStatus = 'hypothesis' | 'verified' | 'published' | 'archived';
export type MemoryScope = 'task' | 'project' | 'global';

export interface MemoryUnit {
  id: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
  
  // Governance
  status: MemoryStatus;
  scope: MemoryScope;
  confidence: number; // 0.0 ~ 1.0
  
  // 🔥 Provenance (Essential for Trust - from memU)
  citations: Citation[];
}

export type Citation = 
  | CommitCitation
  | LogCitation
  | UserCitation
  | FileCitation
  | UrlCitation;

export interface CommitCitation {
  type: 'commit';
  hash: string;
  repo: string;
  message: string;
  diffSummary?: string;
}

export interface LogCitation {
  type: 'log';
  logId: string;
  timestamp: Date;
  context: string; // 당시 실행된 명령어 등
}

export interface UserCitation {
  type: 'user';
  userId: string;
  comment: string; // 사용자가 직접 입력한 피드백
}

export interface FileCitation {
  type: 'file';
  path: string;
  lineHash: string; // 내용 변경 추적용 해시
}

export interface UrlCitation {
  type: 'url';
  url: string;
  title: string;
  crawledAt: Date;
}
```

---

## 2. Core Entities (Mapped to agentdb)

`agentdb`의 내장 컨트롤러가 사용하는 데이터 구조에 맞추되, 메타데이터를 확장합니다.

### 2.1 Reflexion Episode (Episodic Memory)
`agentdb.reflexion`에 매핑됩니다. 구체적인 사건과 결과를 기록합니다.

```typescript
export interface ReflexionEpisode extends MemoryUnit {
  type: 'episode';
  
  // Context
  taskDescription: string;
  initialStateSnapshot: string; // Terminal or File snapshot hash
  
  // Action & Result
  actionPlan: string;
  actionOutput: string;
  
  // Outcome
  success: boolean;
  critique: string; // "Why it failed/succeeded"
  
  // Tags for Clustering
  tags: string[]; // e.g., ["auth", "jwt", "error-401"]
}
```

### 2.2 Reasoning Pattern (Semantic Memory)
`agentdb.reasoningBank`에 매핑됩니다. 일반화된 지식과 노하우입니다.

```typescript
export interface ReasoningPattern extends MemoryUnit {
  type: 'pattern';
  
  // Pattern Definition
  problemSpace: string; // "Authentication"
  solutionTemplate: string; // "Use NextAuth.js v5 pattern..."
  
  // Usage Stats (Self-Learning)
  usageCount: number;
  successRate: number; // applied count / success count
  
  // Generalization Source
  generalizedFrom: string[]; // Episode IDs derived from (Links to Episodes)
}
```

---

## 3. Storage Strategy via AgentDB

`agentdb`는 기본적으로 SQLite + Vector Store를 추상화합니다. 우리는 `metadata` 필드를 활용하여 위 스키마를 저장합니다.

```typescript
// Example: Storing a Pattern
await agentdb.reasoningBank.storePattern({
  taskType: "auth_implementation",
  approach: "Use NextAuth v5 with Edge compatibility",
  successRate: 0.9,
  metadata: {
    // Custom Fields
    scope: "global",
    citations: [
      { type: "url", url: "https://authjs.dev/...", ... }
    ],
    generalizedFrom: ["episode-123", "episode-456"]
  }
});
```
