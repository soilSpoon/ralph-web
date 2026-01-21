"use client";

import { KanbanBoard } from "@/components/kanban/kanban-board";
import { useAppStore } from "@/lib/store/use-app-store";
import { mockTasks } from "@/lib/mock-data";
import { useEffect } from "react";

export default function TasksPage() {
  const { tasks, setTasks } = useAppStore();

  useEffect(() => {
    if (tasks.length === 0) {
      setTasks(mockTasks);
    }
  }, [tasks.length, setTasks]);

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="heading-1">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your coding tasks
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard tasks={tasks} />
      </div>
    </div>
  );
}
