# Database Queries & Indexes

> 📌 Part of [Database Schema](../database-schema.md)

---

## 인덱스

```sql
-- 태스크 조회 최적화
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority DESC);
CREATE INDEX idx_tasks_created ON tasks(created_at DESC);

-- 스토리 조회 최적화
CREATE INDEX idx_stories_task ON stories(task_id);
CREATE INDEX idx_stories_passes ON stories(task_id, passes);

-- 반복 로그 조회 최적화
CREATE INDEX idx_iterations_task ON iterations(task_id, iteration_number);

-- 세션 조회 최적화
CREATE INDEX idx_sessions_task ON sessions(task_id);
CREATE INDEX idx_sessions_session_id ON sessions(session_id);

-- MCP 상태 조회 최적화
CREATE INDEX idx_mcp_status_project ON mcp_status(project_path);
CREATE INDEX idx_mcp_status_cached ON mcp_status(cached_at);

-- QA 리포트 조회 최적화
CREATE INDEX idx_qa_reports_task ON qa_reports(task_id, iteration_number);
CREATE INDEX idx_qa_reports_status ON qa_reports(status);
```

---

## 동기화 전략

### 파일 → DB (단방향)

```typescript
async function syncTaskFromFiles(taskId: string) {
  const metadataPath = `.ralph/tasks/${taskId}`;
  const prd = await readJson(`${metadataPath}/prd.json`);

  await db
    .update(tasks)
    .set({
      name: prd.project,
      branch_name: prd.branchName,
      updated_at: new Date(),
    })
    .where(eq(tasks.id, taskId));

  for (const story of prd.userStories) {
    await db
      .insert(stories)
      .values({
        id: story.id,
        task_id: taskId,
        title: story.title,
        passes: story.passes,
      })
      .onConflictDoUpdate({
        target: [stories.task_id, stories.id],
        set: { passes: story.passes },
      });
  }
}
```

### DB 손상 시 복구

```typescript
async function rebuildDatabase() {
  const taskDirs = await readdir(".ralph/tasks");
  for (const taskId of taskDirs) {
    if (taskId === "archive") continue;
    await syncTaskFromFiles(taskId);
  }
}
```

---

## 주요 쿼리 예시

### 실행 대기 중인 태스크 조회

```sql
SELECT * FROM tasks
WHERE status IN ('pending', 'queued')
ORDER BY priority DESC, created_at ASC
LIMIT 1;
```

### 미완료 스토리 조회

```sql
SELECT s.*, t.name as task_name
FROM stories s
JOIN tasks t ON s.task_id = t.id
WHERE s.passes = FALSE AND t.status = 'running'
ORDER BY s.priority ASC;
```

### 태스크 완료율 통계

```sql
SELECT
  t.id,
  t.name,
  COUNT(*) as total_stories,
  SUM(CASE WHEN s.passes THEN 1 ELSE 0 END) as completed_stories,
  ROUND(100.0 * SUM(CASE WHEN s.passes THEN 1 ELSE 0 END) / COUNT(*), 1) as completion_rate
FROM tasks t
JOIN stories s ON t.id = s.task_id
GROUP BY t.id;
```
