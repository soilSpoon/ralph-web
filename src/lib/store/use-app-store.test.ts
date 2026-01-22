import { beforeEach, describe, expect, it } from "bun:test";
import { useAppStore } from "@/lib/store/use-app-store";
import { Task } from "@/lib/types";

describe("useAppStore", () => {
  const mockTaskRoot: Task = {
    id: "1",
    name: "Test Task",
    description: "Test Description",
    status: "draft",
    priority: 1,
    currentIteration: 0,
    maxIterations: 5,
    worktreePath: "/path/to/worktree",
    branchName: "task/test",
    metadataPath: "/path/to/metdata",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset store before each test
    useAppStore.setState({
      tasks: [],
      currentTask: undefined,
      sidebarOpen: true,
      activityLog: [],
    });
  });

  it("should initialize with default values", () => {
    const state = useAppStore.getState();
    expect(state.tasks).toEqual([]);
    expect(state.sidebarOpen).toBe(true);
    expect(state.currentTask).toBeUndefined();
    expect(state.activityLog).toEqual([]);
  });

  it("should toggle sidebar", () => {
    const { toggleSidebar } = useAppStore.getState();

    toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(false);

    toggleSidebar();
    expect(useAppStore.getState().sidebarOpen).toBe(true);
  });

  it("should set tasks", () => {
    const mockTasks: Task[] = [mockTaskRoot];

    useAppStore.getState().setTasks(mockTasks);
    expect(useAppStore.getState().tasks).toEqual(mockTasks);
  });

  it("should add a task", () => {
    const newTask: Task = { ...mockTaskRoot };

    useAppStore.getState().addTask(newTask);
    expect(useAppStore.getState().tasks).toHaveLength(1);
    expect(useAppStore.getState().tasks[0]).toEqual(newTask);
  });

  it("should set current task", () => {
    const task: Task = { ...mockTaskRoot };

    useAppStore.getState().setCurrentTask(task);
    expect(useAppStore.getState().currentTask).toEqual(task);
  });
});
