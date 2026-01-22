import { beforeEach, describe, expect, it } from "vitest";
import { getDB } from "../db";
import type { Task } from "../types";
import { taskManager } from "./task-manager";

describe("TaskManager", () => {
  beforeEach(async () => {
    // Attempt to get a fresh instance
    await getDB({ forceNew: true });
  });

  const createTestTask = (overrides: Partial<Task>): Task => ({
    id: `test-id-${Math.random().toString(36).substring(7)}`,
    name: "Test Task",
    description: "Description",
    branchName: "main",
    status: "draft",
    priority: 1,
    currentIteration: 0,
    maxIterations: 5,
    worktreePath: "/tmp",
    metadataPath: "/tmp",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  it("should add and retrieve a task", async () => {
    const id = crypto.randomUUID();
    const newTask = createTestTask({ id });

    await taskManager.addTask(newTask);
    const retrieved = await taskManager.getTask(id);
    expect(retrieved).toMatchObject(newTask);
  });

  it("should list all tasks", async () => {
    const id = crypto.randomUUID();
    await taskManager.addTask(createTestTask({ id }));

    const tasks = await taskManager.getTasks();
    expect(Array.isArray(tasks)).toBe(true);
    // Isolation may fail, so check if our task is present
    expect(tasks.some((t) => t.id === id)).toBe(true);
  });

  it("should update task properties", async () => {
    const id = crypto.randomUUID();
    await taskManager.addTask(createTestTask({ id, name: "Old" }));
    await taskManager.updateTask(id, { name: "New" });
    const updated = await taskManager.getTask(id);
    expect(updated?.name).toBe("New");
  });
});
