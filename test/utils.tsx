import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import ko from "../messages/ko.json";

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
