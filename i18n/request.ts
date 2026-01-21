import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Type predicate to validate locale
function isValidLocale(
  locale: string | undefined | null,
): locale is (typeof routing.locales)[number] {
  return (
    locale !== undefined &&
    locale !== null &&
    routing.locales.some((l) => l === locale)
  );
}

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!isValidLocale(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
