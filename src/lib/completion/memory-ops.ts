interface SnapshotData {
  type: string;
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | SnapshotData
    | SnapshotData[];
}

class RalphMemoryService {
  async saveSnapshot(sessionId: string, data: SnapshotData) {
    console.log(`[Memory] Saving snapshot for ${sessionId}`, data);
  }
}

export interface TerminalSnapshot
  extends Record<string, string | number | boolean | null | undefined> {
  stdout?: string;
  exitCode?: number;
}

export class MemoryOps {
  private memoryService: RalphMemoryService;

  constructor() {
    this.memoryService = new RalphMemoryService();
  }

  async saveTerminalSnapshot(sessionId: string, result: TerminalSnapshot) {
    await this.memoryService.saveSnapshot(sessionId, {
      type: "terminal_snapshot",
      ...result,
    });
  }
}

export const memoryOps = new MemoryOps();
