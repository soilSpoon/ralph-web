import { execFile } from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";
import { SimpleGit, SimpleGitOptions, simpleGit } from "simple-git";
import { GitClientOptions } from "./types";

const execFileAsync = promisify(execFile);

let cachedEnv: Record<string, string> | null = null;

/**
 * Gets the shell environment by spawning a login shell.
 * This is crucial for GUI apps to find 'git' and other tools.
 * Inspired by 1code pattern.
 */
async function getShellEnvironment(): Promise<Record<string, string>> {
  if (cachedEnv) return cachedEnv;

  const shell =
    process.env.SHELL ||
    (process.platform === "darwin" ? "/bin/zsh" : "/bin/bash");

  try {
    // -lc: login shell, runs profile/zshrc etc to set PATH
    const { stdout } = await execFileAsync(shell, ["-lc", "env"], {
      timeout: 5000,
      env: { ...process.env, HOME: os.homedir() },
    });

    const env: Record<string, string> = {};
    for (const line of stdout.split("\n")) {
      const idx = line.indexOf("=");
      if (idx > 0) {
        env[line.substring(0, idx)] = line.substring(idx + 1);
      }
    }
    cachedEnv = env;
    return env;
  } catch (error) {
    console.warn(
      "[GitClient] Failed to get shell environment, falling back to process.env",
      error,
    );
    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (typeof value === "string") {
        env[key] = value;
      }
    }
    return env;
  }
}

export class GitClient {
  private git: SimpleGit | null = null;
  private baseDir: string;

  constructor(options: GitClientOptions) {
    this.baseDir = options.baseDir;
  }

  /**
   * Lazy initialization of SimpleGit with proper PATH
   */
  async getGit(): Promise<SimpleGit> {
    if (this.git) return this.git;

    const env = await getShellEnvironment();

    // Ensure PATH is available from shell env
    if (env.PATH && !process.env.PATH?.includes(env.PATH)) {
      process.env.PATH = env.PATH;
    }

    const options: Partial<SimpleGitOptions> = {
      baseDir: this.baseDir,
      binary: "git",
      maxConcurrentProcesses: 6,
    };

    this.git = simpleGit(options);
    return this.git;
  }

  /**
   * Detect base branch for new worktrees
   */
  async detectBaseRef(): Promise<string> {
    const git = await this.getGit();

    try {
      // Try to fetch first
      await git.fetch("origin").catch(() => {});

      const branches = await git.branch(["-r"]);
      const remoteBranches = branches.all;

      // Priority: origin/main -> origin/master -> main -> master -> HEAD
      if (remoteBranches.includes("origin/main")) return "origin/main";
      if (remoteBranches.includes("origin/master")) return "origin/master";

      const localBranches = await git.branchLocal();
      if (localBranches.all.includes("main")) return "main";
      if (localBranches.all.includes("master")) return "master";
    } catch (error) {
      console.warn("[GitClient] Failed to detect base ref, using HEAD", error);
    }

    return "HEAD";
  }
}
