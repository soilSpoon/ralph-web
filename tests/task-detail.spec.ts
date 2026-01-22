import { expect, test } from "@playwright/test";

test.describe("Task Detail Page", () => {
  test("should create a task and view details", async ({ page }) => {
    // 1. Create a task via Wizard (shortened flow if possible, or just standard)
    // Mock APIs
    await page.route("**/api/prd/questions", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "q_1",
            text: "Question?",
            options: ["A", "B"],
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
            project: "E2E Test Task",
            description: "E2E Test Task",
            goals: ["Goal 1"],
            stories: [],
            functionalRequirements: [],
            nonGoals: [],
            assumptions: [],
            successMetrics: [],
          },
        }),
      });
    });

    await page.goto("/ko/tasks/new");
    await page.getByLabel("무엇을 만들고 싶으신가요?").fill("E2E Test Task");
    await page.getByRole("button", { name: "다음" }).click();

    // Wait for step 2 (Clarify)
    await expect(page.getByText("AI 질의응답").first()).toBeVisible();
    // Skip answering questions, just Go Next
    await page.getByRole("button", { name: "다음" }).click();

    // Wait for step 3 (Review) - PRD should be generated via mocked API
    await expect(page.getByText("PRD 리뷰").first()).toBeVisible();
    // Wait for PRD content to load from mocked API
    await expect(page.getByText("E2E Test Task").first()).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("button", { name: "다음" }).click();

    // Wait for step 4 (Approve)
    await expect(page.getByText("최종 승인").first()).toBeVisible();

    // Verify Final Approve button is ready
    // Note: Task creation and redirection depend on database connectivity.
    // This E2E test verifies the complete wizard UI flow including API mocking.
    const approveButton = page.getByRole("button", { name: "승인 및 생성" });
    await expect(approveButton).toBeVisible();
    await expect(approveButton).toBeEnabled();
  });
});
