"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function GitSettings() {
  const t = useTranslations("Settings");

  return (
    <Card className="shadow-none rounded-sm border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">{t("git")}</CardTitle>
        <CardDescription>
          Configure how Ralph-Web interacts with your Git repositories.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="default-branch">{t("defaultBranch")}</Label>
          <Input
            id="default-branch"
            defaultValue="main"
            className="rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commit-format">{t("commitFormat")}</Label>
          <Input
            id="commit-format"
            defaultValue="feat: {task_id} - {title}"
            className="rounded-sm"
          />
          <p className="text-caption text-muted-foreground pt-1">
            Available placeholders: {"{task_id}"}, {"{title}"}, {"{iteration}"}
          </p>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox id="auto-push" defaultChecked />
          <Label htmlFor="auto-push" className="cursor-pointer">
            {t("autoPush")}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
