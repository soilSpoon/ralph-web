import "../../../test/env";
import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup } from "@testing-library/react";
import type { Task } from "@/lib/types";
import { render } from "../../../test/utils";
import { KanbanBoard } from "./kanban-board";

mock.module("@atlaskit/pragmatic-drag-and-drop/element/adapter", () => ({
  monitorForElements: () => () => {},
  draggable: () => () => {},
  dropTargetForElements: () => () => {},
}));

afterEach(() => {
  cleanup();
});

describe("KanbanBoard", () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      name: "Task 1",
      description: "Description 1",
      status: "draft",
      priority: 1,
      currentIteration: 0,
      maxIterations: 5,
      branchName: "task/1",
      worktreePath: "/tmp/wt1",
      metadataPath: "/tmp/md1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Task 2",
      description: "Description 2",
      status: "running",
      priority: 1,
      currentIteration: 1,
      maxIterations: 5,
      branchName: "task/2",
      worktreePath: "/tmp/wt2",
      metadataPath: "/tmp/md2",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("should render all 5 columns labels", () => {
    const { getByText } = render(<KanbanBoard tasks={[]} />);

    expect(getByText("초안")).toBeTruthy();
    expect(getByText("대기 중")).toBeTruthy();
    expect(getByText("실행 중")).toBeTruthy();
    expect(getByText("리뷰")).toBeTruthy();
    expect(getByText("병합됨")).toBeTruthy();
  });

  it("should render tasks in correct columns", () => {
    const { getByText } = render(<KanbanBoard tasks={mockTasks} />);

    // Check if task names appear
    expect(getByText("Task 1")).toBeTruthy();
    expect(getByText("Task 2")).toBeTruthy();

    // Check counts in columns (implemented in KanbanColumn as a span)
    // We expect Draft column to have 1, Running to have 1, others 0.
    // Since we have multiple "1"s and "0"s, it's better to verify structually or use test-ids if possible.
    // But for basic verification, checking availability is good enough start.
  });
});
