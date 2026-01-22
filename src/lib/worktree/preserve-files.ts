import fs from "node:fs/promises";
import path from "node:path";
import { minimatch } from "minimatch";
import type { PreserveResult } from "./types";

/**
 * Copies gitignored or specific environment files from source to worktree.
 * Based on emdash/Auto-Claude patterns.
 */
export async function preserveFilesToWorktree(
  sourceDir: string,
  destDir: string,
  patterns: string[],
  excludePatterns: string[] = ["node_modules", ".git"],
): Promise<PreserveResult> {
  const result: PreserveResult = { copied: [], skipped: [] };

  try {
    const files = await fs.readdir(sourceDir, { recursive: true });

    for (const fileRelativePath of files) {
      // Normalize to forward slashes for minimatch
      const normalizedPath = fileRelativePath.toString().replace(/\\/g, "/");
      const fileName = path.basename(normalizedPath);

      // Skip excluded directories early
      if (
        excludePatterns.some(
          (p) =>
            normalizedPath.startsWith(p) || normalizedPath.includes(`/${p}/`),
        )
      ) {
        continue;
      }

      const isMatch = patterns.some(
        (p) =>
          minimatch(fileName, p, { dot: true }) ||
          minimatch(normalizedPath, p, { dot: true }),
      );

      if (isMatch) {
        const sourcePath = path.join(sourceDir, normalizedPath);
        const destPath = path.join(destDir, normalizedPath);

        const stats = await fs.stat(sourcePath);
        if (stats.isDirectory()) continue;

        try {
          // Check if already exists
          await fs.access(destPath);
          result.skipped.push(normalizedPath);
        } catch {
          // Ensure directory exists
          await fs.mkdir(path.dirname(destPath), { recursive: true });
          // Copy file
          await fs.copyFile(sourcePath, destPath);
          result.copied.push(normalizedPath);
        }
      }
    }
  } catch (error) {
    console.warn("[PreserveFiles] Error during file preservation", error);
  }

  return result;
}
