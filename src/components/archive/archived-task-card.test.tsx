import "../../../test/env";
import { afterEach, describe, expect, it, vi } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup, fireEvent } from "@testing-library/react";
import { ArchivedTaskCard } from "@/components/archive/archived-task-card";
import { mockTasks } from "@/lib/mock-data";
import ko from "@/messages/ko.json" with { type: "json" };
import { render } from "../../../test/utils";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("ArchivedTaskCard", () => {
  const task = mockTasks.find((t) => t.archived);
  if (!task) throw new Error("Archived task not found in mock data");

  it("should render task details correctly", () => {
    const { getByText } = render(<ArchivedTaskCard task={task} />);

    expect(getByText(task.name)).toBeInTheDocument();
    expect(getByText(task.description)).toBeInTheDocument();
    expect(
      getByText(`${ko.Archive.completedOn}: 2023. 12. 5.`),
    ).toBeInTheDocument();
  });

  it("should call onRestore when unarchive button is clicked", () => {
    const onRestore = vi.fn();
    const { getByText } = render(
      <ArchivedTaskCard task={task} onRestore={onRestore} />,
    );

    const restoreButton = getByText(ko.Archive.unarchive);
    fireEvent.click(restoreButton);

    expect(onRestore).toHaveBeenCalledWith(task.id);
  });
});
