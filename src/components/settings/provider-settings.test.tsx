import "../../../test/env";
import { afterEach, describe, expect, it } from "bun:test";
import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { ProviderSettings } from "@/components/settings/provider-settings";
import ko from "@/messages/ko.json" with { type: "json" };
import { render } from "../../../test/utils";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe("ProviderSettings", () => {
  it("should render provider selection and api key input", () => {
    const { getByLabelText, getByPlaceholderText } = render(
      <ProviderSettings />,
    );

    expect(getByLabelText(ko.Settings.providerSelect)).toBeInTheDocument();
    expect(getByPlaceholderText(ko.Settings.apiKey)).toBeInTheDocument();
  });

  it("should show default provider selection", () => {
    const { getByLabelText } = render(<ProviderSettings />);
    expect(getByLabelText(ko.Settings.defaultProvider)).toBeInTheDocument();
  });
});
