import os from "os";
import { AgentSignal } from "./provider-interface";
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
 * Integrates with IAgentProvider for command generation and signal detection.
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

    // 1. Build a clean environment (Security Best Practice)
    const cleanEnv: Record<string, string> = {
      TERM: "xterm-256color",
      COLORTERM: "truecolor",
      HOME: process.env.HOME || os.homedir(),
      USER: process.env.USER || os.userInfo().username,
      SHELL: process.env.SHELL || shell,
      PATH: process.env.PATH || "",
      LANG: process.env.LANG || "en_US.UTF-8",
      // Pass through API Keys
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || "",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    };

    // 2. Build shell arguments via Provider Interface
    const providerArgs = provider.buildArgs({
      prompt: options.prompt,
      autoApprove: options.autoApprove,
      cwd: options.cwd,
    });

    // Construct the command string
    const command =
      `${provider.getExecutable()} ${providerArgs.join(" ")}`.trim();

    const args: string[] = [];

    if (process.platform !== "win32") {
      const shellBase = shell.split("/").pop() || "";
      if (shellBase === "zsh" || shellBase === "bash") {
        args.push("-lic", command);
      } else {
        args.push("-c", command);
      }
    } else {
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
       * Detect Completion Signal via Provider
       */
      const signal: AgentSignal = provider.detectSignal(data);
      if (signal === "COMPLETE") {
        // We delay killing it slightly to allow all output to flush
        setTimeout(() => this.kill(options.id), 500);
      }
      // Handle ERROR signal if needed
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
