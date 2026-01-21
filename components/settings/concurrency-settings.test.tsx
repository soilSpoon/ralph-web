import "@/test/env";
import { afterEach, describe, expect, it } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { ConcurrencySettings } from "@/components/settings/concurrency-settings";
import ko from "@/messages/ko.json";
import { render } from "@/test/utils";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("ConcurrencySettings", () => {
  it("should render max concurrent tasks input", () => {
    const { getByLabelText } = render(<ConcurrencySettings />);
    expect(getByLabelText(ko.Settings.maxConcurrentTasks)).toBeInTheDocument();
  });
});
