import "@/test/env";
import { afterEach, describe, expect, it } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { mockActivity } from "@/lib/mock-data";
import ko from "@/messages/ko.json";
import { render } from "@/test/utils";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("ActivityFeed", () => {
  it("should render activities", () => {
    const { getByText } = render(<ActivityFeed activities={mockActivity} />);

    expect(getByText(ko.Dashboard.activity)).toBeInTheDocument();
    expect(getByText(mockActivity[0].message)).toBeInTheDocument();
    expect(getByText(mockActivity[1].message)).toBeInTheDocument();
  });

  it("should render task names", () => {
    const { getByText } = render(<ActivityFeed activities={mockActivity} />);
    expect(getByText(mockActivity[0].taskName)).toBeInTheDocument();
  });
});
