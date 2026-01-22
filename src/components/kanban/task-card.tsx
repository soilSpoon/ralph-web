"use client";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Archive, Clock, GitBranch, MoreVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/routing";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const tArchive = useTranslations("Archive");
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({ taskId: task.id, currentStatus: task.status }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [task.id, task.status]);

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Archiving task:", task.id);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <Card className="hover:border-primary/50 transition-colors duration-150 shadow-none bg-background rounded-sm border-border/70 group">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-start gap-2">
            <Link
              href={`/tasks/${task.id}`}
              className="hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-sm outline-none flex-1"
            >
              <h4 className="font-semibold text-base leading-tight tracking-tight">
                {task.name}
              </h4>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 data-open:opacity-100 transition-opacity rounded-sm"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">More</span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  <span>{tArchive("archive")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-small text-muted-foreground line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center justify-between text-caption text-muted-foreground pt-3 border-t border-border/40">
            <div className="flex items-center gap-2">
              {task.branchName && (
                <div className="flex items-center gap-1 font-mono text-xs">
                  <GitBranch className="w-3 h-3" />
                  <span>{task.branchName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 font-mono text-xs bg-muted/30 px-1.5 py-0.5 rounded-sm tabular-nums">
              <Clock className="w-3 h-3" />
              <span>
                {task.currentIteration.toString().padStart(2, "0")}/
                {task.maxIterations.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
