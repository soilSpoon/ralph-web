import "@/test/env";
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { StatusOverview } from "@/components/dashboard/status-overview";
import { mockTasks } from "@/lib/mock-data";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("StatusOverview", () => {
  it("should render correct counts for each status", () => {
    const { getByText, getAllByText } = render(
      <StatusOverview tasks={mockTasks} />,
    );

    // Check for labels
    expect(getByText("Running")).toBeInTheDocument();
    expect(getByText("Review")).toBeInTheDocument();
    expect(getByText("Draft")).toBeInTheDocument();
    expect(getByText("Queued")).toBeInTheDocument();

    // Check for counts (mock data has 1 Running, 1 Review, 1 Draft, 1 Queued)
    const ones = getAllByText("1");
    expect(ones.length).toBeGreaterThanOrEqual(4);
  });

  it("should render zeros when no tasks provided", () => {
    const { getAllByText } = render(<StatusOverview tasks={[]} />);
    const zeros = getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(4);
  });
});
