import { expect, test } from "@playwright/test";

test("PRD Wizard Flow: Describe -> Clarify", async ({ page }) => {
  // 1. Start from Dashboard
  await page.goto("/ko");

  // 2. Click "Create Task" (QuickStart card)
  const quickStartInput = page.getByRole("textbox");
  await quickStartInput.pressSequentially("로그인 기능을 만들고 싶어", {
    delay: 50,
  });

  const startButton = page.getByRole("button", { name: "시작" });
  await expect(startButton).toBeEnabled();
  await startButton.click();

  // 3. Should be at /tasks/new
  await expect(page).toHaveURL(/\/tasks\/new/, { timeout: 15000 });

  // 4. Check for Step 1 content
  await expect(page.getByText("1 / 4")).toBeVisible();
  // We have multiple "요청 사항", using .first() to avoid strict mode error
  await expect(page.getByText(/요청 사항/).first()).toBeVisible();

  // 4. Move to Clarify step
  await page.getByRole("button", { name: "다음" }).click();

  // 5. Verify Step 2 (Clarify) presence
  await expect(page.getByText("2 / 4")).toBeVisible();
  await expect(page.getByText(/질의응답/).first()).toBeVisible();

  // 6. Fill an answer and move to Review step
  // Wait for dynamic questions to load
  await page.waitForSelector('textarea, input[type="radio"]');
  const answerInput = page.getByPlaceholder("여기에 답변을 입력하세요...");
  if (await answerInput.isVisible()) {
    await answerInput.fill("보안이 가장 중요합니다.");
  }
  await page.getByRole("button", { name: "다음" }).click();

  // 7. Verify Step 3 (Review) presence
  await expect(page.getByText("3 / 4")).toBeVisible();
  await expect(page.getByText(/리뷰/).first()).toBeVisible();

  // Wait for PRD to be generated (fetching from API)
  await expect(page.getByText(/PROJECT:/)).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: "다음" }).click();

  // 8. Verify Step 4 (Approve) presence
  await expect(page.getByText("4 / 4")).toBeVisible();
  await expect(page.getByText(/최종 승인/).first()).toBeVisible();

  // 9. Final Approve and Redirect to Task Detail
  await page.getByRole("button", { name: "승인 및 생성" }).click();

  // Should redirect to /tasks/task-timestamp
  await expect(page).toHaveURL(/\/tasks\/task-\d+/, { timeout: 15000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
