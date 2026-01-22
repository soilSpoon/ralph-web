import { beforeEach, describe, expect, it, vi } from "vitest";
import { type PRD, PRDGenerator, prdGenerator } from "./generator";

// Mock the callLLM method
vi.spyOn(PRDGenerator.prototype, "callLLM").mockImplementation(async () => {
  return JSON.stringify({
    questions: [
      {
        id: "q1",
        category: "functional_scope",
        question: "Test Question 1",
        options: [
          { key: "A", text: "Option A" },
          { key: "B", text: "Option B" },
        ],
        recommended: { key: "A", reason: "Best" },
        type: "choice",
      },
      {
        id: "q2",
        category: "ux_flow",
        question: "Test Question 2",
        options: [
          { key: "C", text: "Option C" },
          { key: "D", text: "Option D" },
        ],
        recommended: { key: "C", reason: "Good" },
        type: "choice",
      },
      {
        id: "q3",
        category: "non_functional",
        question: "Test Question 3",
        options: [
          { key: "E", text: "Option E" },
          { key: "F", text: "Option F" },
        ],
        recommended: { key: "E", reason: "Safe" },
        type: "choice",
      },
    ],
  });
});

describe("PRDGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateQuestions", () => {
    it("should generate 3-5 clarifying questions based on description", async () => {
      const questions =
        await prdGenerator.generateQuestions("로그인 기능 구현");
      expect(questions.length).toBeGreaterThanOrEqual(3);
      expect(questions.length).toBeLessThanOrEqual(5);
      expect(questions[0]).toHaveProperty("id");
      expect(questions[0]).toHaveProperty("question");
      // Check mapped options (should be array of strings "Key. Text")
      expect(typeof questions[0].options?.[0]).toBe("string");
      expect(questions[0].options?.[0]).toContain(". ");
    });

    it("should include recommended option for each question", async () => {
      const questions = await prdGenerator.generateQuestions("대시보드 구축");
      for (const q of questions) {
        expect(q.recommended).toBeDefined();
        expect(q.recommended?.option).toBeDefined();
        expect(q.recommended?.reason).toBeDefined();
      }
    });

    it("should retry and succeed when LLM returns invalid JSON initially", async () => {
      const spy = vi
        .spyOn(PRDGenerator.prototype, "callLLM")
        .mockResolvedValueOnce("INVALID JSON") // 1st attempt: fail
        .mockResolvedValueOnce(
          JSON.stringify({
            questions: [
              {
                id: "q1",
                category: "functional_scope",
                question: "Retry Success",
                options: [
                  { key: "A", text: "Opt A" },
                  { key: "B", text: "Opt B" },
                ],
                recommended: { key: "A", reason: "Retry worked" },
                type: "choice",
              },
            ],
          }),
        );

      const questions = await prdGenerator.generateQuestions("Retry Test");
      expect(questions[0].question).toBe("Retry Success");
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("should throw error after max retries", async () => {
      // Mock failure for all 3 attempts
      vi.spyOn(PRDGenerator.prototype, "callLLM").mockRejectedValue(
        new Error("LLM Error"),
      );
      await expect(prdGenerator.generateQuestions("Fail", 3)).rejects.toThrow(
        "Failed to generate valid output after 3 attempts",
      );
    });
  });

  it("should generate a PRD with stories from description and answers", async () => {
    const description = "Next.js 인증 시스템";
    const answers = { auth_strategy: "JWT", target_env: "Web" };

    // Mock successful PRD generation
    vi.spyOn(PRDGenerator.prototype, "callLLM").mockResolvedValue(
      JSON.stringify({
        project: "Test Project",
        description: description,
        goals: ["Goal 1"],
        stories: [
          {
            id: "S-1",
            taskId: "T-1",
            title: "Story 1",
            description: description,
            priority: 1,
            passes: false,
            acceptanceCriteria: ["AC1"],
          },
        ],
        functionalRequirements: [],
        nonGoals: [],
        assumptions: [],
        successMetrics: [],
      }),
    );

    const prd = await prdGenerator.generate(description, answers);

    expect(prd.project).toBeDefined();
    expect(prd.description).toBe(description);
    expect(prd.stories.length).toBeGreaterThan(0);
    expect(prd.stories[0].description).toContain(description);
  });

  it("should revise PRD based on feedback", async () => {
    // Mock successful revision
    vi.spyOn(PRDGenerator.prototype, "callLLM").mockResolvedValue(
      JSON.stringify({
        project: "Test Project",
        description: "Test OAuth 추가해줘",
        goals: [],
        stories: [],
        functionalRequirements: [],
        nonGoals: [],
        assumptions: [],
        successMetrics: [],
      }),
    );
    // I'll just use inline object matching PRD
    const dummyPrd: PRD = {
      project: "Test",
      description: "Test",
      goals: [],
      stories: [],
      functionalRequirements: [],
      nonGoals: [],
      assumptions: [],
      successMetrics: [],
    };
    const revisedPrd = await prdGenerator.revise(dummyPrd, "OAuth 추가해줘");

    expect(revisedPrd.description).toContain("OAuth 추가해줘");
  });
});
