import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { MemoryService } from "../service";
import { TokenBudgetManager } from "./budget";
import { RetrievalService } from "./service";

describe("RetrievalService", () => {
  let memoryService: MemoryService;
  let service: RetrievalService;

  beforeEach(async () => {
    memoryService = new MemoryService();
    await memoryService.initializeForTest();
    service = new RetrievalService(memoryService);
  });

  afterEach(async () => {
    await memoryService.close();
  });

  it("should assemble context from multiple sources", async () => {
    // 1. 성공 사례 심기
    await memoryService.reflexion.storeEpisode({
      sessionId: "s1",
      task: "Build a login form",
      reward: 0.9,
      success: true,
      output: "Use react-hook-form with zod validation",
    });

    // 2. 실패 사례 심기
    await memoryService.reflexion.storeEpisode({
      sessionId: "s2",
      task: "Build a registration form",
      reward: 0.1,
      success: false,
      critique: "Don't use uncurated libraries for auth",
    });

    // 3. 스킬 심기
    await memoryService.skills.createSkill({
      name: "auth_validator",
      description: "Validated auth credentials",
      signature: { inputs: {}, outputs: {} },
      code: "() => {}",
      successRate: 1.0,
    });

    // 인덱싱 대기
    await new Promise((r) => setTimeout(r, 200));

    // 4. 컨텍스트 회상
    const context = await service.getPerfectContext("Build a login form");

    expect(context).toBeDefined();
  });

  it("should respect token budget", async () => {
    const tinyBudget = new TokenBudgetManager({ maxTokens: 50 });
    const tinyService = new RetrievalService(memoryService, tinyBudget);

    await memoryService.reflexion.storeEpisode({
      sessionId: "s3",
      task: "Long Task",
      reward: 0.9,
      success: true,
      output: "A".repeat(1000),
    });

    await new Promise((r) => setTimeout(r, 100));

    const context = await tinyService.getPerfectContext("Long Task");
    expect(context.length).toBeLessThan(400);
  });
});
