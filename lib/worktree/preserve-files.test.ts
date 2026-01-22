import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { preserveFilesToWorktree } from "./preserve-files";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

describe("preserveFilesToWorktree", () => {
  let tempSourceDir: string;
  let tempDestDir: string;

  beforeEach(async () => {
    tempSourceDir = await fs.mkdtemp(path.join(os.tmpdir(), "ralph-source-"));
    tempDestDir = await fs.mkdtemp(path.join(os.tmpdir(), "ralph-dest-"));

    // Create mock files
    await fs.writeFile(path.join(tempSourceDir, ".env"), "SOURCE=true");
    await fs.writeFile(path.join(tempSourceDir, ".envrc"), "export FOO=bar");
    await fs.writeFile(path.join(tempSourceDir, "secret.txt"), "secret");
    await fs.mkdir(path.join(tempSourceDir, "node_modules"), {
      recursive: true,
    });
    await fs.writeFile(path.join(tempSourceDir, "node_modules/bad.txt"), "bad");
  });

  afterEach(async () => {
    await fs.rm(tempSourceDir, { recursive: true, force: true });
    await fs.rm(tempDestDir, { recursive: true, force: true });
  });

  it("should preserve matched files and skip excluded directories", async () => {
    const result = await preserveFilesToWorktree(
      tempSourceDir,
      tempDestDir,
      [".env", ".envrc"], // patterns
      ["node_modules"], // exclude
    );

    expect(result.copied).toContain(".env");
    expect(result.copied).toContain(".envrc");
    expect(result.copied).not.toContain("secret.txt");

    const envExists = await fs
      .stat(path.join(tempDestDir, ".env"))
      .then(() => true)
      .catch(() => false);
    expect(envExists).toBe(true);

    const nodeModulesExists = await fs
      .stat(path.join(tempDestDir, "node_modules/bad.txt"))
      .then(() => true)
      .catch(() => false);
    expect(nodeModulesExists).toBe(false);
  });
});
