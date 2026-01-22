"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { DiffViewer } from "@/components/review/diff-viewer";
import { FileTree } from "@/components/review/file-tree";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ParsedDiffFile, splitUnifiedDiffByFile } from "@/lib/diff-utils";
import { mockDiff, mockTasks } from "@/lib/mock-data";

export default function ReviewPage() {
  const t = useTranslations("TaskDetail");
  const { id } = useParams();
  const taskId = typeof id === "string" ? id : "";

  const task = mockTasks.find((t) => t.id === taskId) || mockTasks[0];
  const diffFiles = useMemo(() => splitUnifiedDiffByFile(mockDiff), []);
  const [selectedFile, setSelectedFile] = useState<ParsedDiffFile | null>(
    diffFiles[0] || null,
  );

  const totalAdditions = diffFiles.reduce((acc, f) => acc + f.additions, 0);
  const totalDeletions = diffFiles.reduce((acc, f) => acc + f.deletions, 0);

  return (
    <div className="container-custom py-6 space-y-6 h-full flex flex-col overflow-hidden">
      <header className="flex justify-between items-start shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="heading-2">{task.name}</h1>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20"
            >
              {t("reviewChanges")}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span>5/5 stories complete</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="flex items-center gap-1">
              <span className="text-emerald-500">+{totalAdditions}</span>
              <span className="text-destructive">-{totalDeletions}</span>
              <span>lines</span>
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex gap-6">
        <aside className="w-80 flex flex-col shrink-0 gap-4">
          <Card className="flex-1 overflow-hidden flex flex-col border-border/50 shadow-none">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm font-semibold">
                {t("files")} ({diffFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <FileTree
                files={diffFiles}
                selectedFileKey={selectedFile?.key || null}
                onSelect={setSelectedFile}
              />
            </CardContent>
          </Card>

          <Card className="h-48 border-border/50 shadow-none overflow-y-auto">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm font-semibold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-foreground space-y-2">
              <p>• Successfully implemented JWT token logic</p>
              <p>• Updated middleware to secure API routes</p>
              <p>• Followed security best practices for secrets</p>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col gap-4">
          <Card className="flex-1 overflow-hidden flex flex-col border-border/50 shadow-none">
            <CardContent className="p-0 flex-1 relative overflow-hidden">
              {selectedFile ? (
                <div className="absolute inset-0 flex flex-col">
                  <div className="px-4 py-2 bg-muted/30 border-b flex justify-between items-center shrink-0">
                    <span className="font-mono text-xs truncate mr-4">
                      {selectedFile.newPath || selectedFile.oldPath}
                    </span>
                    <div className="flex items-center gap-2 text-xs uppercase font-bold text-muted-foreground">
                      <span className="text-emerald-500">
                        +{selectedFile.additions}
                      </span>
                      <span className="text-destructive">
                        -{selectedFile.deletions}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <DiffViewer diffFile={selectedFile} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a file to see changes
                </div>
              )}
            </CardContent>
          </Card>

          <footer className="flex justify-between items-center shrink-0 bg-background pt-2">
            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20 gap-2 shadow-none"
            >
              <X className="w-4 h-4" />
              Reject & Discard
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="gap-2 shadow-none border-border/50"
              >
                <RotateCcw className="w-4 h-4" />
                Request Changes
              </Button>
              <Button className="gap-2 font-semibold shadow-sm">
                <Check className="w-4 h-4" />
                Approve & Merge
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
