import { EventEmitter } from "node:events";
import type {
  ReviewDecision,
  ReviewManagerOptions,
  ReviewRequest,
} from "./types";

export class ReviewManager extends EventEmitter {
  private options: ReviewManagerOptions;
  private pendingReviews: Map<string, (decision: ReviewDecision) => void>;

  constructor(options: ReviewManagerOptions = {}) {
    super();
    this.options = options;
    this.pendingReviews = new Map();
  }

  async waitForReview(request: ReviewRequest): Promise<ReviewDecision> {
    // Auto-approve check
    if (request.type === "prd" && this.options.autoApprovePRD) {
      return { approved: true, feedback: "Auto-approved by settings" };
    }
    if (request.type === "task" && this.options.autoApproveTask) {
      return { approved: true, feedback: "Auto-approved by settings" };
    }

    // Wait for manual review
    // Key format: "taskId:type" (Assuming one active review per type per task)
    const key = `${request.taskId}:${request.type}`;

    // Notify Listeners (e.g. WebSocket server)
    this.emit("review_requested", request);

    return new Promise<ReviewDecision>((resolve) => {
      this.pendingReviews.set(key, resolve);
    });
  }

  submitReview(
    taskId: string,
    type: "prd" | "task",
    decision: ReviewDecision,
  ): void {
    const key = `${taskId}:${type}`;
    const resolve = this.pendingReviews.get(key);

    if (resolve) {
      resolve(decision);
      this.pendingReviews.delete(key);
      this.emit("review_submitted", { taskId, type, decision });
    } else {
      console.warn(`No pending review found for ${key}`);
    }
  }
}

export const reviewManager = new ReviewManager(); // Default instance
