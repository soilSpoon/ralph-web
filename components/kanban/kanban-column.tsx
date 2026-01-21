"use client";

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";
import { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";

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
        "flex flex-col w-72 min-w-[18rem] bg-card/20 rounded-sm border border-border transition-colors duration-150",
        isDraggedOver && "bg-muted/10 border-primary/40",
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border/50">
        <h3 className="text-mono-label flex items-center gap-2.5">
          {label}
          <span className="text-[12px] text-muted-foreground font-mono bg-muted/20 px-2 py-0.5 rounded-sm border border-border/50 tabular-nums">
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
