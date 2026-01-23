import { exec } from "node:child_process";
import { EventEmitter } from "node:events";
import { promisify } from "node:util";
import { memoryOps } from "../completion/memory-ops";
import { syncService } from "../db/sync-service";
import { memoryHooks } from "../memory/hooks";
import { memoryService } from "../memory/service";
import { prdGenerator } from "../prd/generator";
import type { Story } from "../types";
import { WorktreeService } from "../worktree";
import { ptyRunner } from "./pty-runner";
import {
  CircularFixDetector,
  type ICircularFixDetector,
} from "./safety/circular-detector";
import type { ProviderId, RalphSession, WorkflowPhase } from "./types";

const execAsync = promisify(exec);

export interface RalphLoopOptions {
  id: string;
  taskId: string;
  providerId: ProviderId;
  maxIterations: number;
  metadataPath: string;
  worktreePath?: string;
  initialPhase?: WorkflowPhase;
  circularDetector?: ICircularFixDetector;
}

import { z } from "zod";

const VerificationResultSchema = z.union([
  z.object({ passed: z.literal(true), output: z.string() }),
  z.object({ passed: z.literal(false), errorOutput: z.string() }),
]);

type VerificationResult = z.infer<typeof VerificationResultSchema>;

const ExecErrorSchema = z.object({
  message: z.string(),
  stdout: z.string(),
  stderr: z.string(),
});

type ExecError = z.infer<typeof ExecErrorSchema>;

function isExecError(error: unknown): error is ExecError {
  return ExecErrorSchema.safeParse(error).success;
}

/**
 * RalphLoop is the brain of the implementation phase.
 * It manages state transitions and coordinates between System and AI.
 */
export class RalphLoop extends EventEmitter {
  private session: RalphSession;
  private worktreeService: WorktreeService;
  private circularDetector: ICircularFixDetector;
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
    this.worktreeService = new WorktreeService(process.cwd());
    this.circularDetector =
      options.circularDetector || new CircularFixDetector();
  }

  /**
   * Initializes the session and transitions to the first active phase.
   */
  async initialize(): Promise<void> {
    this.transition("initializing");

    try {
      // Initialize Cognitive Kernel
      await memoryService.initialize();
      console.log("[RalphLoop] Cognitive Kernel initialized.");

      const worktree = await this.worktreeService.createWorktree(
        this.session.taskId,
      );
      this.session.worktreePath = worktree.path;
    } catch (error) {
      console.error("[RalphLoop] Failed to create worktree:", error);
      // Fallback to process.cwd() or just mark as failed?
      // For now we continue but without a worktree path.
    }

    this.session.lastActivityAt = new Date().toISOString();

    // Sync from DB to File on init
    await syncService.materializeTask(this.session.taskId);
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
  async startCoding(story: Story, retryPrompt?: string): Promise<void> {
    this.transition("coding");
    this.session.currentStoryId = story.id;

    // Ensure files are up to date before coding
    await syncService.materializeTask(this.session.taskId);

    const basePrompt = `
Task: ${story.title}
Description: ${story.description}
Acceptance Criteria:
${story.acceptanceCriteria.map((ac) => `- ${ac}`).join("\n")}

Please implement this story. When finished, print <promise>COMPLETE</promise>.
`.trim();

    const memoryWarning = await memoryHooks.preTask(story.description);
    const contextPrompt = memoryWarning ? `\n${memoryWarning}\n` : "";

    const prompt = retryPrompt
      ? `${retryPrompt}\n\n${contextPrompt}\n${basePrompt}`
      : `${contextPrompt}${basePrompt}`;

    await ptyRunner.spawn({
      id: this.session.id,
      providerId: this.session.providerId,
      cwd: this.session.worktreePath || process.cwd(),
      prompt,
      autoApprove: true,
      onData: (data) => {
        this.emit("data", data);
      },
      onExit: async (_code) => {
        // Sync from File back to DB after agent finished
        await syncService.consolidateTask(this.session.taskId);
        this.transition("verifying");
        await this.runVerification(story);
      },
    });
  }

  private async runVerification(story: Story) {
    let result: VerificationResult;
    try {
      // Run tests (adjust command as needed)
      const { stdout } = await execAsync("npm test", {
        cwd: this.session.worktreePath || process.cwd(),
      });
      result = { passed: true, output: stdout };
    } catch (error) {
      if (isExecError(error)) {
        result = {
          passed: false,
          errorOutput: `${error.message}\n${error.stdout}\n${error.stderr}`,
        };
      } else {
        result = {
          passed: false,
          errorOutput: error instanceof Error ? error.message : String(error),
        };
      }
    }

    if (!result.passed) {
      // Check iteration limit first
      if (this.session.currentIteration >= this.session.maxIterations) {
        this.transition("error"); // Max iterations reached
        return;
      }

      this.session.currentIteration++;

      // Circular detection
      const safety = this.circularDetector.check(result.errorOutput);
      if (safety.detected) {
        this.transition("circular_detected");
        await this.injectGotchaAndPivot(result.errorOutput, story);
        return;
      }

      // Save snapshot
      await memoryOps.saveTerminalSnapshot(this.session.id, result);

      // Retry (Basic loop)
      const retryPrompt = `Tests failed:\n${result.errorOutput}\nPlease fix the errors.`;
      await this.startCoding(story, retryPrompt);
    } else {
      // Passed
      this.transition("planning"); // Or task_reviewing
      // Reset circular detector for next story
      this.circularDetector.reset();

      // Store success trajectory
      await memoryHooks.onComplete({
        taskId: this.session.id,
        taskDescription: story.description,
        success: true,
        output: result.output,
        latencyMs: 0, // Need to track this
      });
    }
  }

  private async injectGotchaAndPivot(errorOutput: string, story: Story) {
    console.log("[RalphLoop] Circular detected. Injecting Gotcha...");
    // Logic to ask LLM for new strategy or manual intervention
    // For now, we just retry with a strong hint (placeholder)
    const newStrategyPrompt = `You seem to be stuck in a loop with this error:\n${errorOutput}\n\nPlease try a completely different approach.`;
    await this.startCoding(story, newStrategyPrompt);
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
