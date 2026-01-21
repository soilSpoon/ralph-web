"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mockTasks } from "@/lib/mock-data";
import { Task, TaskStatus } from "@/lib/types";

export async function createTask(formData: FormData) {
  const description = formData.get("description") as string;
  const status = "draft" as TaskStatus;

  // In a real app, we would save to DB here
  const newTask: Task = {
    id: `t-${Date.now()}`,
    name: "New Task",
    description,
    status,
    priority: 2,
    currentIteration: 1,
    maxIterations: 5,
    branchName: "feature/new-task",
    worktreePath: "/tmp/ralph/new-task",
    metadataPath: "/tmp/ralph/new-task/metadata.json",
    createdAt: new Date(),
    updatedAt: new Date(),
    startedAt: new Date(),
  };

  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("Created task:", newTask);
  mockTasks.push(newTask);

  revalidatePath("/tasks");
  redirect("/tasks");
}
