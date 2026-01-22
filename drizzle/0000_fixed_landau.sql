CREATE TABLE "iterations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "iterations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"task_id" text NOT NULL,
	"iteration_number" integer NOT NULL,
	"story_id" text,
	"status" text,
	"thread_url" text,
	"duration_seconds" integer,
	"error_message" text,
	"files_changed" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patterns" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "patterns_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"task_id" text,
	"pattern" text NOT NULL,
	"description" text,
	"category" text,
	"source_file" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"promoted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "qa_reports" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "qa_reports_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"task_id" text NOT NULL,
	"iteration_number" integer NOT NULL,
	"status" text,
	"acceptance_criteria_results" jsonb,
	"build_output" text,
	"test_output" text,
	"fix_request" text,
	"screenshots" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"name" text,
	"provider_session_id" text,
	"stream_id" text,
	"mode" text DEFAULT 'agent' NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" text NOT NULL,
	"task_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"acceptance_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"passes" boolean DEFAULT false NOT NULL,
	"thread_url" text,
	"iteration_completed" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stories_task_id_id_pk" PRIMARY KEY("task_id","id")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"branch_name" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"current_iteration" integer DEFAULT 0 NOT NULL,
	"max_iterations" integer DEFAULT 10 NOT NULL,
	"worktree_path" text,
	"metadata_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "iterations" ADD CONSTRAINT "iterations_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qa_reports" ADD CONSTRAINT "qa_reports_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_iterations_task" ON "iterations" USING btree ("task_id","iteration_number");--> statement-breakpoint
CREATE INDEX "idx_patterns_task" ON "patterns" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_patterns_category" ON "patterns" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_patterns_global" ON "patterns" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_qa_reports_task" ON "qa_reports" USING btree ("task_id","iteration_number");--> statement-breakpoint
CREATE INDEX "idx_qa_reports_status" ON "qa_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_sessions_task" ON "sessions" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_provider_session_id" ON "sessions" USING btree ("provider_session_id");--> statement-breakpoint
CREATE INDEX "idx_stories_task" ON "stories" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_stories_passes" ON "stories" USING btree ("task_id","passes");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tasks_priority" ON "tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_tasks_created_at" ON "tasks" USING btree ("created_at");