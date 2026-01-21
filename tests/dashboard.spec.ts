import { expect, test } from "@playwright/test";

test("dashboard loads and shows key components", async ({ page }) => {
  // Navigate to dashboard
  await page.goto("/");

  // Verify the main heading exists and is visible
  // We use getByRole for better accessibility and specificity
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({
    timeout: 10000,
  });

  // Verify the key components are present
  // Status Overview (Text inside the component)
  await expect(page.getByText("Overview of your coding tasks")).toBeVisible();

  // Quick Start Card
  await expect(page.getByText("✨ 빠른 시작")).toBeVisible();

  // Verify interactive element
  const input = page.getByPlaceholder("무엇을 만들고 싶으신가요?");
  await expect(input).toBeVisible();
  await expect(input).toBeEditable();
});
