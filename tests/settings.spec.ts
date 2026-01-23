import { expect, test } from "@playwright/test";

test.describe("Settings Page", () => {
  test("should display settings page correctly", async ({ page }) => {
    await page.goto("/ko/settings");

    // Check title
    await expect(page.getByRole("heading", { name: "설정" })).toBeVisible();

    // Check sections
    await expect(page.getByText("AI Provider")).toBeVisible();
    await expect(page.getByText("동시성")).toBeVisible();
    await expect(page.getByText("Git", { exact: true })).toBeVisible();
    await expect(page.getByText("알림", { exact: true })).toBeVisible();
  });

  test("should allow saving settings", async ({ page }) => {
    await page.goto("/ko/settings");

    // Click save button (using localized text "저장")
    await page.getByRole("button", { name: "저장" }).click();

    // Check for toast success
    await expect(page.getByText("설정이 저장되었습니다")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should change provider", async ({ page }) => {
    await page.goto("/ko/settings");

    // Use Label to find the select
    const selectTrigger = page.getByLabel("Provider 선택");

    await selectTrigger.click();

    // Select 'Google Gemini' option
    await page.getByRole("option", { name: "Google Gemini" }).click();

    await expect(selectTrigger).toContainText(/Gemini|gemini/);
  });
});
