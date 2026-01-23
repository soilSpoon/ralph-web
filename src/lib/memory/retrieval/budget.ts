/**
 * TokenBudgetManager - 인지적 컨텍스트를 위한 토큰 예산 관리자
 *
 * 목적: 프롬프트에 주입되는 메모리 데이터가 전체 토큰 제한을 넘지 않도록 관리
 */

export interface BudgetConfig {
  maxTokens: number;
  priorities: {
    antiPatterns: number; // 0.0 ~ 1.0 (비율)
    successStories: number;
    skills: number;
  };
}

export interface BudgetResult {
  content: string;
  tokenCount: number;
}

export class TokenBudgetManager {
  private config: BudgetConfig;
  private readonly CHAR_PER_TOKEN = 4; // 대략적인 토큰 근사치

  constructor(config?: Partial<BudgetConfig>) {
    this.config = {
      maxTokens: config?.maxTokens || 4000,
      priorities: {
        antiPatterns: 0.3,
        successStories: 0.4,
        skills: 0.3,
        ...config?.priorities,
      },
    };
  }

  /**
   * 텍스트의 대략적인 토큰 수 계산
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / this.CHAR_PER_TOKEN);
  }

  /**
   * 주어진 항목들을 예산 범위 내로 압축/필터링
   */
  allocate(categories: {
    antiPatterns: string[];
    successStories: string[];
    skills: string[];
  }): string {
    const sections: string[] = [];

    // 1. Anti-Patterns (경고)
    if (categories.antiPatterns.length > 0) {
      const budget =
        this.config.maxTokens * this.config.priorities.antiPatterns;
      sections.push(
        this.fitToBudget(
          "⚠️ Anti-Patterns (Avoid these):",
          categories.antiPatterns,
          budget,
        ),
      );
    }

    // 2. Success Stories (참고)
    if (categories.successStories.length > 0) {
      const budget =
        this.config.maxTokens * this.config.priorities.successStories;
      sections.push(
        this.fitToBudget(
          "✅ Success Stories (Learn from these):",
          categories.successStories,
          budget,
        ),
      );
    }

    // 3. Recommended Skills (도구)
    if (categories.skills.length > 0) {
      const budget = this.config.maxTokens * this.config.priorities.skills;
      sections.push(
        this.fitToBudget("🛠️ Recommended Skills:", categories.skills, budget),
      );
    }

    return sections.filter((s) => s.length > 0).join("\n\n");
  }

  private fitToBudget(
    header: string,
    items: string[],
    budgetTokens: number,
  ): string {
    let currentTokens = this.estimateTokens(header);
    const selected: string[] = [];

    for (const item of items) {
      const tokens = this.estimateTokens(item) + 1; // +1 for newline/bullet
      if (currentTokens + tokens <= budgetTokens) {
        selected.push(`- ${item}`);
        currentTokens += tokens;
      } else {
        break; // 예산 초과
      }
    }

    if (selected.length === 0) return "";
    return `${header}\n${selected.join("\n")}`;
  }
}
