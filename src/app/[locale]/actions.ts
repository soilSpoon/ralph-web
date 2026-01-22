"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { mockTasks } from "@/lib/mock-data";
import { Task } from "@/lib/types";

const createTaskSchema = z.object({
  description: z.string().min(1, "Description is required"),
});

export async function createTask(formData: FormData) {
  const result = createTaskSchema.safeParse({
    description: formData.get("description"),
  });

  if (!result.success) {
    throw new Error(result.error.issues[0].message);
  }

  const { description } = result.data;

  // In a real app, we would save to DB here
  const newTask: Task = {
    id: `t-${Date.now()}`,
    name: "New Task",
    description,
    status: "draft",
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
