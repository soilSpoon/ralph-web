import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { TaskStatus } from "../types";
// Wait, if it is deprecated in pg-core, maybe it is in drizzle-orm?
// Drizzle docs say: import { primaryKey } from "drizzle-orm/pg-core"; is strictly for composite key definition in table config.
// If I check node_modules... I can't.
// I will try importing from "drizzle-orm" instead.

// ============ TASKS ============
export const tasks = pgTable(
  "tasks",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    branchName: text("branch_name").notNull(),
    status: text("status").$type<TaskStatus>().notNull().default("pending"),
    priority: integer("priority").notNull().default(0),
    currentIteration: integer("current_iteration").notNull().default(0),
    maxIterations: integer("max_iterations").notNull().default(10),
    worktreePath: text("worktree_path"),
    metadataPath: text("metadata_path"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    archived: boolean("archived").notNull().default(false),
  },
  (table) => [
    index("idx_tasks_status").on(table.status),
    index("idx_tasks_priority").on(table.priority),
    index("idx_tasks_created_at").on(table.createdAt),
  ],
);

// ============ STORIES ============
export const stories = pgTable(
  "stories",
  {
    id: text("id").notNull(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    acceptanceCriteria: jsonb("acceptance_criteria")
      .$type<string[]>()
      .notNull()
      .default([]),
    priority: integer("priority").notNull().default(1),
    passes: boolean("passes").notNull().default(false),
    threadUrl: text("thread_url"),
    iterationCompleted: integer("iteration_completed"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({ columns: [table.taskId, table.id] }),
    index("idx_stories_task").on(table.taskId),
    index("idx_stories_passes").on(table.taskId, table.passes),
  ],
);

// ============ PATTERNS ============
export const patterns = pgTable(
  "patterns",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    taskId: text("task_id").references(() => tasks.id, {
      onDelete: "set null",
    }),
    pattern: text("pattern").notNull(),
    description: text("description"),
    category: text("category"), // 'convention' | 'gotcha' | 'tip'
    sourceFile: text("source_file"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    promotedAt: timestamp("promoted_at"),
  },
  (table) => [
    index("idx_patterns_task").on(table.taskId),
    index("idx_patterns_category").on(table.category),
    index("idx_patterns_global").on(table.taskId),
  ],
);

// ============ ITERATIONS ============
export const iterations = pgTable(
  "iterations",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    iterationNumber: integer("iteration_number").notNull(),
    storyId: text("story_id"),
    status: text("status"), // 'success' | 'failed' | 'timeout'
    threadUrl: text("thread_url"),
    durationSeconds: integer("duration_seconds"),
    errorMessage: text("error_message"),
    filesChanged: jsonb("files_changed")
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_iterations_task").on(table.taskId, table.iterationNumber),
  ],
);

// ============ SESSIONS ============
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    name: text("name"),
    providerSessionId: text("provider_session_id"),
    streamId: text("stream_id"),
    mode: text("mode").notNull().default("agent"), // 'plan' | 'agent'
    messages: jsonb("messages")
      .$type<Array<{ role: string; content: string }>>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_sessions_task").on(table.taskId),
    index("idx_sessions_provider_session_id").on(table.providerSessionId),
  ],
);

// ============ QA REPORTS ============
export const qaReports = pgTable(
  "qa_reports",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    taskId: text("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    iterationNumber: integer("iteration_number").notNull(),
    status: text("status"), // 'passed' | 'failed' | 'fixed'
    acceptanceCriteriaResults: jsonb("acceptance_criteria_results").$type<
      Array<{ criteria: string; passed: boolean }>
    >(), // { criteria: string, passed: boolean }[]
    buildOutput: text("build_output"),
    testOutput: text("test_output"),
    fixRequest: text("fix_request"),
    screenshots: jsonb("screenshots").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_qa_reports_task").on(table.taskId, table.iterationNumber),
    index("idx_qa_reports_status").on(table.status),
  ],
);
// ============ RELATIONS ============
export const tasksRelations = relations(tasks, ({ many }) => ({
  stories: many(stories),
  patterns: many(patterns),
  iterations: many(iterations),
  sessions: many(sessions),
  qaReports: many(qaReports),
}));

export const storiesRelations = relations(stories, ({ one }) => ({
  task: one(tasks, {
    fields: [stories.taskId],
    references: [tasks.id],
  }),
}));

export const patternsRelations = relations(patterns, ({ one }) => ({
  task: one(tasks, {
    fields: [patterns.taskId],
    references: [tasks.id],
  }),
}));

export const iterationsRelations = relations(iterations, ({ one }) => ({
  task: one(tasks, {
    fields: [iterations.taskId],
    references: [tasks.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  task: one(tasks, {
    fields: [sessions.taskId],
    references: [tasks.id],
  }),
}));

export const qaReportsRelations = relations(qaReports, ({ one }) => ({
  task: one(tasks, {
    fields: [qaReports.taskId],
    references: [tasks.id],
  }),
}));

// ============ TYPE EXPORTS ============
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;
export type Pattern = typeof patterns.$inferSelect;
export type NewPattern = typeof patterns.$inferInsert;
export type Iteration = typeof iterations.$inferSelect;
export type NewIteration = typeof iterations.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type QAReport = typeof qaReports.$inferSelect;
export type NewQAReport = typeof qaReports.$inferInsert;

// ============ ZOD SCHEMAS ============
export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);

export const insertStorySchema = createInsertSchema(stories);
export const selectStorySchema = createSelectSchema(stories);

export const insertIterationSchema = createInsertSchema(iterations);
export const selectIterationSchema = createSelectSchema(iterations);

export const insertPatternSchema = createInsertSchema(patterns);
export const selectPatternSchema = createSelectSchema(patterns);

export const insertSessionSchema = createInsertSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);

export const insertQAReportSchema = createInsertSchema(qaReports);
export const selectQAReportSchema = createSelectSchema(qaReports);
