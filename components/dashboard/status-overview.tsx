"use client";

import { FileText, ListTodo, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusOverviewProps {
  tasks: Task[];
}

export function StatusOverview({ tasks }: StatusOverviewProps) {
  const t = useTranslations("Status");
  const initialCounts: Record<string, number> = {
    running: 0,
    review: 0,
    draft: 0,
    queued: 0,
  };
  const counts = tasks.reduce((acc, task) => {
    const { status } = task;
    if (status in acc) {
      acc[status]++;
    }
    return acc;
  }, initialCounts);

  const items = [
    {
      label: t("running"),
      key: "running",
      count: counts.running,
      icon: Play,
      borderColor: "border-primary/40 text-primary",
    },
    {
      label: t("review"),
      key: "review",
      count: counts.review,
      icon: FileText,
      borderColor: "border-violet-500/40 text-violet-500",
    },
    {
      label: t("draft"),
      key: "draft",
      count: counts.draft,
      icon: FileText,
      borderColor: "border-indigo-500/40 text-indigo-500",
    },
    {
      label: t("queued"),
      key: "queued",
      count: counts.queued,
      icon: ListTodo,
      borderColor: "border-orange-500/40 text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card
          key={item.key}
          className={cn(
            "rounded-sm shadow-none bg-background border-border/60 transition-all hover:border-border",
            item.borderColor.split(" ")[0],
          )}
        >
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/70">
                {item.label}
              </p>
              <div className="text-2xl font-bold mt-1 tracking-tight">
                {item.count.toString().padStart(2, "0")}
              </div>
            </div>
            <div
              className={cn(
                "p-2 rounded-sm bg-muted/20",
                item.borderColor.split(" ")[1],
              )}
            >
              <item.icon className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
