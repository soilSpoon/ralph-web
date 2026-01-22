import { describe, expect, it } from "vitest";
import { PRD } from "@/lib/prd/generator";
import { ReviewManager } from "@/lib/review/manager";
import { ReviewRequest } from "@/lib/review/types";

describe("ReviewManager", () => {
  const createMockPRD = (overrides: Partial<PRD> = {}): PRD => ({
    project: "Test Project",
    description: "Test Desc",
    goals: [],
    stories: [],
    functionalRequirements: [],
    nonGoals: [],
    assumptions: [],
    successMetrics: [],
    ...overrides,
  });

  it("should auto-approve when settings.autoApprovePRD is true", async () => {
    const manager = new ReviewManager({ autoApprovePRD: true });
    const request: ReviewRequest = {
      taskId: "t1",
      type: "prd",
      content: createMockPRD(),
    };
    const decision = await manager.waitForReview(request);
    expect(decision.approved).toBe(true);
  });

  it("should wait for manual review when auto-approve is false", async () => {
    const manager = new ReviewManager({ autoApprovePRD: false });
    const request: ReviewRequest = {
      taskId: "t2",
      type: "prd",
      content: createMockPRD(),
    };

    const decisionPromise = manager.waitForReview(request);

    setTimeout(() => {
      manager.submitReview("t2", "prd", { approved: true });
    }, 10);

    const decision = await decisionPromise;
    expect(decision.approved).toBe(true);
  });

  it("should handle rejection with feedback", async () => {
    const manager = new ReviewManager({ autoApprovePRD: false });
    const request: ReviewRequest = {
      taskId: "t3",
      type: "prd",
      content: createMockPRD(),
    };

    const decisionPromise = manager.waitForReview(request);

    setTimeout(() => {
      manager.submitReview("t3", "prd", {
        approved: false,
        feedback: "Fix typo",
      });
    }, 10);

    const decision = await decisionPromise;
    expect(decision.approved).toBe(false);
    expect(decision.feedback).toBe("Fix typo");
  });
});
