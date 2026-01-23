import type { ChildProcess } from "node:child_process";
import { exec } from "node:child_process";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { memoryOps } from "@/lib/completion/memory-ops";
import { type IAgentProcess, ptyRunner } from "@/lib/orchestrator/pty-runner";
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

// Mock CircularFixDetector to control circular detection in tests
const mockCircularDetector = {
  check: vi.fn().mockReturnValue({ detected: false, count: 0 }),
  reset: vi.fn(),
};
vi.mock("@/lib/orchestrator/safety/circular-detector", () => ({
  CircularFixDetector: vi.fn().mockImplementation(() => mockCircularDetector),
}));

// Define strict types for mocks
interface ExecError extends Error {
  code: number;
  stdout: string;
  stderr: string;
}

// Helper to create a compliant ExecError
const createExecError = (
  message: string,
  code: number,
  stdout: string,
  stderr = "",
): ExecError => {
  return Object.assign(new Error(message), { code, stdout, stderr });
};

// Helper for safe casting in tests
const asMock = (fn: unknown): Mock => fn as Mock;

// Helper to create a basic Mock ChildProcess
const createMockChildProcess = (): ChildProcess => {
  return {
    unref: vi.fn(),
  } as unknown as ChildProcess;
};

// Helper to create a compliant IAgentProcess mock
const createMockAgentProcess = (
  overrides?: Partial<IAgentProcess>,
): IAgentProcess => ({
  pid: 123,
  onData: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  onExit: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  write: vi.fn(),
  kill: vi.fn(),
  resize: vi.fn(),
  ...overrides,
});

// --- Tests ---

describe("RalphLoop", () => {
  let RalphLoopClass: new (opts: RalphLoopOptions) => RalphLoop;
  let loop: RalphLoop;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Dynamic imports
    const rlModule = await import("@/lib/orchestrator/ralph-loop");
    RalphLoopClass = rlModule.RalphLoop;

    // Reset exec default implementation
    asMock(exec).mockReset();
    asMock(exec).mockImplementation((_cmd, options, callback) => {
      const cb = typeof options === "function" ? options : callback;
      // Default: Success
      if (cb) {
        cb(null, "Tests passed", "");
      }
      return createMockChildProcess();
    });

    // Reset CircularFixDetector mock - default: no circular detection
    mockCircularDetector.check.mockReset();
    mockCircularDetector.check.mockReturnValue({ detected: false, count: 0 });
    mockCircularDetector.reset.mockReset();

    // Reset ptyRunner default implementation
    asMock(ptyRunner.spawn).mockImplementation(async (options) => {
      setTimeout(() => options.onExit(0), 10);
      return createMockAgentProcess();
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

  // TODO: Fix async timing issue with mock - the mock's setTimeout chain
  // causes unexpected multiple spawns. Needs proper async flow control.
  it.skip("should transition to coding and then verifying", async () => {
    // Ensure tests pass on first attempt (no retries)
    asMock(exec).mockImplementation((_cmd, options, callback) => {
      const cb = typeof options === "function" ? options : callback;
      if (cb) {
        cb(null, "All tests passed", "");
      }
      return createMockChildProcess();
    });

    // Override spawn to call onExit only once
    let spawnCalled = false;
    asMock(ptyRunner.spawn).mockImplementation(async (options) => {
      if (!spawnCalled) {
        spawnCalled = true;
        setTimeout(() => options.onExit(0), 10);
      }
      return createMockAgentProcess();
    });

    loop = createLoop();
    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase) => phases.push(phase);

    await loop.initialize();
    await loop.startCoding(dummyStory);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(phases).toContain("coding");
    expect(phases).toContain("verifying");
    expect(phases).toContain("planning");
  });

  // TODO: Fix async timing issue with CircularDetector mock - the mock reset
  // doesn't properly propagate to the RalphLoop instance created in the test.
  it.skip("should handle verification failure and retry", async () => {
    // Explicitly reset circular detector mock to ensure no detection
    mockCircularDetector.check.mockReset();
    mockCircularDetector.check.mockReturnValue({ detected: false, count: 0 });

    // Override implementation - first exec fails, second succeeds
    let execAttempt = 0;
    asMock(exec).mockImplementation((cmd, options, callback) => {
      const cb = typeof options === "function" ? options : callback;
      if (typeof cmd === "string" && cmd.includes("npm test")) {
        execAttempt++;
        if (execAttempt === 1) {
          const err = createExecError(
            "Command failed",
            1,
            `UniqueError_${Date.now()}_${Math.random()}: foo is not defined`,
          );
          if (cb) cb(err, err.stdout, "");
        } else {
          if (cb) cb(null, "Success", "");
        }
      } else {
        if (cb) cb(null, "Success", "");
      }
      return createMockChildProcess();
    });

    // Override spawn to call onExit exactly twice (first fail, then success)
    let spawnCount = 0;
    asMock(ptyRunner.spawn).mockImplementation(async (options) => {
      spawnCount++;
      if (spawnCount <= 2) {
        setTimeout(() => options.onExit(0), 10);
      }
      return createMockAgentProcess();
    });

    loop = createLoop();
    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase) => phases.push(phase);

    await loop.initialize();
    await loop.startCoding(dummyStory);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(memoryOps.saveTerminalSnapshot).toHaveBeenCalled();
    expect(ptyRunner.spawn).toHaveBeenCalledTimes(2);
  });

  it("should detect circular errors and pivot strategy", async () => {
    // Override CircularDetector mock to detect circular on 3rd attempt
    let checkCount = 0;
    mockCircularDetector.check.mockImplementation(() => {
      checkCount++;
      return { detected: checkCount >= 3, count: checkCount };
    });

    asMock(exec).mockImplementation((_cmd, options, callback) => {
      const cb = typeof options === "function" ? options : callback;
      const err = createExecError(
        "Command failed",
        1,
        "Persistent Error: X is broken",
      );
      if (cb) cb(err, err.stdout, "");
      return createMockChildProcess();
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
    asMock(exec).mockImplementation((_cmd, options, callback) => {
      const cb = typeof options === "function" ? options : callback;
      const err = createExecError("Command failed", 1, "Some Error");
      if (cb) cb(err, err.stdout, "");
      return createMockChildProcess();
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
