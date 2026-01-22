import { ProviderId } from "./types";

export interface CommandOptions {
  cwd?: string;
  prompt?: string;
  autoApprove?: boolean;
}

export type AgentSignal = "COMPLETE" | "ERROR" | null;

/**
 * Interface for Agent Providers (e.g., Gemini, Claude, Amp)
 * Handles abstraction of CLI arguments and output parsing.
 */
export interface IAgentProvider {
  readonly id: ProviderId;
  readonly name: string;
  readonly installCommand?: string;

  /**
   * Get the CLI executable name (e.g., "gemini", "claude")
   */
  getExecutable(): string;

  /**
   * Builds the CLI command arguments based on options
   */
  buildArgs(options: CommandOptions): string[];

  /**
   * Detects completion or error signals from stdout
   * Based on ralph.sh pattern (<promise>COMPLETE</promise>)
   */
  detectSignal(output: string): AgentSignal;
}
