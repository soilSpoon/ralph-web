# Memory Schema Specification

## 개요

**Source Inspiration**: `memU` (Provenance), `agentic-flow` (Pattern Separation)

`agentdb`는 Schema-less하지만, 우리는 TypeScript 인터페이스를 통해 **메타데이터(Metadata)**의 구조를 강제합니다.
특히 **일화 기억(Episode)**과 **의미 기억(Pattern)**을 분리하고, 패턴을 다시 **진단(Diagnosis)**과 **해결(Solution)**로 세분화합니다.

---

## 1. AgentDB Metadata Schema

모든 항목에 공통으로 적용되는 메타데이터 구조입니다.

```typescript
// libs/memory/src/types.ts

export interface AgentDBMetadata {
  // 1. Provenance (출처 증명 - from memU)
  source: {
    type: 'user_interaction' | 'agent_execution' | 'test_result' | 'file_analysis';
    id: string;      // Trace ID
    author: string;  // 'user', 'claude-code', 'system'
  };

  // 2. Temporal Context (시공간 좌표 - Key for Validation)
  context: {
    timestamp: number;
    git_commit: string;   // 이 기억이 생성된 시점의 커밋 해시
    git_branch: string;
    
    // Integrity Check
    related_files: Array<{
      path: string;
      hash: string; // 파일 내용 해시 (SHA-1)
    }>;
  };

  // 3. Governance (신뢰도 관리)
  validation: {
    status: 'hypothesis' | 'verified' | 'published' | 'archived';
    verified_by?: 'test_runner' | 'human_approval' | 'compiler';
    verification_id?: string;
    failure_hash?: string; // 순환 수정 방지용 에러 해시
  };
  
  tags: string[];
  project_id: string;
}
```

---

## 2. Core Entities Mapping

### 2.1 Atomic Fact (일화 기억 - from SimpleMem)
Raw Log를 정제한 무손실 재진술(Semantic Lossless Restatement) 형태의 실행 기록입니다.

```typescript
// libs/memory/src/types.ts

export interface AtomicFact {
  // "The Agent fixed the 'null pointer exception' in 'auth.ts' by adding a check."
  // 대명사가 없고 독립적으로 이해 가능한 문장
  content: string; 
  
  fact_type: 'error' | 'solution' | 'observation' | 'decision';
  confidence: number; // 0.0 ~ 1.0
  
  // 엔티티 추출 정보
  entities: {
    files: string[];
    functions: string[];
    libraries: string[];
    error_codes?: string[];
  };
  
  metadata: AgentDBMetadata;
}
```

### 2.2 Native Trajectory (의미 기억 - ReasoningBank)
`ruvector`의 **SONA** 엔진이 학습하는 궤적 데이터입니다. 진단(Diagnosis)과 해결(Solution)을 하나의 연속된 흐름으로 저장합니다.

```typescript
// Mapped to: agentdb.reasoningBank (Native SONA Trajectory)
interface ReasoningTrajectory {
  steps: Array<{
    action: string;      // 시도한 해결책 (Solution)
    observation: string; // 결과 및 에러 메시지 (Diagnosis/Feedback)
    reward: number;      // 단계별 보상
  }>;
  final_reward: number;  // 최종 성공 여부 (1.0 | 0.0)
  metadata: AgentDBMetadata;
}
```

---

## 3. Schema Enforcement

저장 전 `zod`를 사용하여 스키마를 검증합니다.

```typescript
import { z } from 'zod';

// [Deprecated] Manual Pattern Splitting is replaced by Native Trajectories
// Use 'ReasoningTrajectory' schema instead.
export const SolutionPatternSchema = z.object({
  diagnosis_id: z.string(),
  strategy: z.string(),
  success_rate: z.number().min(0).max(1),
  usage_count: z.number().int(),
  metadata: AgentDBMetadataSchema
}).describe("Legacy schema. Use agentdb.reasoningBank schemas.");
```
