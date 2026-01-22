import { describe, expect, it } from "vitest";
import { POST as reviewHandler } from "@/app/api/orchestrator/review/route";
import { GET as statusHandler } from "@/app/api/orchestrator/status/route";
import { POST as stopHandler } from "@/app/api/orchestrator/stop/route";

describe("Orchestrator API Handlers", () => {
  describe("POST /stop", () => {
    it("should return 404 if session not found", async () => {
      const req = new Request("http://localhost:3000/api/orchestrator/stop", {
        method: "POST",
        body: JSON.stringify({ sessionId: "missing-session" }),
      });
      const res = await stopHandler(req);
      expect(res.status).toBe(404);
    });
  });

  describe("GET /status", () => {
    it("should return 404 if session not found", async () => {
      // Next.js Request with searchParams
      const url = new URL("http://localhost:3000/api/orchestrator/status");
      url.searchParams.set("sessionId", "missing-session");
      const req = new Request(url.toString());

      const res = await statusHandler(req);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /review", () => {
    it("should return 404 if session not found", async () => {
      const req = new Request("http://localhost:3000/api/orchestrator/review", {
        method: "POST",
        body: JSON.stringify({
          sessionId: "missing-session",
          type: "prd",
          decision: { approved: true },
        }),
      });
      const res = await reviewHandler(req);
      expect(res.status).toBe(404);
    });
  });
});
