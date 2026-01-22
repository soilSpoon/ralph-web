export interface WorktreeInfo {
  id: string;
  taskId: string;
  branch: string;
  path: string;
  status: "active" | "paused" | "completed";
  createdAt: string;
}

export interface WorktreeStatus {
  exists: boolean;
  clean: boolean;
  branch: string;
}

export interface WorktreeService {
  create(taskId: string, taskName: string): Promise<WorktreeInfo>;
  remove(worktreeId: string): Promise<void>;
  list(): Promise<WorktreeInfo[]>;
  getStatus(worktreeId: string): Promise<WorktreeStatus>;
}

export const DEFAULT_PRESERVE_PATTERNS = [
  ".env",
  ".env.local",
  ".env.*.local",
  ".envrc",
];
