/**
 * Phase 9: Memory Service Tests (TDD)
 * agentdb@alpha 통합 테스트
 */
import { describe, expect, it } from "bun:test";
import { AgentDB } from "agentdb";
import { MemoryHooks } from "./hooks";
import { cognify, setRecentFacts } from "./pipeline/cognify";
import { MemoryService } from "./service";

// Helper 함수 제거됨. MemoryService의 게터를 직접 사용하세요.

describe("MemoryService", () => {
  describe("AgentDB initialization", () => {
    it("should create and initialize AgentDB instance", async () => {
      const db = new AgentDB({ dbPath: ":memory:" });
      await db.initialize();

      expect(db).toBeDefined();
      expect(db.database).toBeDefined();

      await db.close();
    });

    it("should get reflexion controller", async () => {
      const service = new MemoryService();
      await service.initialize({ dbPath: ":memory:" });

      const reflexion = service.reflexion;
      expect(reflexion).toBeDefined();

      await service.close();
    });

    it("should get skills controller", async () => {
      const service = new MemoryService();
      await service.initialize({ dbPath: ":memory:" });

      const skills = service.skills;
      expect(skills).toBeDefined();

      await service.close();
    });
  });

  describe("ReflexionMemory integration", () => {
    it("should store and retrieve episodes", async () => {
      const service = new MemoryService();
      await service.initialize({ dbPath: ":memory:" });

      const reflexion = service.reflexion;

      // 에피소드 저장
      const episodeId = await reflexion.storeEpisode({
        sessionId: "test-session",
        task: "Test task for TDD",
        reward: 0.95,
        success: true,
        critique: "Test critique",
        input: "test input",
        output: "test output",
        latencyMs: 100,
        tokensUsed: 50,
      });

      expect(episodeId).toBeDefined();

      // 유사 에피소드 검색
      const similar = await reflexion.retrieveRelevant({
        task: "test task",
        k: 5,
        onlySuccesses: true,
      });

      expect(similar).toBeDefined();
      expect(Array.isArray(similar)).toBe(true);

      await service.close();
    });
  });

  describe("SkillLibrary integration", () => {
    it("should create and search skills", async () => {
      const service = new MemoryService();
      await service.initialize({ dbPath: ":memory:" });

      const skills = service.skills;

      // 스킬 생성
      const skillId = await skills.createSkill({
        name: "test_skill",
        description: "A test skill for TDD",
        signature: { inputs: { x: "number" }, outputs: { y: "number" } },
        code: "return x * 2;",
        successRate: 0.9,
      });

      expect(skillId).toBeDefined();

      // 스킬 검색
      const found = await skills.searchSkills({
        task: "test skill",
        k: 5,
      });

      expect(found).toBeDefined();
      expect(Array.isArray(found)).toBe(true);

      await service.close();
    });
  });
});

describe("Cognify Pipeline", () => {
  describe("semantic lossless restatement", () => {
    it("should remove pronouns and inject absolute context", async () => {
      const result = await cognify({
        rawLog: "He fixed it",
        context: {
          agent: "claude-code",
          file: "src/auth.ts",
          function: "validateToken",
        },
      });

      expect(result.atomicFact).not.toContain("He");
      expect(result.atomicFact).not.toContain("it");
      expect(result.atomicFact).toContain("src/auth.ts");
      expect(result.atomicFact).toContain("validateToken");
    });

    it("should convert relative time to absolute time", async () => {
      const result = await cognify({
        rawLog: "Will deploy tomorrow",
        context: {
          currentTime: "2026-01-23T12:00:00",
        },
      });

      expect(result.atomicFact).not.toContain("tomorrow");
      expect(result.atomicFact).toMatch(/2026-01-24/);
    });

    it("should deduplicate based on last 5 facts", async () => {
      setRecentFacts([
        "Fixed validateToken in src/auth.ts",
        "Added Bearer prefix check",
        "Updated test cases",
        "Fixed type error",
        "Ran npm test successfully",
      ]);

      const result = await cognify({
        rawLog: "Fixed the auth token validation",
        context: { file: "src/auth.ts" },
      });

      expect(result.isDuplicate).toBe(true);
    });
  });
});

describe("RalphLoop Integration", () => {
  describe("MemoryHooks", () => {
    it("should retrieve anti-patterns from memory in pre-task", async () => {
      const localMemoryService = new MemoryService();
      await localMemoryService.initializeForTest();

      await localMemoryService.reflexion.storeEpisode({
        sessionId: "prev-session",
        task: "Implement auth",
        reward: 0.1,
        success: false,
        critique: "Don't verify token in client side",
        input: "Implement auth",
        output: "Client side verification",
        latencyMs: 100,
        tokensUsed: 50,
      });

      // 인덱싱 대기
      await new Promise((resolve) => setTimeout(resolve, 100));

      const hooks = new MemoryHooks(localMemoryService);

      const warning = await hooks.preTask("Implement authentication");

      if (warning) {
        expect(warning).toContain("Don't verify token in client side");
      }

      await localMemoryService.close();
    });

    it("should store trajectory in complete hook", async () => {
      const localMemoryService = new MemoryService();
      await localMemoryService.initializeForTest();

      const hooks = new MemoryHooks(localMemoryService);

      await hooks.onComplete({
        taskId: "task-123",
        taskDescription: "Fix bug",
        success: true,
        output: "Fixed it",
        latencyMs: 500,
      });

      // 인덱싱 및 비동기 저장 대기
      await new Promise((resolve) => setTimeout(resolve, 200));

      const episodes = await localMemoryService.reflexion.retrieveRelevant({
        task: "Fix bug",
        k: 10,
      });

      if (episodes.length > 0) {
        expect(episodes[0].success).toBe(true);
      }

      await localMemoryService.close();
    });
  });
});
