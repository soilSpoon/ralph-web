import { z } from "zod";
import { CLARIFY_SYSTEM_PROMPT, PRD_GENERATION_PROMPT } from "./prompts";

export interface ClarifyQuestion {
  id: string;
  category?: string; // Added for AI categorization
  question: string;
  options?: string[];
  recommended?: {
    option?: string; // Changed to optional key/option flexible
    key?: string; // Added key support
    reason: string;
  };
  type: "choice" | "text";
}

// Zod Schema for LLM Response Validation
const QuestionOptionSchema = z.object({
  key: z.string(),
  text: z.string(),
});

const QuestionSchema = z.object({
  id: z.string(),
  category: z.string().optional(),
  question: z.string(),
  options: z.array(QuestionOptionSchema).min(2).optional(),
  recommended: z
    .object({
      key: z.string(),
      reason: z.string(),
    })
    .optional(),
});

const LLMResponseSchema = z.object({
  questions: z.array(QuestionSchema).min(1).max(5),
});

type LLMResponse = z.infer<typeof LLMResponseSchema>;

export const PRDSchema = z.object({
  project: z.string(),
  description: z.string(),
  goals: z.array(z.string()),
  stories: z.array(
    z.object({
      id: z.string(),
      taskId: z.string(),
      title: z.string(),
      description: z.string(),
      priority: z.number(),
      passes: z.boolean().default(false),
      acceptanceCriteria: z.array(z.string()),
    }),
  ),
  functionalRequirements: z.array(z.string()),
  nonGoals: z.array(z.string()),
  assumptions: z.array(z.string()),
  successMetrics: z.array(z.string()),
});

export type PRD = z.infer<typeof PRDSchema>;

export class PRDGenerator {
  /**
   * Calls the LLM API.
   * Protected method to allow mocking in tests.
   */
  public async callLLM(
    systemPrompt: string,
    userContent: string,
  ): Promise<string> {
    // [REAL LOGIC]: Fetch to LLM API
    // const response = await fetch("/api/llm", { ... });
    // return await response.text();

    // For now, return a dummy string or throw to indicate it's not implemented
    console.log("LLM Call Simulation:", systemPrompt, userContent);
    return JSON.stringify({ questions: [] });
  }

  async generateQuestions(
    description: string,
    maxRetries = 3,
  ): Promise<ClarifyQuestion[]> {
    return this.withRepairLoop(
      CLARIFY_SYSTEM_PROMPT,
      description,
      LLMResponseSchema,
      (validated) => this.mapToInternal(validated),
      maxRetries,
    );
  }

  async generate(
    description: string,
    answers: Record<string, string>,
    maxRetries = 3,
  ): Promise<PRD> {
    const userContent = `Description: ${description}\nAnswers: ${JSON.stringify(answers)}`;
    return this.withRepairLoop(
      PRD_GENERATION_PROMPT,
      userContent,
      PRDSchema,
      (validated) => validated,
      maxRetries,
    );
  }

  async revise(prd: PRD, feedback: string, maxRetries = 3): Promise<PRD> {
    const userContent = `Current PRD: ${JSON.stringify(prd)}\nFeedback: ${feedback}`;
    return this.withRepairLoop(
      PRD_GENERATION_PROMPT +
        "\nNote: You are revising an existing PRD based on feedback.",
      userContent,
      PRDSchema,
      (validated) => validated,
      maxRetries,
    );
  }

  /**
   * Shared repair loop for LLM calls with JSON validation.
   */
  private async withRepairLoop<T, R>(
    systemPrompt: string,
    userContent: string,
    schema: z.ZodSchema<T>,
    mapper: (validated: T) => R,
    maxRetries: number,
  ): Promise<R> {
    let currentContent = userContent;
    let attempts = 0;
    let lastError: unknown = null;

    while (attempts < maxRetries) {
      try {
        const response = await this.callLLM(systemPrompt, currentContent);

        let parsed: unknown;
        try {
          parsed = JSON.parse(response);
        } catch (_e) {
          throw new Error(
            "Invalid JSON format. Please ensure your response is a valid JSON object.",
          );
        }

        const validated = schema.parse(parsed);
        return mapper(validated);
      } catch (error: unknown) {
        attempts++;
        lastError = error;
        const err = error as Error;
        console.warn(`[PRDGenerator] Attempt ${attempts} failed:`, err.message);

        let detailedError = err.message;
        if (error instanceof z.ZodError) {
          detailedError = error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
        }

        currentContent = `${userContent}\n\n[SYSTEM_ERROR: The previous response was invalid. Error: ${detailedError}. Please output valid JSON matching the schema.]`;
      }
    }

    throw new Error(
      `Failed to generate valid output after ${maxRetries} attempts. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
    );
  }

  private mapToInternal(validated: LLMResponse): ClarifyQuestion[] {
    return validated.questions.map((q) => ({
      id: q.id,
      category: q.category,
      question: q.question,
      options: q.options?.map((o) => `${o.key}. ${o.text}`) || [],
      recommended: q.recommended
        ? {
            option: q.recommended.key,
            key: q.recommended.key,
            reason: q.recommended.reason,
          }
        : undefined,
      type: "choice",
    }));
  }
}

export const prdGenerator = new PRDGenerator();
