"use client";

import { Task, TaskStatus } from "@/lib/types";
import { TaskCard } from "./task-card";
import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}

export function KanbanColumn({ status, label, tasks }: KanbanColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      getData: () => ({ status }),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [status]);

  return (
    <div
      ref={columnRef}
      className={cn(
        "flex flex-col w-72 min-w-[18rem] bg-muted/50 rounded-lg border border-transparent transition-colors",
        isDraggedOver && "bg-muted border-primary/20",
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          {label}
          <span className="text-xs text-muted-foreground font-normal bg-background px-2 py-0.5 rounded-full border">
            {tasks.length}
          </span>
        </h3>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
