# ECL Pipeline (Extract → Cognify → Load)

## 개요

**"Garbage In, Garbage Out."**
로그가 쌓이는 시점에 품질을 확보하지 않으면, 나중에 아무리 좋은 검색 엔진(Vector DB)을 써도 소용없습니다.
`SimpleMem`의 **Write-time Disambiguation(쓰기 시점 모호성 제거)** 철학을 도입하여, 에이전트의 로그를 "완결된 원자적 사실"로 변환한 뒤 `agentdb`에 저장합니다.

---

## 1. Pipeline Architecture

```mermaid
graph LR
    Agent[Agent Action] -->|Raw Log| Buffer[LogBuffer]
    Buffer -->|Window Full (10 logs)| Cognify[Cognify Agent]
    
    subgraph "Transformation (SimpleMem)"
        Cognify -->|Resolve Pronouns| T1[De-ambiguation]
        T1 -->|Anchor Time| T2[Absolute Timestamp]
        T2 -->|Link Files| T3[File Context Injection]
    end
    
    T3 -->|Atomic Facts| Loader[Memory Loader]
    Loader -->|Store| AgentDB[(agentdb)]
```

---

## 2. Component: LogBuffer

로그를 하나씩 LLM에 보내면 비용과 시간이 낭비됩니다. 일정량을 모아서 배치 처리합니다.

```typescript
// libs/memory/src/pipeline/LogBuffer.ts

interface RawLogEntry {
  timestamp: Date;
  actor: 'user' | 'agent' | 'system';
  content: string; // "그거 안되는데?" (모호함)
  metadata?: any;
}

export class LogBuffer {
  private buffer: RawLogEntry[] = [];
  private readonly WINDOW_SIZE = 10; // SimpleMem 권장 사이즈
  
  constructor(private cognifyService: CognifyService) {}

  add(log: RawLogEntry) {
    this.buffer.push(log);
    if (this.buffer.length >= this.WINDOW_SIZE) {
      this.flush();
    }
  }
  
  async flush() {
    if (this.buffer.length === 0) return;
    
    const logsToProcess = [...this.buffer];
    this.buffer = []; // 버퍼 비우기
    
    // 비동기로 Cognify 실행 (메인 스레드 차단 방지)
    this.cognifyService.process(logsToProcess).catch(console.error);
  }
}
```

---

## 3. Cognify Prompt (The "Magic" Sauce)

이 프롬프트가 이 시스템의 핵심입니다. `SimpleMem`의 프롬프트를 Ralph-Web 환경에 맞게 최적화했습니다.

```markdown
# Role
You are a Memory Cognifier. Your goal is to convert raw conversation logs into "Atomic Memory Entries".

# Input Context
- Current Date: {{currentDate}} (ISO 8601)
- Active Files: {{activeFiles}}
- Project: {{projectName}}

# Instructions (SimpleMem Protocol)
1. **De-ambiguate**: Replace ALL pronouns (it, they, he, that) with specific entities.
   - "Fix it" -> "Fix the `auth_error` in `src/auth.ts`"
2. **Anchor Time**: Convert relative time ("tomorrow", "later") to absolute timestamps.
3. **Atomicity**: Each entry must be self-contained. Understanding it should NOT require reading previous logs.
4. **Outcome Extraction**: Identify the result of actions (Success/Fail).

# Raw Logs
{{logs}}

# Output Format (JSON)
[
  {
    "fact": "The user reported a 401 error in 'src/api/auth.ts' during login.",
    "tags": ["bug", "auth", "401"],
    "timestamp": "2026-01-23T10:00:00Z",
    "confidence": 1.0,
    "citations": [
      { "type": "log", "logId": "log-123", "timestamp": "..." }
    ]
  },
  {
    "fact": "Agent decided to switch from 'jsonwebtoken' to 'jose' library to fix edge runtime compatibility.",
    "tags": ["decision", "dependency", "jose"],
    "timestamp": "2026-01-23T10:05:00Z",
    "confidence": 0.9,
    "citations": [...]
  }
]
```

---

## 4. Loader (to agentdb)

변환된 데이터를 `agentdb`의 적절한 컨트롤러로 라우팅합니다.

```typescript
// libs/memory/src/pipeline/Loader.ts

async function loadToAgentDB(entries: AtomicEntry[]) {
  for (const entry of entries) {
    if (entry.tags.includes('decision') || entry.tags.includes('error')) {
      // 중요한 결정이나 에러는 Reflexion (Episode)으로 저장
      await agentdb.reflexion.storeEpisode({
        task: entry.fact,
        success: !entry.tags.includes('error'),
        reward: entry.tags.includes('error') ? 0.0 : 1.0,
        metadata: { citations: entry.citations }
      });
    } else {
      // 일반적인 사실은 추후 Knowledge Graph 확장을 위해 보관 (또는 단순 로그)
      // 현재는 Reflexion에 통합 저장하거나 별도 Semantic Store 사용
    }
  }
}
```
