import "../../../test/env";
import { afterEach, describe, expect, it } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { ArchivedTaskList } from "@/components/archive/archived-task-list";
import { mockTasks } from "@/lib/mock-data";
import ko from "@/messages/ko.json" with { type: "json" };
import { render } from "../../../test/utils";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("ArchivedTaskList", () => {
  const archivedTasks = mockTasks.filter((t) => t.archived);

  it("should render list of archived tasks", () => {
    const { getByText } = render(<ArchivedTaskList tasks={archivedTasks} />);

    for (const task of archivedTasks) {
      expect(getByText(task.name)).toBeInTheDocument();
    }
  });

  it("should render empty state message when no tasks", () => {
    const { getByText } = render(<ArchivedTaskList tasks={[]} />);

    expect(getByText(ko.Archive.noArchivedTasks)).toBeInTheDocument();
  });

  it("should filter tasks by search query", () => {
    const { getByText } = render(
      <ArchivedTaskList tasks={archivedTasks} searchQuery="Old" />,
    );

    expect(getByText("Old Feature")).toBeInTheDocument();
    // Assuming there's only one task with "Old" in its name
  });
});
