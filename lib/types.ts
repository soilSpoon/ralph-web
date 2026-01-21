// Task and Story Types
export const TASK_STATUSES = [
  "draft",
  "pending",
  "queued",
  "running",
  "review",
  "merged",
  "failed",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STORY_STATUSES = [
  "pending",
  "in-progress",
  "completed",
  "failed",
] as const;
export type StoryStatus = (typeof STORY_STATUSES)[number];

export const PATTERN_CATEGORIES = ["convention", "gotcha", "tip"] as const;
export type PatternCategory = (typeof PATTERN_CATEGORIES)[number];

export const ITERATION_STATUSES = ["success", "failed", "timeout"] as const;
export type IterationStatus = (typeof ITERATION_STATUSES)[number];

export const ACTIVITY_TYPES = [
  "task_created",
  "task_started",
  "task_completed",
  "task_merged",
  "iteration_completed",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const WIZARD_STEPS = [
  "describe",
  "clarify",
  "review",
  "approve",
] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export const QUESTION_TYPES = ["radio", "checkbox", "text"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface Task {
  id: string;
  name: string;
  description: string;
  branchName: string;
  status: TaskStatus;
  priority: number;
  currentIteration: number;
  maxIterations: number;
  worktreePath: string;
  metadataPath: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Story {
  id: string;
  taskId: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: number;
  passes: boolean;
  threadUrl?: string;
  iterationCompleted?: number;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Pattern {
  id: number;
  taskId?: string;
  pattern: string;
  category: PatternCategory;
  sourceFile?: string;
  createdAt: Date;
  promotedAt?: Date;
}

export interface Iteration {
  id: number;
  taskId: string;
  iterationNumber: number;
  storyId?: string;
  status: IterationStatus;
  threadUrl?: string;
  durationSeconds?: number;
  errorMessage?: string;
  filesChanged: string[];
  createdAt: Date;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  taskId: string;
  taskName: string;
  message: string;
  timestamp: Date;
}

// PRD Wizard Types
export interface PRDFormData {
  description: string;
  clarifications: Record<string, string | string[] | boolean>;
  generatedPRD: string;
  approved: boolean;
}

export interface WizardQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  answer?: string | string[] | boolean;
}
