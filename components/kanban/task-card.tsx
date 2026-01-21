"use client";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Clock, GitBranch } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({ taskId: task.id }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [task.id]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50",
      )}
    >
      <Card className="hover:border-primary/50 transition-colors duration-150 shadow-none bg-background rounded-sm border-border/70">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-start gap-2">
            <Link
              href={`/tasks/${task.id}`}
              className="hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-sm outline-none"
            >
              <h4 className="font-semibold text-base leading-tight tracking-tight">
                {task.name}
              </h4>
            </Link>
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
