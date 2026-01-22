"use client";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store/use-app-store";
import {
  isColumnData,
  isMoveAllowed,
  isTaskData,
  Task,
  TaskStatus,
} from "@/lib/types";
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

        const sourceData = source.data;
        const destinationData = destination.data;

        if (isTaskData(sourceData) && isColumnData(destinationData)) {
          const { taskId, currentStatus: fromStatus } = sourceData;
          const { status: newStatus } = destinationData;

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
