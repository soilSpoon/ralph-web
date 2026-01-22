"use client";

import { Inbox } from "lucide-react";
import { useTranslations } from "next-intl";
import { Task } from "@/lib/types";
import { ArchivedTaskCard } from "./archived-task-card";

interface ArchivedTaskListProps {
  tasks: Task[];
  searchQuery?: string;
  onRestore?: (id: string) => void;
}

export function ArchivedTaskList({
  tasks,
  searchQuery = "",
  onRestore,
}: ArchivedTaskListProps) {
  const t = useTranslations("Archive");

  const filteredTasks = tasks.filter(
    (task) =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/10 rounded-sm border border-dashed border-border/60">
        <Inbox className="w-10 h-10 mb-4 opacity-20" />
        <p className="text-sm font-medium">{t("noArchivedTasks")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTasks.map((task) => (
        <ArchivedTaskCard key={task.id} task={task} onRestore={onRestore} />
      ))}
    </div>
  );
}
