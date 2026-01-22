import { describe, expect, it } from "vitest";
import { GitClient } from "./git-client";

describe("GitClient", () => {
  it("should create a SimpleGit instance with detected PATH", async () => {
    const client = new GitClient({ baseDir: process.cwd() });
    const git = await client.getGit();

    expect(git).toBeDefined();
    // simple-git's internal state is hard to check directly,
    // but we can verify our custom detection logic was called
  });

  it("should detect natural base branches (detectBaseRef)", async () => {
    // This will require actual git or a mock
    // For now, let's keep it simple to get to RED
    const client = new GitClient({ baseDir: process.cwd() });
    const baseRef = await client.detectBaseRef();
    expect(baseRef).toBeTypeOf("string");
  });
});
