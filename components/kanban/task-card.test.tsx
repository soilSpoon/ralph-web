import "@/test/env";
import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { Task } from "@/lib/types";
import { TaskCard } from "./task-card";

afterEach(() => {
  cleanup();
});

describe("TaskCard", () => {
  const mockTask: Task = {
    id: "1",
    name: "Test Task",
    description: "Description",
    status: "draft",
    priority: 1,
    currentIteration: 0,
    maxIterations: 5,
    branchName: "task/test",
    worktreePath: "/tmp/wtt",
    metadataPath: "/tmp/mdt",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should render task details", () => {
    const { getByText } = render(<TaskCard task={mockTask} />);
    expect(getByText("Test Task")).toBeTruthy();
    expect(getByText("Description")).toBeTruthy();
    expect(getByText("task/test")).toBeTruthy();
    expect(getByText("0/5")).toBeTruthy();
  });

  it("should have a link to the task detail page", () => {
    const { getByRole } = render(<TaskCard task={mockTask} />);
    const link = getByRole("link");
    expect(link.getAttribute("href")).toBe("/tasks/1");
    // Also verify the link contains the task name
    expect(link.textContent).toBe("Test Task");
  });
});
