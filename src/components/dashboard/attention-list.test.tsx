import "../../../test/env";
import { afterEach, describe, expect, it } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { AttentionList } from "@/components/dashboard/attention-list";
import ko from "@/messages/ko.json" with { type: "json" };
import { render } from "../../../test/utils";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("AttentionList", () => {
  it("should render attention items", () => {
    const { getByText } = render(<AttentionList />);

    expect(getByText(ko.Dashboard.attention)).toBeInTheDocument();
    // Check for mock items
    expect(getByText('Review failed for "Auth System"')).toBeInTheDocument();
    expect(getByText('Approval needed for "API Schema"')).toBeInTheDocument();
  });

  it("should render action buttons", () => {
    const { getAllByText } = render(<AttentionList />);
    expect(getAllByText(ko.Dashboard.view).length).toBe(2);
  });
});
