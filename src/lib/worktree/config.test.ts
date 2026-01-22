import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { WorktreeService } from "./worktree-service";

describe("WorktreeService with .ralph.json", () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await fs.mkdtemp(path.join(os.tmpdir(), "ralph-config-test-"));
  });

  afterEach(async () => {
    await fs.rm(projectDir, { recursive: true, force: true });
  });

  it("should load settings from .ralph.json if it exists", async () => {
    const config = {
      preservePatterns: ["custom.env"],
      branchPrefix: "custom-ralph",
    };
    await fs.writeFile(
      path.join(projectDir, ".ralph.json"),
      JSON.stringify(config),
    );

    // We need to pass the directory to the service
    const service = new WorktreeService(projectDir);

    // Check if private settings are updated
    const settings = service.getSettings();
    expect(settings.preservePatterns).toContain("custom.env");
    expect(settings.branchPrefix).toBe("custom-ralph");
    // Should still have defaults
    expect(settings.preservePatterns).toContain(".env");
  });
});
