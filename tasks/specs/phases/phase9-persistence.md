# Phase 9: Persistence (DB)

> 📌 Part of [Phase 7-13 구현 명세](../phases.md)

Drizzle ORM + SQLite로 모든 상태 영속화

---

## 디렉토리 구조

```
lib/
└── db/
    ├── index.ts              # DB 초기화 및 export
    ├── schema.ts             # Drizzle 스키마 정의
    ├── migrations/           # 마이그레이션 파일
    └── sync.ts               # 파일 ↔ DB 동기화

drizzle.config.ts             # Drizzle 설정
```

---

## Drizzle 스키마 (1code/emdash 패턴)

```typescript
// lib/db/schema.ts
import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ============ TASKS ============
export const tasks = sqliteTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    branchName: text("branch_name").notNull(),
    status: text("status").notNull().default("pending"),
    priority: integer("priority").default(0),
    currentIteration: integer("current_iteration").default(0),
    maxIterations: integer("max_iterations").default(10),
    worktreePath: text("worktree_path"),
    metadataPath: text("metadata_path"),
    providerId: text("provider_id"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
    startedAt: text("started_at"),
    completedAt: text("completed_at"),
  },
  (table) => ({
    statusIdx: index("idx_tasks_status").on(table.status),
    priorityIdx: index("idx_tasks_priority").on(table.priority),
  }),
);

// ============ STORIES ============
export const stories = sqliteTable(
  "stories",
  {
    id: text("id").notNull(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    acceptanceCriteria: text("acceptance_criteria"), // JSON
    priority: integer("priority").default(1),
    passes: integer("passes").default(0),
    iterationCompleted: integer("iteration_completed"),
  },
  (table) => ({
    pk: primaryKey(table.taskId, table.id),
    taskIdx: index("idx_stories_task").on(table.taskId),
  }),
);

// ============ SESSIONS (1code 패턴) ============
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  name: text("name"),
  sessionId: text("session_id"), // Claude SDK 세션 재개용
  streamId: text("stream_id"),
  mode: text("mode").default("agent"),
  messages: text("messages").default("[]"),
  isActive: integer("is_active").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============ ITERATIONS ============
export const iterations = sqliteTable("iterations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: text("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  iterationNumber: integer("iteration_number").notNull(),
  storyId: text("story_id"),
  status: text("status"),
  durationSeconds: integer("duration_seconds"),
  errorMessage: text("error_message"),
  filesChanged: text("files_changed"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// ============ PATTERNS ============
export const patterns = sqliteTable("patterns", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "set null" }),
  pattern: text("pattern").notNull(),
  category: text("category"),
  sourceFile: text("source_file"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  promotedAt: text("promoted_at"),
});

// ============ PROVIDERS ============
export const providers = sqliteTable("providers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cli: text("cli").notNull(),
  installCommand: text("install_command"),
  autoApproveFlag: text("auto_approve_flag"),
  resumeFlag: text("resume_flag"),
  planActivateCommand: text("plan_activate_command"),
  icon: text("icon"),
  isInstalled: integer("is_installed").default(0),
  installedVersion: text("installed_version"),
  lastCheckedAt: text("last_checked_at"),
});

// ============ RELATIONS ============
export const tasksRelations = relations(tasks, ({ many }) => ({
  stories: many(stories),
  sessions: many(sessions),
  iterations: many(iterations),
  patterns: many(patterns),
}));
```

---

## DB 초기화

```typescript
// lib/db/index.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

const DB_PATH = ".ralph/ralph.db";
let db: ReturnType<typeof drizzle>;

export function getDatabase() {
  if (!db) {
    const sqlite = new Database(DB_PATH);
    db = drizzle(sqlite, { schema });

    // 앱 시작 시 자동 마이그레이션
    migrate(db, { migrationsFolder: "./lib/db/migrations" });
  }
  return db;
}
```
