"use server";

import { redirect } from "next/navigation";
import { taskManager } from "@/lib/tasks/task-manager";
import { Task } from "@/lib/types";

export async function createTask(formData: FormData) {
  const description = formData.get("description") as string;
  const prd = formData.get("prd") as string;
  const taskId = `task-${Date.now()}`;

  const newTask: Task = {
    id: taskId,
    name: description.substring(0, 30) + (description.length > 30 ? "..." : ""),
    description: prd || description,
    status: "draft",
    priority: 2,
    currentIteration: 0,
    maxIterations: 5,
    worktreePath: `./.ralph/tasks/${taskId}/worktree`,
    branchName: `ralph/${taskId}`,
    metadataPath: `./.ralph/tasks/${taskId}/metadata`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  taskManager.addTask(newTask);

  // Trigger orchestration start (Fire and forget or wait depending on UX)
  // In a real app, this would be a trigger to a background worker
  try {
    // We call our internal API to start the session
    // Note: absolute URL needed for server-to-server fetch in some environments,
    // but here we are in a server action on the same origin.
    // For simplicity, we can also call the sessionManager directly since it's shared.
    const { sessionManager } = await import(
      "@/lib/orchestrator/session-manager"
    );
    const session = sessionManager.createSession({
      taskId,
      providerId: "gemini",
      maxIterations: 5,
      metadataPath: newTask.metadataPath,
      worktreePath: newTask.worktreePath,
    });
    await session.initialize();
  } catch (e) {
    console.error("Failed to auto-start orchestrator:", e);
  }

  redirect(`/tasks/${taskId}`);
}
