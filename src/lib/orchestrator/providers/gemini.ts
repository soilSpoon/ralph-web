import {
  AgentSignal,
  CommandOptions,
  IAgentProvider,
} from "../provider-interface";
import { ProviderId } from "../types";

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
      // 신중하게 에러 감지. 단순 텍스트에 "Error:"가 포함될 수도 있으므로.
      // 현재는 명시적인 완료 시그널 위주로 처리
      return null;
    }
    return null;
  }
}
