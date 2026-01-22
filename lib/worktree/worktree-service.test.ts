import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { WorktreeService } from "./worktree-service";

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";

describe("WorktreeService", () => {
  let projectDir: string;
  let service: WorktreeService;

  beforeEach(async () => {
    projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "ralph-project-"));

    // Initialize a real git repo for testing
    execSync("git init", { cwd: projectDir });
    execSync('git config user.email "test@example.com"', { cwd: projectDir });
    execSync('git config user.name "Test User"', { cwd: projectDir });
    await fs.writeFile(path.join(projectDir, "README.md"), "# Test Project");
    execSync("git add README.md", { cwd: projectDir });
    execSync('git commit -m "initial commit"', { cwd: projectDir });

    // Create an initial .env file
    await fs.writeFile(path.join(projectDir, ".env"), "KEY=VALUE");

    service = new WorktreeService(projectDir);
  });

  afterEach(async () => {
    // Worktree remove is handled by git, but we need to clean up the fs
    // Note: removing a directory that is a worktree can be tricky
    try {
      execSync("git worktree prune", { cwd: projectDir });
    } catch (_e) {}
    await fs.rm(projectDir, { recursive: true, force: true });
  });

  it("should create a worktree with isolated branch and copied .env", async () => {
    const taskId = "task-123";
    const info = await service.createWorktree(taskId);

    expect(info.taskId).toBe(taskId);
    expect(info.branch).toMatch(/ralph\/task-123/);
    expect(info.status).toBe("active");

    // Check if worktree directory exists
    const stats = await fs.stat(info.path);
    expect(stats.isDirectory()).toBe(true);

    // Check if .env was preserved
    const envExists = await fs
      .stat(path.join(info.path, ".env"))
      .then(() => true)
      .catch(() => false);
    expect(envExists).toBe(true);

    // Clean up worktree for test isolation
    await service.removeWorktree(info.id);
  });

  it("should safely remove a worktree", async () => {
    const info = await service.createWorktree("task-456");
    await service.removeWorktree(info.id);

    const exists = await fs
      .stat(info.path)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });
});
