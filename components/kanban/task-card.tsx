"use client";

import { Task } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { cn } from "@/lib/utils";
import { Clock, GitBranch } from "lucide-react";

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
      <Card className="hover:border-primary/50 transition-colors shadow-sm bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-medium text-sm leading-tight">{task.name}</h4>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
            <div className="flex items-center gap-2">
              {task.branchName && (
                <div className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" />
                  <span>{task.branchName}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {task.currentIteration}/{task.maxIterations}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
