"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConcurrencySettings() {
  const t = useTranslations("Settings");
  const maxConcurrentId = useId();

  return (
    <Card className="shadow-none rounded-sm border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">{t("concurrency")}</CardTitle>
        <CardDescription>{t("concurrencyDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={maxConcurrentId}>{t("maxConcurrentTasks")}</Label>
          <Input
            id={maxConcurrentId}
            type="number"
            min={1}
            max={10}
            defaultValue={3}
            className="rounded-sm w-32"
          />
          <p className="text-xs text-muted-foreground pt-1">
            {t("performanceWarning")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
