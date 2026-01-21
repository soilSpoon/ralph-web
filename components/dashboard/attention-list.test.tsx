import "@/test/env";
import { describe, it, expect, afterEach } from "bun:test";
import { render, cleanup } from "@testing-library/react";
import { AttentionList } from "@/components/dashboard/attention-list";
import * as matchers from "@testing-library/jest-dom/matchers";

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
