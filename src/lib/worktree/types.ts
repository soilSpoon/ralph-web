export interface WorktreeInfo {
  id: string;
  taskId: string;
  branch: string;
  path: string;
  status: "active" | "completed" | "error";
  createdAt: string;
}

export interface PreserveResult {
  copied: string[];
  skipped: string[];
}

export interface WorktreeSettings {
  preservePatterns: string[];
  excludePatterns: string[];
  branchPrefix: string;
  worktreesDir: string;
}

export interface GitClientOptions {
  baseDir: string;
}

export interface IWorktreePersistence {
  save(info: WorktreeInfo): Promise<void>;
  list(): Promise<WorktreeInfo[]>;
  remove(id: string): Promise<void>;
}
