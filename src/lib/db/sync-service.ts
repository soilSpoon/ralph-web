import fs from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDB, stories, tasks } from "./index";

/**
 * Zod schema defining the structure of the PRD JSON file
 */
const prdFileSchema = z.object({
  id: z.string(),
  project: z.string(),
  description: z.string(),
  branchName: z.string(),
  userStories: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      acceptanceCriteria: z.array(z.string()),
      priority: z.number().default(1),
      passes: z.boolean().default(false),
    }),
  ),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

type PRDFileData = z.infer<typeof prdFileSchema>;

/**
 * Service responsible for synchronization between DB data and local file system
 */
export class SyncService {
  /**
   * Generate file from latest DB data (Materialize)
   * Called before agent starts work
   */
  async materializeTask(taskId: string): Promise<string> {
    const db = await getDB();
    if (!db) return "";

    // 1. Retrieve task and stories from DB (Type-safe with relational query)
    const taskRecord = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        stories: true,
      },
    });

    if (!taskRecord) throw new Error(`Task ${taskId} not found in DB`);

    // 2. Convert to JSON format expected by the agent
    const prdJson: PRDFileData = {
      id: taskRecord.id,
      project: taskRecord.name,
      description: taskRecord.description ?? "",
      branchName: taskRecord.branchName,
      userStories: taskRecord.stories.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description ?? "",
        acceptanceCriteria: s.acceptanceCriteria,
        priority: s.priority,
        passes: s.passes,
      })),
      createdAt: taskRecord.createdAt.toISOString(),
      updatedAt: taskRecord.updatedAt.toISOString(),
    };

    // 3. Save to file
    const metadataDir =
      taskRecord.metadataPath ||
      path.join(process.cwd(), ".ralph", "tasks", taskId);
    await fs.mkdir(metadataDir, { recursive: true });

    const prdPath = path.join(metadataDir, "prd.json");
    await fs.writeFile(prdPath, JSON.stringify(prdJson, null, 2), "utf-8");

    console.log(`[Sync] Materialized DB -> ${prdPath}`);
    return prdPath;
  }

  /**
   * Reflect file content modified by agent to DB (Consolidate)
   * Called after agent work finishes
   */
  async consolidateTask(taskId: string): Promise<void> {
    const db = await getDB();
    if (!db) return;

    const taskRecord = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!taskRecord) throw new Error(`Task ${taskId} not found in DB`);

    const metadataDir =
      taskRecord.metadataPath ||
      path.join(process.cwd(), ".ralph", "tasks", taskId);
    const prdPath = path.join(metadataDir, "prd.json");

    try {
      await fs.access(prdPath);
    } catch {
      console.warn(`[Sync] prd.json not found at ${prdPath}, skipping sync.`);
      return;
    }

    // 1. Read and validate file
    const prdContent = await fs.readFile(prdPath, "utf-8");
    const rawData = JSON.parse(prdContent);
    const prdData = prdFileSchema.parse(rawData);

    // 2. Update task basic information
    await db
      .update(tasks)
      .set({
        name: prdData.project,
        description: prdData.description,
      })
      .where(eq(tasks.id, taskId));

    // 3. Update story status (Upsert pattern)
    for (const storyData of prdData.userStories) {
      await db
        .insert(stories)
        .values({
          id: storyData.id,
          taskId: taskId,
          title: storyData.title,
          description: storyData.description ?? "",
          acceptanceCriteria: storyData.acceptanceCriteria,
          priority: storyData.priority,
          passes: storyData.passes,
        })
        .onConflictDoUpdate({
          target: [stories.taskId, stories.id],
          set: {
            title: storyData.title,
            description: storyData.description ?? "",
            acceptanceCriteria: storyData.acceptanceCriteria,
            passes: storyData.passes,
          },
        });
    }

    console.log(`[Sync] Consolidated ${prdPath} -> DB`);
  }

  /**
   * Rebuild all task information to DB
   * Used in initial migration or recovery phase
   */
  async rebuildFromFiles(): Promise<void> {
    const tasksDir = path.join(process.cwd(), ".ralph", "tasks");
    try {
      const taskDirs = await fs.readdir(tasksDir);
      for (const id of taskDirs) {
        if (id === "archive") continue;
        const dirPath = path.join(tasksDir, id);
        const stats = await fs.stat(dirPath);
        if (stats.isDirectory()) {
          const prdPath = path.join(dirPath, "prd.json");
          try {
            await fs.access(prdPath);
            await this.importTaskFromFile(id, prdPath);
          } catch {}
        }
      }
    } catch (error) {
      console.error("[Sync] Rebuild failed:", error);
    }
  }

  private async importTaskFromFile(taskId: string, prdPath: string) {
    const db = await getDB();
    if (!db) return;

    const content = await fs.readFile(prdPath, "utf-8");
    const rawData = JSON.parse(content);
    const data = prdFileSchema.parse(rawData);

    await db
      .insert(tasks)
      .values({
        id: taskId,
        name: data.project,
        description: data.description,
        branchName: data.branchName,
        metadataPath: path.dirname(prdPath),
        status: "pending",
      })
      .onConflictDoUpdate({
        target: tasks.id,
        set: {
          name: data.project,
          description: data.description,
        },
      });

    for (const s of data.userStories) {
      await db
        .insert(stories)
        .values({
          id: s.id,
          taskId: taskId,
          title: s.title,
          description: s.description ?? "",
          acceptanceCriteria: s.acceptanceCriteria,
          priority: s.priority,
          passes: s.passes,
        })
        .onConflictDoUpdate({
          target: [stories.taskId, stories.id],
          set: {
            passes: s.passes,
          },
        });
    }
  }
}

export const syncService = new SyncService();
