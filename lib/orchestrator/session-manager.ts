import { RalphLoop } from "./ralph-loop";
import type { ProviderId } from "./types";

class SessionManager {
  private sessions = new Map<string, RalphLoop>();

  createSession(options: {
    taskId: string;
    providerId: ProviderId;
    maxIterations: number;
    metadataPath: string;
    worktreePath?: string;
  }): RalphLoop {
    const id = `session-for-${options.taskId}`;
    const session = new RalphLoop({
      id,
      ...options,
    });
    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): RalphLoop | undefined {
    return this.sessions.get(id);
  }

  deleteSession(id: string): void {
    this.sessions.delete(id);
  }
}

export const sessionManager = new SessionManager();
