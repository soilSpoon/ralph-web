import {
  ChildProcess,
  type ExecException,
  type exec,
} from "node:child_process";
import { EventEmitter } from "node:events";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IAgentProcess } from "@/lib/orchestrator/pty-runner";
import { RalphLoop } from "@/lib/orchestrator/ralph-loop";
import type { WorkflowPhase } from "@/lib/orchestrator/types";
import type { ICircularFixDetector } from "./safety/circular-detector";

// --- Mocks ---

// --- Mocks ---

const mockedExec = vi.fn();
vi.mock("node:child_process", () => ({
  ChildProcess: class extends EventEmitter {},
  exec: (...args: Parameters<typeof exec>) => mockedExec(...args),
}));

const mockedSpawn = vi.fn();
vi.mock("@/lib/orchestrator/pty-runner", () => ({
  ptyRunner: { spawn: mockedSpawn },
}));
vi.mock("@/lib/prd/generator", () => ({
  prdGenerator: { generateQuestions: vi.fn().mockResolvedValue([]) },
}));
vi.mock("@/lib/db/sync-service", () => ({
  syncService: {
    materializeTask: vi.fn().mockResolvedValue("/mock/prd.json"),
    consolidateTask: vi.fn().mockResolvedValue(undefined),
  },
}));

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

const mockMemoryService = {
  initialize: vi.fn().mockResolvedValue(undefined),
  reset: vi.fn().mockResolvedValue(undefined),
  initializeForTest: vi.fn().mockResolvedValue(undefined),
};

vi.mock("@/lib/completion/memory-ops", () => ({
  memoryOps: { saveTerminalSnapshot: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock("@/lib/memory/service", () => ({
  memoryService: mockMemoryService,
}));
vi.mock("@/lib/memory/hooks", () => ({
  memoryHooks: {
    preTask: vi.fn().mockResolvedValue(null),
    onComplete: vi.fn().mockResolvedValue(undefined),
  },
}));

// --- Helpers ---

// (Helpers area - mockedExec and mockedSpawn removed from here since they are defined above)

/**
 * Simple mock class for ChildProcess to avoid 'as' assertions.
 */
class MockChildProcess extends ChildProcess {
  override pid = 123;
  override connected = true;
  override killed = false;
  override stdin = null;
  override stdout = null;
  override stderr = null;
  override stdio: ChildProcess["stdio"] = [null, null, null, null, null];
  override kill = vi.fn();
  override send = vi.fn();
  override disconnect = vi.fn();
  override unref = vi.fn();
  override ref = vi.fn();
  override channel = null;
  override exitCode: number | null = null;
  override signalCode: NodeJS.Signals | null = null;
  override spawnargs = [];
  override spawnfile = "";
}

/**
 * Creates a type-safe mock of ChildProcess.
 */
function createMockChildProcess(): ChildProcess {
  return new MockChildProcess();
}

function createMockAgentProcess(): IAgentProcess {
  return {
    pid: 123,
    onData: vi.fn().mockReturnValue({ dispose: vi.fn() }),
    onExit: vi.fn().mockReturnValue({ dispose: vi.fn() }),
    write: vi.fn(),
    kill: vi.fn(),
    resize: vi.fn(),
  };
}

/**
 * Type-safe error class for ExecException.
 */
class MockExecException extends Error implements ExecException {
  code = 1;
  killed = false;
  constructor(message: string) {
    super(message);
    this.name = "ExecException";
  }
}

/**
 * Type-safe error creating helper to avoid 'as any'
 */
function createExecError(message: string): ExecException {
  return new MockExecException(message);
}

type ExecCallback = (
  error: ExecException | null,
  stdout: string | Buffer,
  stderr: string | Buffer,
) => void;

describe("RalphLoop", () => {
  let loop: RalphLoop;

  beforeEach(() => {
    vi.clearAllMocks();

    mockedExec.mockImplementation(
      (
        _cmd: string,
        options: object | ExecCallback,
        callback?: ExecCallback,
      ) => {
        const cb = typeof options === "function" ? options : callback;
        if (cb) cb(null, "Tests passed", "");
        return createMockChildProcess();
      },
    );

    mockedSpawn.mockImplementation(async (options) => {
      setTimeout(() => options.onExit(0), 10);
      return createMockAgentProcess();
    });
  });

  const createLoop = (
    maxIterations = 5,
    circularDetector?: ICircularFixDetector,
  ) => {
    return new RalphLoop({
      id: "session-test",
      taskId: "task-test",
      providerId: "gemini",
      maxIterations,
      metadataPath: "./temp/metadata",
      worktreePath: "./temp/worktree",
      circularDetector,
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
    let transitionCalled = false;
    loop.onTransition = (phase) => {
      if (phase === "initializing") transitionCalled = true;
    };
    await loop.initialize();
    expect(transitionCalled).toBe(true);
  });

  it("should detect circular errors and pivot strategy", async () => {
    let checkCount = 0;
    const mockDetector: ICircularFixDetector = {
      check: vi.fn().mockImplementation(() => {
        checkCount++;
        return { detected: checkCount >= 2, similarity: 1.0 };
      }),
      reset: vi.fn(),
    };

    mockedExec.mockImplementation(
      (
        _cmd: string,
        options: object | ExecCallback,
        callback?: ExecCallback,
      ) => {
        const cb = typeof options === "function" ? options : callback;
        if (cb) cb(createExecError("Fail"), "", "Error");
        return createMockChildProcess();
      },
    );

    loop = createLoop(5, mockDetector);
    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase) => phases.push(phase);

    await loop.initialize();
    await loop.startCoding(dummyStory);

    await new Promise((r) => setTimeout(r, 100));
    expect(phases).toContain("circular_detected");
  });
});
