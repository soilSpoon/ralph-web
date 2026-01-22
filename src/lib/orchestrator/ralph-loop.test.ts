import { describe, expect, it, vi } from "vitest";
import { RalphLoop } from "@/lib/orchestrator/ralph-loop";
import type { WorkflowPhase } from "@/lib/orchestrator/types";

vi.mock("./pty-runner", () => ({
  ptyRunner: {
    spawn: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("../prd/generator", () => ({
  prdGenerator: {
    generateQuestions: vi.fn().mockResolvedValue([]),
    generate: vi.fn(),
    revise: vi.fn(),
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

vi.mock("../worktree", () => ({
  WorktreeService: vi
    .fn()
    .mockImplementation(() => mockWorktreeServiceInstance),
}));

describe("RalphLoop", () => {
  it("should initialize and transition through phases", async () => {
    const loop = new RalphLoop({
      id: "session-1",
      taskId: "task-1",
      providerId: "gemini",
      maxIterations: 5,
      metadataPath: "./temp/metadata",
    });

    // We want to test that it reaches 'prd_generating' phase
    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase: WorkflowPhase) => phases.push(phase);

    await loop.initialize();

    expect(phases).toContain("initializing");

    // Check if worktree was created
    expect(mockWorktreeServiceInstance.createWorktree).toHaveBeenCalledWith(
      "task-1",
    );
  });

  it("should transition to prd_clarifying when starting wizard", async () => {
    const loop = new RalphLoop({
      id: "session-2",
      taskId: "task-2",
      providerId: "gemini",
      maxIterations: 5,
      metadataPath: "./temp/metadata",
    });

    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase: WorkflowPhase) => phases.push(phase);

    await loop.initialize();
    await loop.startPrdWizard("새로운 인증 모듈을 만들고 싶어");

    expect(phases).toContain("prd_clarifying");
  });

  it("should transition to planning and select a story", async () => {
    const loop = new RalphLoop({
      id: "session-3",
      taskId: "task-3",
      providerId: "gemini",
      maxIterations: 5,
      metadataPath: "./temp/metadata",
    });

    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase: WorkflowPhase) => phases.push(phase);

    await loop.initialize();
    await loop.enterPlanning();

    expect(phases).toContain("planning");
  });

  it("should transition to coding and spawn a PTY", async () => {
    const loop = new RalphLoop({
      id: "session-4",
      taskId: "task-4",
      providerId: "gemini",
      maxIterations: 5,
      metadataPath: "./temp/metadata",
      worktreePath: "./temp/worktree",
    });

    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase: WorkflowPhase) => phases.push(phase);

    await loop.initialize();
    await loop.startCoding({
      id: "S-1",
      taskId: "T-1",
      title: "Story 1",
      description: "Desc",
      acceptanceCriteria: [],
      priority: 1,
      passes: false,
    });

    expect(phases).toContain("coding");
  });

  it("should transition to verifying when PTY exits", async () => {
    let capturedOnExit: (code: number) => void = () => {};
    const { ptyRunner } = await import("./pty-runner");
    vi.spyOn(ptyRunner, "spawn").mockImplementation(async (options) => {
      capturedOnExit = options.onExit;
      return {
        onData: vi.fn(() => ({ dispose: vi.fn() })),
        onExit: vi.fn(() => ({ dispose: vi.fn() })),
        write: vi.fn(),
        kill: vi.fn(),
        resize: vi.fn(),
      };
    });

    const loop = new RalphLoop({
      id: "session-5",
      taskId: "task-5",
      providerId: "gemini",
      maxIterations: 5,
      metadataPath: "./temp/metadata",
      worktreePath: "./temp/worktree",
    });

    const phases: WorkflowPhase[] = [];
    loop.onTransition = (phase: WorkflowPhase) => phases.push(phase);

    await loop.initialize();
    await loop.startCoding({
      id: "S-1",
      taskId: "T-1",
      title: "Story 1",
      description: "Desc",
      acceptanceCriteria: [],
      priority: 1,
      passes: false,
    });

    // Simulate PTY exit
    capturedOnExit(0);

    expect(phases).toContain("verifying");
  });

  describe("Queue Integration", () => {
    it("should transition to queued after PRD approval", async () => {
      const loop = new RalphLoop({
        id: "session-q1",
        taskId: "task-q1",
        providerId: "gemini",
        maxIterations: 5,
        metadataPath: "./temp/metadata",
      });

      await loop.approvePRD();
      expect(loop.getPhase()).toBe("queued");
    });

    it("should transition to initializing when started from queue", async () => {
      const loop = new RalphLoop({
        id: "session-q2",
        taskId: "task-q2",
        providerId: "gemini",
        maxIterations: 5,
        metadataPath: "./temp/metadata",
        initialPhase: "queued",
      });

      await loop.startExecution();
      expect(loop.getPhase()).toBe("initializing");
    });
  });
});

import { phaseToUIStatus } from "./types";

describe("phaseToUIStatus", () => {
  it("should map correctly", () => {
    expect(phaseToUIStatus("prd_clarifying")).toBe("draft");
    expect(phaseToUIStatus("queued")).toBe("queued");
    expect(phaseToUIStatus("coding")).toBe("running");
    expect(phaseToUIStatus("task_reviewing")).toBe("review");
    expect(phaseToUIStatus("completed")).toBe("completed");
  });
});
