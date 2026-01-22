import { expect, test } from "@playwright/test";
import ko from "../src/messages/ko.json" with { type: "json" };

test("navigation to archive and settings pages", async ({ page }) => {
  await page.goto("/ko");

  // Navigate to Archive
  const archiveLink = page.getByRole("link", { name: ko.Navigation.archive });
  await archiveLink.click();
  await expect(page).toHaveURL(/\/ko\/archive/);
  await expect(
    page.getByRole("heading", { name: ko.Archive.title }),
  ).toBeVisible();

  // Navigate to Settings
  const settingsLink = page.getByRole("link", { name: ko.Navigation.settings });
  await settingsLink.click();
  await expect(page).toHaveURL(/\/ko\/settings/);
  await expect(
    page.getByRole("heading", { name: ko.Settings.title }),
  ).toBeVisible();

  // Test saving settings
  await page.getByRole("button", { name: ko.Settings.save }).click();
  await expect(page.getByText(ko.Settings.saved)).toBeVisible();
});
