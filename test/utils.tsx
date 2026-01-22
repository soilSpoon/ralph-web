import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (typeof global.document === "undefined") {
  GlobalRegistrator.register();
}

import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import ko from "@/messages/ko.json" with { type: "json" };

function renderWithIntl(
  ui: ReactElement,
  { locale = "ko", messages = ko } = {},
) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

export * from "@testing-library/react";
export { renderWithIntl as render };

import { vi } from "vitest";
import type { WizardFormData } from "@/lib/hooks/use-wizard-state";

export function createMockWizardFormData(
  overrides: Partial<WizardFormData> = {},
): WizardFormData {
  return {
    description: "Default description",
    clarifications: {},
    generatedPRD: null,
    approved: false,
    ...overrides,
  };
}

export function createFetchMock() {
  return vi.fn<typeof fetch>();
}
