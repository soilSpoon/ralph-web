import "@/test/env";
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { mockActivity } from "@/lib/mock-data";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("ActivityFeed", () => {
  it("should render activities", () => {
    const { getByText } = render(<ActivityFeed activities={mockActivity} />);

    expect(getByText("Activity")).toBeInTheDocument();
    expect(getByText(mockActivity[0].message)).toBeInTheDocument();
    expect(getByText(mockActivity[1].message)).toBeInTheDocument();
  });

  it("should render task names", () => {
    const { getByText } = render(<ActivityFeed activities={mockActivity} />);
    expect(getByText(mockActivity[0].taskName)).toBeInTheDocument();
  });
});
