"use client";

import { useTranslations } from "next-intl";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store/use-app-store";
import { TASK_STATUSES, Task, TaskStatus, isMoveAllowed } from "@/lib/types";
import { KanbanColumn } from "./kanban-column";

interface KanbanBoardProps {
  tasks: Task[];
}

const COLUMN_STATUSES: TaskStatus[] = [
  "draft",
  "queued",
  "running",
  "review",
  "merged",
];

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const { setTasks } = useAppStore();
  const t = useTranslations("Status");

  useEffect(() => {
    return monitorForElements({
      onDrop({ location, source }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const { taskId, currentStatus } = source.data;
        const { status } = destination.data;

        if (
          typeof taskId === "string" &&
          typeof status === "string" &&
          typeof currentStatus === "string" &&
          (TASK_STATUSES as readonly string[]).includes(status)
        ) {
          const newStatus = status as TaskStatus;
          const fromStatus = currentStatus as TaskStatus;

          if (isMoveAllowed(fromStatus, newStatus)) {
            setTasks(
              tasks.map((t) =>
                t.id === taskId ? { ...t, status: newStatus } : t,
              ),
            );
          }
        }
      },
    });
  }, [tasks, setTasks]);

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {COLUMN_STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          label={t(status)}
          tasks={tasks.filter((t) => t.status === status)}
        />
      ))}
    </div>
  );
}
