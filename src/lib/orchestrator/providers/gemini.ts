import type {
  AgentSignal,
  CommandOptions,
  IAgentProvider,
} from "../provider-interface";
import type { ProviderId } from "../types";

export class GeminiProvider implements IAgentProvider {
  readonly id: ProviderId = "gemini";
  readonly name = "Gemini CLI";
  readonly installCommand = "npm install -g @google/gemini-cli";

  getExecutable(): string {
    return "gemini";
  }

  buildArgs(options: CommandOptions): string[] {
    const args: string[] = [];

    // Auto-approve mode
    if (options.autoApprove) {
      args.push("--yolomode");
    }

    // Initial prompt
    if (options.prompt) {
      args.push("-i");
      args.push(options.prompt);
    }

    // Resume capability could be added here
    // if (options.resume) args.push("--resume");

    return args;
  }

  detectSignal(output: string): AgentSignal {
    if (output.includes("<promise>COMPLETE</promise>")) {
      return "COMPLETE";
    }
    // Gemini CLI might output specifics on error, but generic catch for now
    if (
      output.includes("FATAL ERROR") ||
      (output.includes("Error:") && output.includes("stack trace"))
    ) {
      // Carefully detect errors. Since simple text might contain "Error:",
      // we currently focus on explicit completion signals
      return null;
    }
    return null;
  }
}
