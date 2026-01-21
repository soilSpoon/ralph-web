"use client";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Clock, GitBranch } from "lucide-react";
import Link from "next/link";
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
      <Card className="hover:border-primary/50 transition-colors duration-150 shadow-none bg-background rounded-sm border-border/60">
        <CardContent className="p-3 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <Link
              href={`/tasks/${task.id}`}
              className="hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-sm outline-none"
            >
              <h4 className="font-semibold text-xs leading-tight tracking-tight">
                {task.name}
              </h4>
            </Link>
          </div>

          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
            <div className="flex items-center gap-2">
              {task.branchName && (
                <div className="flex items-center gap-1 font-mono text-[9px]">
                  <GitBranch className="w-2.5 h-2.5" />
                  <span>{task.branchName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 font-mono text-[9px] bg-muted/30 px-1 py-0.5 rounded-sm">
              <Clock className="w-2.5 h-2.5" />
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
