"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityItem } from "@/lib/types";

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "numeric",
    hour12: locale === "en",
  });

  function formatTime(date: Date) {
    return timeFormatter.format(date);
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t("activity")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 pr-4">
          <div className="space-y-6">
            {activities.map((item) => (
              <div
                key={item.id}
                className="relative pl-6 pb-2 border-l border-border last:border-0"
              >
                <div className="absolute -left-1 top-0 w-2.5 h-2.5 rounded-full bg-primary/20 ring-4 ring-background" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(item.timestamp)}
                  </span>
                  <span className="font-medium text-sm">{item.taskName}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.message}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
