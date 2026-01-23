/**
 * Phase 9: Memory Service
 * agentdb@alpha 래퍼 - 바퀴 재발명 없이 기존 기능 활용
 */
import {
  AgentDB,
  type CausalMemoryGraph,
  type ReflexionMemory,
  type SkillLibrary,
} from "agentdb";

export interface MemoryServiceConfig {
  dbPath?: string;
}

/**
 * Controller name to type mapping for AgentDB
 */
interface ControllerMap {
  reflexion: ReflexionMemory;
  skills: SkillLibrary;
  causalGraph: CausalMemoryGraph;
}

/**
 * 싱글톤 MemoryService - AgentDB 래퍼
 */
export class MemoryService {
  private db: AgentDB | null = null;
  private initialized = false;

  async initialize(config: MemoryServiceConfig = {}): Promise<void> {
    if (this.initialized && this.db) return;

    const dbPath = config.dbPath ?? "./.ralph/agentdb.db";

    this.db = new AgentDB({ dbPath });
    await this.db.initialize();
    this.initialized = true;
  }

  get reflexion(): ReflexionMemory {
    return this.getRequiredController("reflexion");
  }

  get skills(): SkillLibrary {
    return this.getRequiredController("skills");
  }

  get causalGraph(): CausalMemoryGraph {
    return this.getRequiredController("causalGraph");
  }

  private getRequiredController<K extends keyof ControllerMap>(
    name: K,
  ): ControllerMap[K] {
    if (!this.db || !this.initialized) {
      throw new Error(
        "MemoryService not initialized. Call initialize() first.",
      );
    }
    // AgentDB.getController returns the controller instance.
    // We map the return type via ControllerMap to ensure strict typing without broad 'as' assertions.
    const controller = this.db.getController(name);
    if (!controller) {
      throw new Error(`Controller ${name} not found in AgentDB.`);
    }
    return controller;
  }

  get database() {
    if (!this.db || !this.initialized) {
      throw new Error(
        "MemoryService not initialized. Call initialize() first.",
      );
    }
    return this.db.database;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }

  /**
   * 테스트용: 인메모리 DB로 초기화
   */
  async initializeForTest(): Promise<void> {
    await this.close(); // 기존 연결 종료
    await this.initialize({ dbPath: ":memory:" });
  }

  /**
   * 테스트용: DB 리셋
   */
  async reset(): Promise<void> {
    await this.close();
    this.db = null;
    this.initialized = false;
  }

  /**
   * 초기화 여부 확인
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// 싱글톤 인스턴스
export const memoryService = new MemoryService();
