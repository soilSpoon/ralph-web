import { expect, test } from "@playwright/test";
import ko from "../src/messages/ko.json" with { type: "json" };

test("PRD Wizard Flow: Describe -> Clarify", async ({ page }) => {
  // Mock APIs to ensure tests are deterministic and don't rely on external LLMs
  await page.route("**/api/prd/questions", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "q_1",
          text: "What is the primary goal?",
          options: ["Goal A", "Goal B"],
        },
      ]),
    });
  });

  await page.route("**/api/prd/generate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        prd: {
          project: "My Awesome Project",
          description: "A secure login system.",
          goals: ["Authenticate users", "Secure data"],
          stories: [
            {
              id: "story-1",
              title: "User Login",
              description: "As a user, I want to login...",
              acceptanceCriteria: ["Valid credentials work", "Invalid fail"],
              priority: "High",
            },
          ],
          functionalRequirements: ["JWT Auth", "Password Hashing"],
          nonGoals: ["Social Login"],
          assumptions: ["Database is set up"],
          successMetrics: ["Login time < 100ms"],
        },
      }),
    });
  });

  // 1. Start from Dashboard
  await page.goto("/ko");

  // 2. Click "Create Task" (QuickStart card)
  const quickStartInput = page.getByPlaceholder(ko.QuickStart.placeholder);
  await quickStartInput.pressSequentially("로그인 기능을 만들고 싶어", {
    delay: 50,
  });

  const startButton = page.getByRole("button", { name: ko.QuickStart.button });
  await expect(startButton).toBeEnabled();
  await startButton.click();

  // 3. Should be at /tasks/new
  await expect(page).toHaveURL(/\/tasks\/new/, { timeout: 15000 });

  // 4. Check for Step 1 content
  await expect(page.getByText("1 / 4")).toBeVisible();
  await expect(
    page
      .locator('[data-slot="card-title"]')
      .getByText(ko.Wizard.steps.describe),
  ).toBeVisible();

  // 4. Move to Clarify step
  await page.getByRole("button", { name: ko.Wizard.next }).click();

  // 5. Verify Step 2 (Clarify) presence
  await expect(page.getByText("2 / 4")).toBeVisible();
  await expect(
    page.locator('[data-slot="card-title"]').getByText(ko.Wizard.steps.clarify),
  ).toBeVisible();

  // 6. Fill an answer and move to Review step
  // Wait for dynamic questions to load
  await page.waitForSelector('textarea, input[type="radio"]');
  const answerInput = page.getByPlaceholder("여기에 답변을 입력하세요...");
  if (await answerInput.isVisible()) {
    await answerInput.fill("보안이 가장 중요합니다.");
  }
  await page.getByRole("button", { name: ko.Wizard.next }).click();

  // 7. Verify Step 3 (Review) presence
  await expect(page.getByText("3 / 4")).toBeVisible();
  await expect(
    page.locator('[data-slot="card-title"]').getByText(ko.Wizard.steps.review),
  ).toBeVisible();

  // Wait for PRD to be generated (fetching from API)
  await expect(page.getByText("My Awesome Project")).toBeVisible({
    timeout: 10000,
  });
  await page.getByRole("button", { name: ko.Wizard.next }).click();

  // 8. Verify Step 4 (Approve) presence
  await expect(page.getByText("4 / 4")).toBeVisible();
  await expect(
    page.locator('[data-slot="card-title"]').getByText(ko.Wizard.steps.approve),
  ).toBeVisible();

  // 9. Verify Final Approve button is present
  // Note: Task creation and redirection depend on database connectivity.
  // This E2E test verifies the complete wizard UI flow.
  const approveButton = page.getByRole("button", { name: ko.Wizard.approve });
  await expect(approveButton).toBeVisible();
  await expect(approveButton).toBeEnabled();
});
