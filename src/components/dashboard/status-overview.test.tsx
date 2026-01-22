import "@/test/env";
import { afterEach, describe, expect, it } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { StatusOverview } from "@/components/dashboard/status-overview";
import { mockTasks } from "@/lib/mock-data";
import ko from "@/messages/ko.json";
import { render } from "@/test/utils";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("StatusOverview", () => {
  it("should render correct counts for each status", () => {
    const { getByText, getAllByText } = render(
      <StatusOverview tasks={mockTasks} />,
    );

    // Check for labels using translation keys
    expect(getByText(ko.Status.running)).toBeInTheDocument();
    expect(getByText(ko.Status.review)).toBeInTheDocument();
    expect(getByText(ko.Status.draft)).toBeInTheDocument();
    expect(getByText(ko.Status.queued)).toBeInTheDocument();

    // Check for counts (mock data has 1 Running, 1 Review, 1 Draft, 1 Queued)
    const ones = getAllByText("01"); // Padding is used in component
    expect(ones.length).toBeGreaterThanOrEqual(4);
  });

  it("should render zeros when no tasks provided", () => {
    const { getAllByText } = render(<StatusOverview tasks={[]} />);
    const zeros = getAllByText("00"); // Padding is used in component
    expect(zeros.length).toBeGreaterThanOrEqual(4);
  });
});
