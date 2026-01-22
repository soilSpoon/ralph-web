import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuickStartCard } from "@/components/dashboard/quick-start-card";
import { useAppStore } from "@/lib/store/use-app-store";
import ko from "@/messages/ko.json";
import { render } from "@/test/utils";

expect.extend(matchers);

afterEach(() => {
  cleanup();
  useAppStore.setState({ tasks: [], activityLog: [] });
});

const mockPush = vi.fn();
vi.mock("@/i18n/routing", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("QuickStartCard", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("should render correctly", () => {
    const { getByPlaceholderText, getByText } = render(<QuickStartCard />);
    expect(getByPlaceholderText(ko.QuickStart.placeholder)).toBeInTheDocument();
    expect(getByText(ko.QuickStart.button)).toBeInTheDocument();
  });

  it("should update input value", () => {
    const { getByPlaceholderText } = render(<QuickStartCard />);
    const input = getByPlaceholderText(ko.QuickStart.placeholder);
    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Input element not found");
    }

    fireEvent.change(input, { target: { value: "New Task" } });
    expect(input.value).toBe("New Task");
  });

  it("should redirect to new task page when clicked", async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText, getByRole } = render(<QuickStartCard />);
    const input = getByPlaceholderText(ko.QuickStart.placeholder);

    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Input element not found");
    }

    const button = getByRole("button");

    await user.type(input, "Test Feature");
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith(
      `/tasks/new?description=${encodeURIComponent("Test Feature")}`,
    );
  });
});
