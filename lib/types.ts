// Task and Story Types
export type TaskStatus = 'pending' | 'queued' | 'running' | 'review' | 'merged' | 'failed';
export type StoryStatus = 'pending' | 'in-progress' | 'completed' | 'failed';
export type PatternCategory = 'convention' | 'gotcha' | 'tip';
export type IterationStatus = 'success' | 'failed' | 'timeout';
export type ActivityType = 'task_created' | 'task_started' | 'task_completed' | 'task_merged' | 'iteration_completed';
export type WizardStep = 'describe' | 'clarify' | 'review' | 'approve';
export type QuestionType = 'radio' | 'checkbox' | 'text';

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
  clarifications: Record<string, any>;
  generatedPRD: string;
  approved: boolean;
}

export interface WizardQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  answer?: any;
}
