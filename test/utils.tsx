import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (typeof global.document === "undefined") {
  GlobalRegistrator.register();
}

import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
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
