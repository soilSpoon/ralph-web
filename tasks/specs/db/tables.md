# Database Tables

> 📌 Part of [Database Schema](../database-schema.md)

---

## tasks (태스크 테이블)

각 기능/PRD 단위를 관리합니다.

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,              -- 'task-001', 'task-002'
  name TEXT NOT NULL,               -- '다크 모드 추가'
  description TEXT,
  branch_name TEXT NOT NULL,        -- 'ralph/dark-mode'
  status TEXT DEFAULT 'pending',    -- pending, queued, running, review, merged, failed
  priority INTEGER DEFAULT 0,       -- 높을수록 먼저 실행
  current_iteration INTEGER DEFAULT 0,
  max_iterations INTEGER DEFAULT 10,
  worktree_path TEXT,               -- '.worktrees/task-001/'
  metadata_path TEXT,               -- '.ralph/tasks/task-001/'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME
);
```

**상태 생명주기**: `pending` → `queued` → `running` → `review` → `merged`

---

## stories (스토리 테이블)

태스크 내 개별 작업 단위를 관리합니다.

```sql
CREATE TABLE stories (
  id TEXT NOT NULL,                 -- 'US-001'
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria TEXT,         -- JSON array
  priority INTEGER DEFAULT 1,
  passes BOOLEAN DEFAULT FALSE,
  thread_url TEXT,                  -- Amp/Claude 스레드 URL
  iteration_completed INTEGER,
  started_at DATETIME,
  completed_at DATETIME,
  PRIMARY KEY (task_id, id)
);
```

---

## patterns (Deprecated)

> ⚠️ **Moved to AgentDB**: 패턴과 지식은 `agentdb`의 `ReasoningBank` 및 `KnowledgeGraph`에서 관리합니다.
> 상세 내용은 [Phase 9: Memory Architecture](../memory/00-overview.md)를 참조하세요.

---

## iterations (반복 로그 테이블)

각 Ralph Loop 반복의 로그를 저장합니다.

```sql
CREATE TABLE iterations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  iteration_number INTEGER NOT NULL,
  story_id TEXT,
  status TEXT,                      -- 'success', 'failed', 'timeout'
  thread_url TEXT,
  duration_seconds INTEGER,
  error_message TEXT,
  files_changed TEXT,               -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## sessions (세션 테이블)

Task 내 다중 Sub-Chat/Session을 관리합니다. (1code 기반)

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT,
  session_id TEXT,                  -- Claude SDK 세션 ID
  stream_id TEXT,
  mode TEXT DEFAULT 'agent',        -- 'plan' | 'agent'
  messages TEXT DEFAULT '[]',       -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## providers (Provider 테이블)

Multi-Provider Registry를 관리합니다. (emdash 기반)

```sql
CREATE TABLE providers (
  id TEXT PRIMARY KEY,              -- 'claude', 'amp', 'gemini'
  name TEXT NOT NULL,
  cli TEXT NOT NULL,
  install_command TEXT,
  auto_approve_flag TEXT,
  initial_prompt_flag TEXT,
  resume_flag TEXT,
  plan_activate_command TEXT,
  icon TEXT,
  is_installed BOOLEAN DEFAULT FALSE,
  installed_version TEXT,
  last_checked_at DATETIME
);
```

---

## mcp_status (MCP 상태 캐시)

MCP 서버 상태를 캐시합니다. (1code 기반)

```sql
CREATE TABLE mcp_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_path TEXT NOT NULL,
  server_name TEXT NOT NULL,
  status TEXT,                      -- 'running', 'failed', 'needs-auth'
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_path, server_name)
);
```

---

## qa_reports (QA 리포트)

QA Loop 결과를 저장합니다. (Auto-Claude 기반)

```sql
CREATE TABLE qa_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  iteration_number INTEGER NOT NULL,
  status TEXT,                      -- 'passed', 'failed', 'fixed'
  acceptance_criteria_results TEXT, -- JSON
  build_output TEXT,
  test_output TEXT,
  fix_request TEXT,
  screenshots TEXT,                 -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
