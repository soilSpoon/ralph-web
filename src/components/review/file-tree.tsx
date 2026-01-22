"use client";

import { FileCode, FilePlus } from "lucide-react";
import type { ParsedDiffFile } from "@/lib/diff-utils";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  files: ParsedDiffFile[];
  selectedFileKey: string | null;
  onSelect: (file: ParsedDiffFile) => void;
}

export function FileTree({ files, selectedFileKey, onSelect }: FileTreeProps) {
  // Simple flat view for now, as in the mock UI.
  // We can expand this to a directory tree if needed.

  return (
    <div className="flex flex-col py-1">
      {files.map((file) => {
        const isSelected = selectedFileKey === file.key;
        const isNew = file.oldPath === "/dev/null";

        return (
          <button
            type="button"
            key={file.key}
            onClick={() => onSelect(file)}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors relative group outline-none",
              isSelected
                ? "bg-primary/5 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {isSelected && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
            )}

            <div className="shrink-0">
              {isNew ? (
                <FilePlus className="w-4 h-4 text-emerald-500" />
              ) : (
                <FileCode className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <span className="block truncate font-mono text-sm">
                {file.newPath || file.oldPath}
              </span>
            </div>

            <div className="shrink-0 font-mono text-xs tabular-nums opacity-60 group-hover:opacity-100">
              {file.additions > 0 && (
                <span className="text-emerald-500">+{file.additions}</span>
              )}
              {file.deletions > 0 && (
                <span className="text-destructive ml-1">-{file.deletions}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
