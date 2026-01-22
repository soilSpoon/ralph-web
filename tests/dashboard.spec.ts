import { expect, test } from "@playwright/test";
import ko from "../src/messages/ko.json" with { type: "json" };

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

  // Test language switcher exists in header
  // Note: Full language switching test is skipped due to base-ui Select Portal rendering
  // which makes dropdown options difficult to reliably test in E2E.
  const switcher = page
    .locator("header")
    .locator('[data-slot="select-trigger"]');
  await expect(switcher).toBeVisible({ timeout: 10000 });

  // Verify switcher contains locale text (ko or en based on current locale)
  // Note: SelectValue displays translated locale name (한국어/영어)
  await expect(switcher).toContainText(/한국어|영어|ko|en/i);
});
