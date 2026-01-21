"use client";

import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect, useRef, useState } from "react";
import { isMoveAllowed, isTaskStatus, Task, TaskStatus } from "@/lib/types";
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
  const [canDrop, setCanDrop] = useState(false);

  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      getData: () => ({ status }),
      onDragEnter: ({ source }) => {
        setIsDraggedOver(true);
        const fromStatus = source.data.currentStatus;
        if (isTaskStatus(fromStatus)) {
          setCanDrop(isMoveAllowed(fromStatus, status));
        } else {
          setCanDrop(false);
        }
      },
      onDragLeave: () => {
        setIsDraggedOver(false);
        setCanDrop(false);
      },
      onDrop: () => {
        setIsDraggedOver(false);
        setCanDrop(false);
      },
    });
  }, [status]);

  return (
    <div
      ref={columnRef}
      className={cn(
        "flex flex-col w-72 min-w-72 bg-card/20 rounded-sm border border-border transition-colors duration-150",
        isDraggedOver &&
          (canDrop
            ? "bg-primary/5 border-primary/40 shadow-sm"
            : "bg-destructive/5 border-destructive/40 cursor-not-allowed opacity-80"),
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border/50">
        <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground tracking-tight">
          {label}
          <span className="text-xs font-medium text-foreground/60 bg-secondary px-2 py-0.5 rounded-sm tabular-nums border border-border/30">
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
