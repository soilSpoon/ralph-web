"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttentionItem {
  id: string;
  title: string;
  type: "review_failed" | "approval_needed" | "error";
  taskId: string;
}

// Mock data integration later
const items: AttentionItem[] = [
  {
    id: "1",
    title: 'Review failed for "Auth System"',
    type: "review_failed",
    taskId: "t-1",
  },
  {
    id: "2",
    title: 'Approval needed for "API Schema"',
    type: "approval_needed",
    taskId: "t-3",
  },
];

export function AttentionList() {
  const t = useTranslations("Dashboard");

  if (items.length === 0) return null;

  return (
    <Card className="border-destructive/30 bg-destructive/5 rounded-sm">
      <CardHeader className="py-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-destructive">
            {t("attention")}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-background rounded-sm border border-border/60 hover:border-destructive/40 transition-colors duration-150"
          >
            <span className="text-xs font-medium tracking-tight">
              {item.title}
            </span>
            <Button
              variant="ghost"
              size="xs"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {t("view")}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
