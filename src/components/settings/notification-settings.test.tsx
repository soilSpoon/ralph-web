import "../../../test/env";
import { afterEach, describe, expect, it } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { NotificationSettings } from "@/components/settings/notification-settings";
import ko from "@/messages/ko.json" with { type: "json" };
import { render } from "../../../test/utils";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("NotificationSettings", () => {
  it("should render notification checkboxes", () => {
    const { getByText } = render(<NotificationSettings />);
    expect(getByText(ko.Settings.notifyOnComplete)).toBeInTheDocument();
    expect(getByText(ko.Settings.notifyOnError)).toBeInTheDocument();
  });
});
