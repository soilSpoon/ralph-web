import "@/test/env";
import { afterEach, describe, expect, it } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { GitSettings } from "@/components/settings/git-settings";
import ko from "@/messages/ko.json";
import { render } from "@/test/utils";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("GitSettings", () => {
  it("should render git configuration inputs", () => {
    const { getByLabelText } = render(<GitSettings />);
    expect(getByLabelText(ko.Settings.defaultBranch)).toBeInTheDocument();
    expect(getByLabelText(ko.Settings.commitFormat)).toBeInTheDocument();
    expect(getByLabelText(ko.Settings.autoPush)).toBeInTheDocument();
  });
});
