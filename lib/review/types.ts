import { PRD } from "../prd/generator";
import { Task } from "../types";

export interface ReviewRequest {
  taskId: string;
  type: "prd" | "task";
  content: PRD | Task;
}

export interface ReviewDecision {
  approved: boolean;
  feedback?: string;
  modifiedContent?: PRD | Task;
}

export interface ReviewManagerOptions {
  autoApprovePRD?: boolean;
  autoApproveTask?: boolean;
}
