"use client";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store/use-app-store";
import { TASK_STATUSES, Task, TaskStatus } from "@/lib/types";
import { KanbanColumn } from "./kanban-column";

interface KanbanBoardProps {
  tasks: Task[];
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "draft", label: "Draft" },
  { status: "queued", label: "Queued" },
  { status: "running", label: "Running" },
  { status: "review", label: "Review" },
  { status: "merged", label: "Merged" },
];

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const { setTasks } = useAppStore();

  useEffect(() => {
    return monitorForElements({
      onDrop({ location, source }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const { taskId } = source.data;
        const { status } = destination.data;

        if (
          typeof taskId === "string" &&
          typeof status === "string" &&
          (TASK_STATUSES as readonly string[]).includes(status)
        ) {
          const newStatus = status as TaskStatus;
          setTasks(
            tasks.map((t) =>
              t.id === taskId ? { ...t, status: newStatus } : t,
            ),
          );
        }
      },
    });
  }, [tasks, setTasks]);

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.status}
          status={col.status}
          label={col.label}
          tasks={tasks.filter((t) => t.status === col.status)}
        />
      ))}
    </div>
  );
}
