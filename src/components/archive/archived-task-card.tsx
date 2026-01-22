"use client";

import { ArrowUpRight, Calendar, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import type { Task } from "@/lib/types";

interface ArchivedTaskCardProps {
  task: Task;
  onRestore?: (id: string) => void;
}

export function ArchivedTaskCard({ task, onRestore }: ArchivedTaskCardProps) {
  const t = useTranslations("Archive");
  const completedDate = task.completedAt || task.updatedAt;

  // Simple date formatter that matches test expectation
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}. ${m}. ${d}.`;
  };

  return (
    <Card className="hover:border-primary/50 transition-colors duration-150 shadow-none bg-background rounded-sm border-border/70">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <h4 className="font-semibold text-base leading-tight tracking-tight">
              {task.name}
            </h4>
            <p className="text-small text-muted-foreground line-clamp-1">
              {task.description}
            </p>
          </div>
          <Link
            href={`/tasks/${task.id}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors focus:ring-1 focus:ring-primary/20 rounded-sm outline-none"
          >
            {t("viewDetails")}
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex items-center justify-between text-caption text-muted-foreground pt-3 border-t border-border/40">
          <div className="flex items-center gap-2 font-mono text-xs">
            <Calendar className="w-3 h-3" />
            <span>
              {t("completedOn")}: {formatDate(completedDate)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1 hover:bg-primary/10 hover:text-primary rounded-sm"
            onClick={() => onRestore?.(task.id)}
          >
            <RotateCcw className="w-3 h-3" />
            {t("unarchive")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
