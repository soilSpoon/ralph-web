import { exec } from "node:child_process";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type {
  RalphLoop,
  RalphLoopOptions,
} from "@/lib/orchestrator/ralph-loop";
import type { WorkflowPhase } from "@/lib/orchestrator/types";

// --- Mocks ---

// Mock child_process exec
vi.mock("node:child_process", () => ({
  exec: vi.fn(),
}));

// Mock pty-runner
vi.mock("@/lib/orchestrator/pty-runner", () => ({
  ptyRunner: {
    spawn: vi.fn(),
  },
}));

// Mock prd/generator
vi.mock("@/lib/prd/generator", () => ({
  prdGenerator: {
    generateQuestions: vi.fn().mockResolvedValue([]),
    generate: vi.fn(),
    revise: vi.fn(),
  },
}));

// Mock db/sync-service
vi.mock("@/lib/db/sync-service", () => ({
  syncService: {
    materializeTask: vi.fn().mockResolvedValue("/mock/prd.json"),
    consolidateTask: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock worktree
const mockWorktreeServiceInstance = {
  createWorktree: vi.fn().mockResolvedValue({
    id: "wt-1",
    path: "/temp/worktree-wt-1",
    branch: "ralph/task-1-wt1",
  }),
  removeWorktree: vi.fn().mockResolvedValue(undefined),
  getSettings: vi.fn().mockReturnValue({}),
};
vi.mock("@/lib/worktree", () => ({
  WorktreeService: vi
    .fn()
    .mockImplementation(() => mockWorktreeServiceInstance),
}));

// Mock memory-ops
vi.mock("@/lib/completion/memory-ops", () => ({
  memoryOps: {
    saveTerminalSnapshot: vi.fn().mockResolvedValue(undefined),
  },
}));

// Define strict types for mocks
interface ExecError extends Error {
  code: number;
  stdout: string;
  stderr: string;
}

// --- Tests ---

describe("RalphLoop", () => {
  let RalphLoopClass: new (opts: RalphLoopOptions) => RalphLoop;
  let loop: RalphLoop;
  let ptyRunner: { spawn: Mock };
  let memoryOps: { saveTerminalSnapshot: Mock };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Dynamic imports
    const rlModule = await import("@/lib/orchestrator/ralph-loop");
    RalphLoopClass = rlModule.RalphLoop;

    const prModule = await import("@/lib/orchestrator/pty-runner");
    ptyRunner = prModule.ptyRunner as unknown as { spawn: Mock };

    const moModule = await import("@/lib/completion/memory-ops");
    memoryOps = moModule.memoryOps as unknown as { saveTerminalSnapshot: Mock };

    // Reset exec default implementation
    (exec as unknown as Mock).mockReset();
    (exec as unknown as Mock).mockImplementation((_cmd, options, callback) => {
      const cb = typeof options === "function" ? options : callback;
      // Default: Success
      cb(null, "Tests passed", "");
      return { unref: () => {} };
    });

    // Reset ptyRunner default implementation
    (ptyRunner.spawn as Mock).mockImplementation(async (options) => {
      setTimeout(() => options.onExit(0), 10);
      return {
        pid: 123,
        onData: vi.fn(),
        onExit: vi.fn(),
        write: vi.fn(),
        kill: vi.fn(),
        resize: vi.fn(),
      };
    });
  });

  const createLoop = (maxIterations = 5) => {
    return new RalphLoopClass({
      id: "session-test",
      taskId: "task-test",
      providerId: "gemini",
      maxIterations,
      metadataPath: "./temp/metadata",
      worktreePath: "./temp/worktree",
    });
  };

  const dummyStory = {
    id: "S-1",
    taskId: "T-1",
    title: "Story 1",
    description: "Desc",
    acceptanceCriteria: [],
    priority: 1,
    passes: false,
  };

  it("should initialize and transition through phases", async () => {
    loop = createLoop();
    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase) => phases.push(phase);

    await loop.initialize();
    expect(phases).toContain("initializing");
  });

  it("should transition to coding and then verifying", async () => {
    loop = createLoop();
    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase) => phases.push(phase);

    await loop.initialize();
    await loop.startCoding(dummyStory);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(phases).toContain("coding");
    expect(phases).toContain("verifying");
    expect(phases).toContain("planning");
  });

  it("should handle verification failure and retry", async () => {
    // Override implementation
    let attempt = 0;
    (exec as unknown as Mock).mockImplementation((cmd, options, callback) => {
      const cb = typeof options === "function" ? options : callback;
      if (cmd.includes("npm test")) {
        attempt++;
        if (attempt === 1) {
          const err = new Error("Command failed") as ExecError;
          err.code = 1;
          err.stdout = "ReferenceError: foo is not defined";
          err.stderr = "";
          cb(err, "ReferenceError: foo is not defined", "");
        } else {
          cb(null, "Success", "");
        }
      } else {
        cb(null, "Success", "");
      }
      return { unref: () => {} };
    });

    loop = createLoop();
    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase) => phases.push(phase);

    await loop.initialize();
    await loop.startCoding(dummyStory);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(memoryOps.saveTerminalSnapshot).toHaveBeenCalled();
    expect(ptyRunner.spawn).toHaveBeenCalledTimes(2);
  });

  it("should detect circular errors and pivot strategy", async () => {
    (exec as unknown as Mock).mockImplementation((_cmd, options, callback) => {
      const cb = typeof options === "function" ? options : callback;
      const err = new Error("Command failed") as ExecError;
      err.code = 1;
      err.stdout = "Persistent Error: X is broken";
      err.stderr = "";
      cb(err, err.stdout, "");
      return { unref: () => {} };
    });

    loop = createLoop();
    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase) => phases.push(phase);

    await loop.initialize();
    await loop.startCoding(dummyStory);

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(phases).toContain("circular_detected");
  });

  it("should stop after max iterations", async () => {
    (exec as unknown as Mock).mockImplementation((_cmd, options, callback) => {
      const cb = typeof options === "function" ? options : callback;
      const err = new Error("Command failed") as ExecError;
      err.code = 1;
      err.stdout = "Some Error";
      err.stderr = "";
      cb(err, err.stdout, "");
      return { unref: () => {} };
    });

    loop = createLoop(2);
    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase) => phases.push(phase);

    await loop.initialize();
    await loop.startCoding(dummyStory);

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(phases).toContain("error");
  });

  describe("Queue Integration", () => {
    it("should transition to queued after PRD approval", async () => {
      loop = createLoop();
      await loop.approvePRD();
      expect(loop.getPhase()).toBe("queued");
    });
  });
});

import { phaseToUIStatus } from "@/lib/orchestrator/types";

describe("phaseToUIStatus", () => {
  it("should map correctly", () => {
    expect(phaseToUIStatus("circular_detected")).toBe("running");
    expect(phaseToUIStatus("error")).toBe("completed");
  });
});
