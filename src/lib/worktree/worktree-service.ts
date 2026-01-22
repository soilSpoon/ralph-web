import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { GitClient } from "./git-client";
import { preserveFilesToWorktree } from "./preserve-files";
import type {
  IWorktreePersistence,
  WorktreeInfo,
  WorktreeSettings,
} from "./types";

const DEFAULT_SETTINGS: WorktreeSettings = {
  preservePatterns: [".env", ".env.local", ".env.*.local", ".envrc", ".npmrc"],
  excludePatterns: ["node_modules", ".git", "dist", "build", ".next"],
  branchPrefix: "ralph",
  worktreesDir: ".ralph/worktrees",
};

const WorktreeConfigSchema = z.object({
  preservePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  branchPrefix: z.string().optional(),
  worktreesDir: z.string().optional(),
});

export class WorktreeService {
  private projectPath: string;
  private settings: WorktreeSettings;
  private gitClient: GitClient;
  private persistence?: IWorktreePersistence;
  private worktrees = new Map<string, WorktreeInfo>();

  constructor(
    projectPath: string,
    settings?: Partial<WorktreeSettings>,
    persistence?: IWorktreePersistence,
  ) {
    this.projectPath = path.resolve(projectPath);
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
    this.persistence = persistence;
    this.loadProjectConfig();
    this.gitClient = new GitClient({ baseDir: this.projectPath });
  }

  getSettings(): WorktreeSettings {
    return { ...this.settings };
  }

  private loadProjectConfig(): void {
    const configPath = path.join(this.projectPath, ".ralph.json");
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, "utf-8");
        const config = WorktreeConfigSchema.parse(JSON.parse(content));

        // Merge patterns instead of replacing them
        if (config.preservePatterns) {
          this.settings.preservePatterns = Array.from(
            new Set([
              ...this.settings.preservePatterns,
              ...config.preservePatterns,
            ]),
          );
        }

        if (config.excludePatterns) {
          this.settings.excludePatterns = Array.from(
            new Set([
              ...this.settings.excludePatterns,
              ...config.excludePatterns,
            ]),
          );
        }

        if (config.branchPrefix) {
          this.settings.branchPrefix = config.branchPrefix;
        }

        if (config.worktreesDir) {
          this.settings.worktreesDir = config.worktreesDir;
        }
      } catch (error) {
        console.warn(
          `[WorktreeService] Failed to parse .ralph.json at ${configPath}`,
          error,
        );
      }
    }
  }

  private generateId(worktreePath: string): string {
    const abs = path.resolve(worktreePath);
    return crypto.createHash("sha1").update(abs).digest("hex").slice(0, 12);
  }

  /**
   * Create a new Git worktree for a task
   */
  async createWorktree(taskId: string): Promise<WorktreeInfo> {
    const hash = crypto.randomBytes(3).toString("hex");
    const branchName = `${this.settings.branchPrefix}/${taskId}-${hash}`;
    const worktreePath = path.join(
      this.projectPath,
      this.settings.worktreesDir,
      `${taskId}-${hash}`,
    );

    // Ensure parent directory exists
    await fsp.mkdir(path.dirname(worktreePath), { recursive: true });

    const git = await this.gitClient.getGit();
    const baseRef = await this.gitClient.detectBaseRef();

    // 1. Create worktree
    // git worktree add -b <branch> <path> <baseRef>
    try {
      await git.raw([
        "worktree",
        "add",
        "-b",
        branchName,
        worktreePath,
        baseRef,
      ]);
    } catch (error) {
      console.error("[WorktreeService] Failed to add worktree", error);
      throw new Error(`Failed to create worktree: ${error}`);
    }

    // 2. Preserve environment files
    await preserveFilesToWorktree(
      this.projectPath,
      worktreePath,
      this.settings.preservePatterns,
      this.settings.excludePatterns,
    );

    const info: WorktreeInfo = {
      id: this.generateId(worktreePath),
      taskId,
      branch: branchName,
      path: worktreePath,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    this.worktrees.set(info.id, info);

    if (this.persistence) {
      await this.persistence.save(info);
    }

    return info;
  }

  /**
   * Remove a worktree safely
   */
  async removeWorktree(id: string): Promise<void> {
    // Find worktree info (could be passed as arg or looked up)
    // For simplicity, we assume we know the path/info or we list them
    const info = this.worktrees.get(id);

    // Safety check: Don't remove if it's the main project path
    // We'll also verify from 'git worktree list' in a real scenario
    const git = await this.gitClient.getGit();

    try {
      const stdout = await git.raw(["worktree", "list", "--porcelain"]);
      const lines = stdout.split("\n");
      let targetPath: string | null = null;
      let isMain = false;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("worktree ")) {
          const wtPath = lines[i].substring(9);
          const normalizedWtPath = path.resolve(wtPath);

          // Track if it matches our ID or provided info
          if (this.generateId(normalizedWtPath) === id) {
            targetPath = normalizedWtPath;
            if (i === 0) isMain = true; // First one is main repo
            break;
          }
        }
      }

      if (isMain) throw new Error("Cannot remove main repository worktree");
      if (!targetPath) return; // Already gone or not found

      // Remove worktree
      await git.raw(["worktree", "remove", "--force", targetPath]);

      // Prune stale metadata
      await git.raw(["worktree", "prune"]);

      // Optionally delete branch (emdash pattern)
      // Note: info contains the branch name
      if (info?.branch) {
        await git.raw(["branch", "-D", info.branch]).catch(() => {});
      }

      this.worktrees.delete(id);
      if (this.persistence) {
        await this.persistence.remove(id);
      }
    } catch (error) {
      console.error("[WorktreeService] Failed to remove worktree", error);
      throw error;
    }
  }

  /**
   * List all worktrees managed by git
   */
  async listWorktrees(): Promise<WorktreeInfo[]> {
    const git = await this.gitClient.getGit();
    const stdout = await git.raw(["worktree", "list", "--porcelain"]);

    const results: WorktreeInfo[] = [];
    const lines = stdout.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("worktree ")) {
        const wtPath = lines[i].substring(9);
        const branchLine = lines[i + 2]; // Typically 'branch refs/heads/...'
        let branch = "unknown";
        if (branchLine?.startsWith("branch ")) {
          branch = branchLine.substring(7).replace("refs/heads/", "");
        }

        const id = this.generateId(wtPath);
        results.push({
          id,
          taskId: path.basename(wtPath).split("-")[0], // Heuristic
          branch,
          path: wtPath,
          status: "active",
          createdAt: "", // Would need DB for this
        });
      }
    }
    return results;
  }
}
