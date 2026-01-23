/**
 * RetrievalService - 인지적 기억 회상 서비스
 */
import type { EpisodeWithEmbedding, Skill } from "agentdb";
import {
  memoryService as defaultMemoryService,
  type MemoryService,
} from "../service";
import { TokenBudgetManager } from "./budget";

export class RetrievalService {
  private budgetManager: TokenBudgetManager;
  private memoryService: MemoryService;

  constructor(
    memoryService?: MemoryService,
    budgetManager?: TokenBudgetManager,
  ) {
    this.memoryService = memoryService || defaultMemoryService;
    this.budgetManager = budgetManager || new TokenBudgetManager();
  }

  /**
   * 태스크 수행에 최적화된 "Perfect Context"를 생성
   */
  async getPerfectContext(task: string): Promise<string> {
    try {
      // 1. 유사한 에피소드 조회
      const episodes: EpisodeWithEmbedding[] =
        await this.memoryService.reflexion.retrieveRelevant({
          task,
          k: 10,
        });

      // 2. 분류 (성공 vs 실패)
      const successStories = episodes
        .filter((e) => e.success && e.reward > 0.6)
        .map((e) => `${e.task}: ${e.output || "N/A"}`);

      const antiPatterns = episodes
        .filter((e) => !e.success && e.critique)
        .map((e) => `${e.critique || "N/A"}`);

      // 3. 관련 스킬 조회
      const skills: Skill[] = await this.memoryService.skills.searchSkills({
        task,
        k: 5,
      });
      const skillDocs = skills.map(
        (s) => `${s.name}: ${s.description || "No description"}`,
      );

      // 4. 예산에 맞춰 할당
      const context = this.budgetManager.allocate({
        antiPatterns,
        successStories,
        skills: skillDocs,
      });

      return context;
    } catch (error) {
      console.error("[RetrievalService] Failed to retrieve context:", error);
      return "";
    }
  }
}

export const retrievalService = new RetrievalService();
