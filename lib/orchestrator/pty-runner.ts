import os from "os";
import { getActiveProvider } from "./providers";
import type { ProviderId } from "./types";

type PtyRecord = {
  id: string;
  proc: IAgentProcess;
  output: string[];
};

/**
 * Minimal interface for the agent process, matched by node-pty's IPty.
 */
export interface IAgentProcess {
  onData(cb: (data: string) => void): { dispose(): void };
  onExit(cb: (data: { exitCode: number; signal?: number }) => void): {
    dispose(): void;
  };
  write(data: string): void;
  kill(signal?: string): void;
  resize(cols: number, rows: number): void;
}

const ptys = new Map<string, PtyRecord>();

function getDefaultShell(): string {
  if (process.platform === "win32") {
    return process.env.ComSpec || "cmd.exe";
  }
  return process.env.SHELL || "/bin/bash";
}

/**
 * PTYRunner manages lifecycle of pseudoterminals for agents.
 * Inspired by emdash ptyManager for secure environment handling.
 */
export class PTYRunner {
  /**
   * Spawns a new agent session in a PTY.
   */
  async spawn(options: {
    id: string;
    providerId: ProviderId;
    cwd: string;
    prompt: string;
    autoApprove?: boolean;
    onData: (data: string) => void;
    onExit: (code: number, signal?: number) => void;
  }): Promise<IAgentProcess> {
    let ptyModule: typeof import("node-pty");
    try {
      ptyModule = await import("node-pty");
    } catch (error) {
      console.error(
        "Failed to load node-pty. Ensure it is installed and built correctly.",
        error,
      );
      throw error;
    }

    const provider = getActiveProvider(options.providerId);

    const shell = getDefaultShell();

    // 1. Build a clean environment (emdash pattern)
    // Prevents issues with bundled Python/Node paths in packaged apps or specific environments.
    const cleanEnv: Record<string, string> = {
      TERM: "xterm-256color",
      COLORTERM: "truecolor",
      HOME: process.env.HOME || os.homedir(),
      USER: process.env.USER || os.userInfo().username,
      SHELL: process.env.SHELL || shell,
      PATH: process.env.PATH || "",
      LANG: process.env.LANG || "en_US.UTF-8",
      // Add API Keys
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
    };

    // 2. Build shell arguments (emdash pattern)
    // Wrap the CLI command in a login shell to ensure user config (.zshrc, .bashrc) is loaded.
    const args: string[] = [];
    const cliArgs: string[] = [];

    if (options.autoApprove && provider.autoApproveFlag) {
      cliArgs.push(provider.autoApproveFlag);
    }

    if (provider.initialPromptFlag && options.prompt) {
      cliArgs.push(provider.initialPromptFlag);
      cliArgs.push(options.prompt);
    }

    const command = `${provider.cli} ${cliArgs.join(" ")}`.trim();

    if (process.platform !== "win32") {
      const shellBase = shell.split("/").pop() || "";
      if (shellBase === "zsh" || shellBase === "bash") {
        args.push("-lic", command);
      } else {
        args.push("-c", command);
      }
    } else {
      // Windows shell args (simplified)
      args.push("/c", command);
    }

    // 3. Spawn the PTY
    const proc = ptyModule.spawn(shell, args, {
      name: "xterm-256color",
      cols: 120,
      rows: 40,
      cwd: options.cwd,
      env: cleanEnv,
    });

    const record: PtyRecord = {
      id: options.id,
      proc,
      output: [],
    };
    ptys.set(options.id, record);

    proc.onData((data) => {
      record.output.push(data);
      options.onData(data);

      /**
       * Detect Completion Signal (ralph.sh pattern)
       */
      if (data.includes("<promise>COMPLETE</promise>")) {
        // We delay killing it slightly to allow all output to flush
        setTimeout(() => this.kill(options.id), 500);
      }
    });

    proc.onExit(({ exitCode, signal }) => {
      ptys.delete(options.id);
      options.onExit(exitCode, signal);
    });

    return proc;
  }

  write(id: string, data: string): void {
    const record = ptys.get(id);
    if (record) {
      record.proc.write(data);
    }
  }

  kill(id: string): void {
    const record = ptys.get(id);
    if (record) {
      try {
        record.proc.kill();
      } catch (_e) {
        // Ignore kill errors
      }
      ptys.delete(id);
    }
  }

  resize(id: string, cols: number, rows: number): void {
    const record = ptys.get(id);
    if (record) {
      try {
        record.proc.resize(cols, rows);
      } catch (_e) {
        // Ignore resize errors
      }
    }
  }
}

export const ptyRunner = new PTYRunner();
