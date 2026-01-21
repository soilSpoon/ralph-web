import { expect, test } from "@playwright/test";
import en from "../messages/en.json";
import ko from "../messages/ko.json";

test("dashboard loads with default locale and supports language switching", async ({
  page,
}) => {
  // Navigate to root, should redirect to /ko or /en
  await page.goto("/");

  // Wait for redirect and check if it's one of the supported locales
  await expect(page).toHaveURL(/\/ko|\/en/);

  // If redirected to /ko (default), check Korean text
  if (page.url().includes("/ko")) {
    await expect(
      page.getByRole("heading", { name: ko.Navigation.dashboard }),
    ).toBeVisible();
    await expect(page.getByText(ko.QuickStart.title)).toBeVisible();
    await expect(
      page.getByPlaceholder(ko.QuickStart.placeholder),
    ).toBeVisible();
  }

  // Test language switcher
  const switcher = page.getByRole("combobox");
  await switcher.click();

  // Switch to English
  await page.getByRole("option", { name: ko.Navigation.english }).click();

  // Verify URL changed to /en
  await expect(page).toHaveURL(/\/en/);

  // Verify English text
  await expect(
    page.getByRole("heading", { name: en.Navigation.dashboard }),
  ).toBeVisible();
  await expect(page.getByText(en.QuickStart.title)).toBeVisible();
  await expect(page.getByPlaceholder(en.QuickStart.placeholder)).toBeVisible();
});
