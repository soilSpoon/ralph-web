import { describe, expect, it } from "vitest";
import { sessionManager } from "./session-manager";

describe("SessionManager", () => {
  it("should create and manage RalphLoop sessions", () => {
    const session = sessionManager.createSession({
      taskId: "task-1",
      providerId: "gemini",
      maxIterations: 5,
      metadataPath: "/tmp",
    });

    expect(session).toBeDefined();
    const sessionId = session.getId();

    expect(sessionManager.getSession(sessionId)).toBe(session);

    sessionManager.deleteSession(sessionId);
    expect(sessionManager.getSession(sessionId)).toBeUndefined();
  });
});
