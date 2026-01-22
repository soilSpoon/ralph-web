import { EventEmitter } from "events";
import { prdGenerator } from "../prd/generator";
import type { Story } from "../types";
import { ptyRunner } from "./pty-runner";
import type { ProviderId, RalphSession, WorkflowPhase } from "./types";

export interface RalphLoopOptions {
  id: string;
  taskId: string;
  providerId: ProviderId;
  maxIterations: number;
  metadataPath: string;
  worktreePath?: string;
  initialPhase?: WorkflowPhase;
}

/**
 * RalphLoop is the brain of the implementation phase.
 * It manages state transitions and coordinates between System and AI.
 */
export class RalphLoop extends EventEmitter {
  private session: RalphSession;
  public onTransition?: (phase: WorkflowPhase) => void;

  constructor(options: RalphLoopOptions) {
    super();
    this.session = {
      id: options.id,
      taskId: options.taskId,
      providerId: options.providerId,
      phase: options.initialPhase || "idle",
      currentIteration: 0,
      maxIterations: options.maxIterations,
      metadataPath: options.metadataPath,
      worktreePath: options.worktreePath,
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      iterations: [],
    };
  }

  /**
   * Initializes the session and transitions to the first active phase.
   */
  async initialize(): Promise<void> {
    this.transition("initializing");

    // Simulate some work like setting up directories
    this.session.lastActivityAt = new Date().toISOString();
  }

  /**
   * Starts the PRD Wizard flow by generating clarifying questions.
   */
  async startPrdWizard(description: string): Promise<void> {
    this.transition("prd_clarifying");
    await prdGenerator.generateQuestions(description);
  }

  /**
   * Enters the planning phase to pick a story.
   */
  async enterPlanning(): Promise<void> {
    this.transition("planning");
  }

  /**
   * Starts the coding phase for a specific story.
   */
  async startCoding(story: Story): Promise<void> {
    this.transition("coding");
    this.session.currentStoryId = story.id;

    const prompt = `
Task: ${story.title}
Description: ${story.description}
Acceptance Criteria:
${story.acceptanceCriteria.map((ac) => `- ${ac}`).join("\n")}

Please implement this story. When finished, print <promise>COMPLETE</promise>.
`.trim();

    await ptyRunner.spawn({
      id: this.session.id,
      providerId: this.session.providerId,
      cwd: this.session.worktreePath || process.cwd(),
      prompt,
      autoApprove: true,
      onData: (data) => {
        this.emit("data", data);
      },
      onExit: (_code) => {
        this.transition("verifying");
      },
    });
  }

  private transition(phase: WorkflowPhase): void {
    this.session.phase = phase;
    this.session.lastActivityAt = new Date().toISOString();
    this.emit("transition", phase);
    if (this.onTransition) {
      this.onTransition(phase);
    }
  }

  /**
   * Approves the PRD and moves to Queued state.
   */
  async approvePRD(): Promise<void> {
    this.transition("queued");
  }

  /**
   * Starts execution from the queue.
   */
  async startExecution(): Promise<void> {
    this.transition("initializing");
    // After initializing, it should enter planning loop logic.
    // For now, we only handle the transition as per the test requirement.
  }

  getPhase(): WorkflowPhase {
    return this.session.phase;
  }

  getId(): string {
    return this.session.id;
  }
}
