import { expect, test } from "@playwright/test";

test.describe("Task Detail Page", () => {
  test("should create a task and view details", async ({ page }) => {
    // 1. Create a task via Wizard (shortened flow if possible, or just standard)
    await page.goto("/ko/tasks/new");
    await page.getByLabel("무엇을 만들고 싶으신가요?").fill("E2E Test Task");
    await page.getByRole("button", { name: "다음" }).click();

    // Wait for step 2 (Clarify)
    await expect(page.getByText("AI 질의응답").first()).toBeVisible();
    // Skip answering questions, just Go Next
    await page.getByRole("button", { name: "다음" }).click();

    // Wait for step 3 (Review) - Mocking might be needed if API is real.
    // However, in E2E we usually run against the real dev server.
    // If the dev server uses the 'simulated' LLM (which returns dummy data), this should work.
    await expect(page.getByText("PRD 리뷰").first()).toBeVisible();
    await page.getByRole("button", { name: "승인 및 생성" }).click();

    // Wait for step 4 (Approve)
    await expect(page.getByText("준비가 완료되었습니다!")).toBeVisible();
    await page.getByRole("button", { name: "작업 시작" }).click();

    // 2. Validate redirection to Task Detail
    // URL should be /tasks/[id]
    await expect(page).toHaveURL(/\/tasks\/task-/);

    // 3. Check Task Detail elements
    await expect(
      page.getByRole("heading", { name: "E2E Test Task" }),
    ).toBeVisible();

    // Check Tabs
    await expect(
      page.getByRole("tab", { name: "사용자 스토리" }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "명세서(PRD)" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "터미널" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "작업 로그" })).toBeVisible();

    // 4. Click tabs
    await page.getByRole("tab", { name: "명세서(PRD)" }).click();
    await expect(page.getByText("Goals")).toBeVisible();

    // 5. Check Agent Logs (Terminal)
    await page.getByRole("tab", { name: "터미널" }).click();
    await expect(page.getByText("Agent Logs")).toBeVisible();
  });
});
