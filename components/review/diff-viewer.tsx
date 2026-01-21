"use client";

import { useEffect, useState, useMemo } from "react";
import { DiffView, DiffModeEnum, DiffFile } from "@git-diff-view/react";
import "@git-diff-view/react/styles/diff-view.css";
import { getDiffHighlighter, DiffHighlighter } from "@/lib/diff-highlighter";
import { ParsedDiffFile } from "@/lib/diff-utils";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";

interface DiffViewerProps {
  diffFile: ParsedDiffFile;
}

export function DiffViewer({ diffFile }: DiffViewerProps) {
  const { resolvedTheme } = useTheme();
  const [highlighter, setHighlighter] = useState<DiffHighlighter | null>(null);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    getDiffHighlighter().then(setHighlighter);
  }, []);

  const diffData = useMemo(() => {
    if (!diffFile) return null;

    const isNew = diffFile.oldPath === "/dev/null";
    const isDeleted = diffFile.newPath === "/dev/null";

    return {
      oldFile: {
        fileName: isNew ? null : diffFile.oldPath,
        content: null,
      },
      newFile: {
        fileName: isDeleted ? null : diffFile.newPath,
        content: null,
      },
      hunks: [diffFile.diffText],
    };
  }, [diffFile]);

  if (!highlighter) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  return (
    <div className="agent-diff-wrapper h-full bg-background font-mono text-sm overflow-auto">
      <style jsx global>{`
        .agent-diff-wrapper {
          --diff-view-border-color: var(--border);
          --diff-view-bg-color: transparent;
          --diff-view-line-number-color: var(--muted-foreground);
          --diff-view-line-number-bg-color: transparent;
          --diff-view-added-bg-color: rgba(16, 185, 129, 0.1);
          --diff-view-removed-bg-color: rgba(239, 68, 68, 0.1);
          --diff-view-added-highlight-color: rgba(16, 185, 129, 0.2);
          --diff-view-removed-highlight-color: rgba(239, 68, 68, 0.2);
        }
        /* Custom UI polishing to match 1code style */
        .git-diff-view {
          border: none !important;
        }
        .git-diff-view-line-number {
          width: 50px !important;
          border-right: 1px solid var(--border) !important;
          opacity: 0.5;
        }
      `}</style>
      <DiffView
        data={diffData || undefined}
        diffViewTheme={isDark ? "dark" : "light"}
        diffViewMode={DiffModeEnum.Split}
        diffViewHighlight={true}
        registerHighlighter={highlighter as any}
        diffViewWrap={false}
      />
    </div>
  );
}
