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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GitSettings() {
  const t = useTranslations("Settings");
  const defaultBranchId = useId();
  const commitFormatId = useId();
  const autoPushId = useId();

  return (
    <Card className="shadow-none rounded-sm border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">{t("git")}</CardTitle>
        <CardDescription>{t("gitDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={defaultBranchId}>{t("defaultBranch")}</Label>
          <Input
            id={defaultBranchId}
            defaultValue="main"
            className="rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={commitFormatId}>{t("commitFormat")}</Label>
          <Input
            id={commitFormatId}
            defaultValue="feat: {task_id} - {title}"
            className="rounded-sm"
          />
          <p className="text-caption text-muted-foreground pt-1">
            {t("placeholders")}
          </p>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox id={autoPushId} defaultChecked />
          <Label htmlFor={autoPushId} className="cursor-pointer">
            {t("autoPush")}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
