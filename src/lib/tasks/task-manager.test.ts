import { describe, expect, it } from "vitest";
import { Task } from "../types";
import { taskManager } from "./task-manager";

describe("TaskManager", () => {
  const createTestTask = (overrides: Partial<Task>): Task => ({
    id: "test-id",
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

  it("should add and retrieve a task", () => {
    const taskId = "test-task-1";
    const newTask = createTestTask({ id: taskId });

    taskManager.addTask(newTask);
    const retrieved = taskManager.getTask(taskId);
    expect(retrieved).toEqual(newTask);
  });

  it("should list all tasks", () => {
    const tasks = taskManager.getTasks();
    expect(Array.isArray(tasks)).toBe(true);
  });

  it("should update task properties", () => {
    const taskId = "test-task-2";
    taskManager.addTask(createTestTask({ id: taskId, name: "Old" }));
    taskManager.updateTask(taskId, { name: "New" });
    expect(taskManager.getTask(taskId)?.name).toBe("New");
  });
});
