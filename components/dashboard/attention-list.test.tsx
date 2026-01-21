import "@/test/env";
import { afterEach, describe, expect, it } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup, render } from "@testing-library/react";
import { AttentionList } from "@/components/dashboard/attention-list";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("AttentionList", () => {
  it("should render attention items", () => {
    const { getByText } = render(<AttentionList />);

    expect(getByText("Needs Attention")).toBeInTheDocument();
    // Check for mock items
    expect(getByText('Review failed for "Auth System"')).toBeInTheDocument();
    expect(getByText('Approval needed for "API Schema"')).toBeInTheDocument();
  });

  it("should render action buttons", () => {
    const { getAllByText } = render(<AttentionList />);
    expect(getAllByText("View").length).toBe(2);
  });
});
