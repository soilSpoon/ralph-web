import "@/test/env";
import { afterEach, describe, expect, it } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickStartCard } from "@/components/dashboard/quick-start-card";
import { useAppStore } from "@/lib/store/use-app-store";
import ko from "@/messages/ko.json";
import { render } from "@/test/utils";

expect.extend(matchers);

afterEach(() => {
  cleanup();
  useAppStore.setState({ tasks: [], activityLog: [] });
});

describe("QuickStartCard", () => {
  it("should render correctly", () => {
    const { getByPlaceholderText, getByText } = render(<QuickStartCard />);
    expect(getByPlaceholderText(ko.QuickStart.placeholder)).toBeInTheDocument();
    expect(getByText(ko.QuickStart.button)).toBeInTheDocument();
  });

  it("should update input value", () => {
    const { getByPlaceholderText } = render(<QuickStartCard />);
    const input = getByPlaceholderText(
      ko.QuickStart.placeholder,
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "New Task" } });
    expect(input.value).toBe("New Task");
  });

  it("should add a new task when clicked", async () => {
    const user = userEvent.setup();
    const { getByPlaceholderText, getByRole } = render(<QuickStartCard />);
    const input = getByPlaceholderText(ko.QuickStart.placeholder);

    if (!(input instanceof HTMLInputElement)) {
      throw new Error("Input element not found");
    }

    const button = getByRole("button");

    await user.type(input, "Test Feature");
    expect(input.value).toBe("Test Feature");

    await user.click(button);

    // Wait and check
    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.tasks.some((t) => t.description === "Test Feature")).toBe(
          true,
        );
      },
      { timeout: 3000 },
    );

    // Should clear input
    expect(input.value).toBe("");
  });
});
