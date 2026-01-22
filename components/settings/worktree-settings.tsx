"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WorktreeSettings() {
  const t = useTranslations("Settings");

  return (
    <Card className="shadow-none rounded-sm border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">{t("worktree")}</CardTitle>
        <CardDescription>{t("worktreeDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="branch-prefix">{t("branchPrefix")}</Label>
            <Input
              id="branch-prefix"
              defaultValue="ralph"
              className="rounded-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="worktree-dir">{t("worktreeDir")}</Label>
            <Input
              id="worktree-dir"
              defaultValue=".ralph/worktrees"
              className="rounded-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preserve-patterns">{t("preservePatterns")}</Label>
          <Input
            id="preserve-patterns"
            defaultValue=".env, .env.local, .env.*.local, .envrc"
            className="rounded-sm"
          />
          <p className="text-caption text-muted-foreground pt-1">
            {t("patternHint")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exclude-patterns">{t("excludePatterns")}</Label>
          <Input
            id="exclude-patterns"
            defaultValue="node_modules, .git, dist, build, .next"
            className="rounded-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
