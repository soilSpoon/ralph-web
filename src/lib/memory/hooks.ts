/**
 * MemoryHooks - RalphLoop와 MemoryService의 연결 고리
 */
import type { EpisodeWithEmbedding } from "agentdb";
import { cognify } from "./pipeline/cognify";
import { memoryService } from "./service";

export interface TaskResult {
  taskId: string;
  taskDescription: string;
  success: boolean;
  output: string;
  error?: string;
  latencyMs: number;
}

export class MemoryHooks {
  constructor(private service = memoryService) {}

  /**
   * Pre-task Hook: 과거 실패 사례 조회 및 경고 주입
   */
  async preTask(description: string): Promise<string | null> {
    try {
      // 1. 유사한 실패 사례 조회
      const failures: EpisodeWithEmbedding[] =
        await this.service.reflexion.retrieveRelevant({
          task: description,
          k: 3,
          onlySuccesses: false, // 실패 사례 포함
        });

      // 2. 실패한 사례만 필터링 (reward < 0.5)
      const meaningfulFailures = failures.filter(
        (f) => f.reward < 0.5 && f.critique,
      );

      if (meaningfulFailures.length === 0) {
        return null;
      }

      // 3. 경고 메시지 생성
      const warnings = meaningfulFailures
        .map((f) => `- [Warning]: ${f.critique}`)
        .join("\n");

      return `\nFound similar past failures. Please avoid the following patterns:\n${warnings}`;
    } catch (error) {
      console.error(
        "[MemoryHooks] Failed to retrieve pre-task context:",
        error,
      );
      return null;
    }
  }

  /**
   * Complete Hook: 궤적 저장 및 학습
   */
  async onComplete(result: TaskResult): Promise<void> {
    try {
      // 1. Cognify 적용 (로그 정제)
      const cognified = await cognify({
        rawLog: result.output,
        context: {
          taskId: result.taskId,
          currentTime: new Date().toISOString(),
        },
      });

      // 2. Reflexion에 에피소드 저장
      await this.service.reflexion.storeEpisode({
        sessionId: result.taskId,
        task: result.taskDescription,
        reward: result.success ? 0.9 : 0.1, // 성공 시 0.9, 실패 시 0.1
        success: result.success,
        critique: result.error ? `Error: ${result.error}` : undefined,
        input: result.taskDescription,
        output: cognified.atomicFact, // 정제된 로그 저장
        latencyMs: result.latencyMs,
        tokensUsed: 0, // 토큰 사용량은 추후 연동
      });
    } catch (error) {
      console.error(
        "[MemoryHooks] Failed to store completion trajectory:",
        error,
      );
    }
  }
}

export const memoryHooks = new MemoryHooks();
