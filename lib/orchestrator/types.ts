/**
 * Workflow phases for the Ralph Loop orchestrator.
 * Expanded to support the PRD Wizard 4-step process and the task execution loop.
 */
export type WorkflowPhase =
  // --- Infrastructure & Planning ---
  | "idle" // Step 1: Describe (Waiting for user input)
  | "initializing" // Preparing Worktree and environment
  | "prd_clarifying" // Step 2: Clarify (AI generating questions, user answering)
  | "prd_generating" // Step 3: Review (AI generating the structured PRD)
  | "prd_reviewing" // Step 4: Approve (User reviewing/approving the PRD)

  // --- Queue ---
  | "queued" // PRD approved, waiting for execution slot

  // --- Implementation Loop (The Ralph Loop) ---
  | "planning" // Selecting the next story/task to implement (System)
  | "coding" // Agent is actively writing/modifying code (AI)
  | "verifying" // Running builds and tests to verify changes (System)

  // --- Completion & Review ---
  | "task_reviewing" // Final task review by the user
  | "completing" // Git operations, memory extraction, etc.
  | "completed" // Task finished
  | "failed" // Task failed or stopped due to errors
  | "stopped"; // Manually stopped by the user

export type UIStatus = "draft" | "queued" | "running" | "review" | "completed";

export function phaseToUIStatus(phase: WorkflowPhase): UIStatus {
  if (
    ["idle", "prd_clarifying", "prd_generating", "prd_reviewing"].includes(
      phase,
    )
  ) {
    return "draft";
  }
  if (phase === "queued") return "queued";
  if (["initializing", "planning", "coding", "verifying"].includes(phase)) {
    return "running";
  }
  if (phase === "task_reviewing") return "review";
  return "completed";
}

/**
 * Provider information for coding agents.
 */
export type ProviderId = "gemini" | "claude" | "amp" | "codex";

export interface ProviderDefinition {
  id: ProviderId;
  name: string;
  cli: string;
  installCommand?: string;
  autoApproveFlag?: string;
  initialPromptFlag?: string;
  resumeFlag?: string;
  icon?: string;
}

/**
 * Iteration record for a Ralph session.
 */
export interface Iteration {
  id: string;
  phase: WorkflowPhase;
  storyId?: string;
  stdout: string[];
  stderr: string[];
  status: "success" | "failure" | "running";
  startedAt: string;
  endedAt?: string;
}

/**
 * Ralph session state maintained by the orchestrator.
 */
export interface RalphSession {
  id: string;
  taskId: string;
  providerId: ProviderId;

  // Workflow state
  phase: WorkflowPhase;
  currentIteration: number;
  maxIterations: number;

  // Current work context
  currentStoryId?: string;
  worktreePath?: string;
  metadataPath: string; // .ralph/tasks/{taskId}/

  // PTY process info
  ptyId?: string;

  // Timing
  startedAt: string;
  lastActivityAt: string;

  // History
  iterations: Iteration[];
}
