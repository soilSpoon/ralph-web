# Phase 8: Worktree Manager

> 📌 Part of [Phase 7-13 구현 명세](../phases.md)

태스크별 Git Worktree 격리 환경 구축

---

## 디렉토리 구조

```
lib/
└── worktree/
    ├── index.ts              # 메인 export
    ├── types.ts              # WorktreeInfo, PreserveResult 등
    ├── manager.ts            # Worktree CRUD
    ├── preserve.ts           # 환경 파일 보존 로직
    └── git.ts                # Git 명령 래퍼

.ralph/
├── preserve-patterns.json    # 사용자 정의 보존 패턴
└── worktrees/                # Worktree 메타데이터
    └── {taskId}/
        └── config.json
```

---

## 타입 정의

```typescript
// lib/worktree/types.ts

type WorktreeStatus = "active" | "paused" | "completed" | "error";

interface WorktreeInfo {
  id: string; // wt-{sha1:12}
  taskId: string;
  name: string;
  branch: string; // ralph/dark-mode-abc
  path: string; // .worktrees/task-001/
  status: WorktreeStatus;
  createdAt: Date;
  lastActivity?: Date;
}

interface BaseRefInfo {
  remote: string; // 'origin' | ''
  branch: string; // 'main'
  fullRef: string; // 'origin/main' | 'main'
}

interface PreserveResult {
  copied: string[];
  skipped: string[];
}

interface PreserveConfig {
  patterns: string[]; // ['.env', '.env.*', '.npmrc']
  exclude: string[]; // ['node_modules', '.git']
}
```

---

## 핵심 구현

```typescript
// lib/worktree/manager.ts
import { execSync } from "child_process";
import { preserveFiles } from "./preserve";

const DEFAULT_PRESERVE_PATTERNS = [
  ".env",
  ".env.local",
  ".env.*.local",
  ".npmrc",
  "docker-compose.override.yml",
];

const DEFAULT_EXCLUDE_PATTERNS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
];

class WorktreeManager {
  private projectPath: string;

  async create(taskId: string, taskName: string): Promise<WorktreeInfo> {
    const slug = this.slugify(taskName);
    const hash = this.generateShortHash();
    const branchName = `ralph/${slug}-${hash}`;
    const worktreePath = path.join(this.projectPath, ".worktrees", taskId);

    // 1. Base ref 확인
    const baseRef = await this.resolveBaseRef();

    // 2. Worktree 생성
    execSync(
      `git worktree add -b ${branchName} ${worktreePath} ${baseRef.fullRef}`,
      { cwd: this.projectPath },
    );

    // 3. 환경 파일 보존
    const patterns = this.getPreservePatterns();
    await preserveFiles(this.projectPath, worktreePath, patterns);

    return {
      id: this.generateId(worktreePath),
      taskId,
      name: taskName,
      branch: branchName,
      path: worktreePath,
      status: "active",
      createdAt: new Date(),
    };
  }

  async remove(worktreeId: string): Promise<void> {
    const info = await this.get(worktreeId);
    if (!info) throw new Error("Worktree not found");

    // 안전 장치: 메인 프로젝트 삭제 방지
    const normalized = path.resolve(info.path);
    if (normalized === path.resolve(this.projectPath)) {
      throw new Error("Cannot remove main repository");
    }

    execSync(`git worktree remove --force ${info.path}`, {
      cwd: this.projectPath,
    });

    execSync("git worktree prune", { cwd: this.projectPath });

    try {
      execSync(`git branch -D ${info.branch}`, { cwd: this.projectPath });
    } catch (e) {
      console.warn("Branch deletion failed:", e);
    }
  }

  async getStatus(worktreePath: string) {
    const output = execSync("git status --porcelain", {
      cwd: worktreePath,
      encoding: "utf-8",
    });

    const lines = output.trim().split("\n").filter(Boolean);
    return {
      hasChanges: lines.length > 0,
      stagedFiles: lines.filter((l) => l[0] !== " " && l[0] !== "?"),
      unstagedFiles: lines.filter((l) => l[1] !== " "),
      untrackedFiles: lines.filter((l) => l.startsWith("??")),
    };
  }

  private getPreservePatterns(): string[] {
    const configPath = path.join(
      this.projectPath,
      ".ralph/preserve-patterns.json",
    );
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf-8")).patterns;
    }
    return DEFAULT_PRESERVE_PATTERNS;
  }

  private generateShortHash(): string {
    return crypto.randomBytes(3).readUIntBE(0, 3).toString(36).slice(0, 3);
  }
}
```
