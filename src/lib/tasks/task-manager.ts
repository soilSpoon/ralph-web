import { eq } from "drizzle-orm";
import { type Task as DBTask, getDB, tasks } from "@/lib/db";
import type { Task } from "../types";

class TaskManager {
  async getTasks(): Promise<Task[]> {
    const db = await getDB();
    if (!db) return [];
    const results = await db.query.tasks.findMany({
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });
    return results.map((t) => this.mapDBTaskToTask(t));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const db = await getDB();
    if (!db) return undefined;
    const result = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });
    return result ? this.mapDBTaskToTask(result) : undefined;
  }

  async addTask(task: Task): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db.insert(tasks).values({
      id: task.id,
      name: task.name,
      description: task.description,
      branchName: task.branchName,
      status: task.status,
      priority: task.priority,
      currentIteration: task.currentIteration,
      maxIterations: task.maxIterations,
      worktreePath: task.worktreePath,
      metadataPath: task.metadataPath,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      archived: task.archived ?? false,
    });
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const db = await getDB();
    if (!db) return;
    await db
      .update(tasks)
      .set({
        ...updates,
      })
      .where(eq(tasks.id, id));
  }

  private mapDBTaskToTask(dbTask: DBTask): Task {
    return {
      ...dbTask,
      description: dbTask.description ?? "",
      worktreePath: dbTask.worktreePath ?? "",
      metadataPath: dbTask.metadataPath ?? "",
      startedAt: dbTask.startedAt ?? undefined,
      completedAt: dbTask.completedAt ?? undefined,
    };
  }
}

export const taskManager = new TaskManager();
