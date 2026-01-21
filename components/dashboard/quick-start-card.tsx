"use client";

import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store/use-app-store";
import { Task } from "@/lib/types";

export function QuickStartCard() {
  const t = useTranslations("QuickStart");
  const [description, setDescription] = useState("");
  const { addTask } = useAppStore();

  const handleStart = () => {
    if (!description.trim()) return;

    const newTask: Task = {
      id: `t-${Date.now()}`,
      name:
        description.length > 20
          ? description.substring(0, 20) + "..."
          : description,
      description: description,
      status: "draft",
      priority: 2,
      currentIteration: 0,
      maxIterations: 5,
      worktreePath: "",
      branchName: "",
      metadataPath: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addTask(newTask);
    setDescription("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Input
            placeholder={t("placeholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleStart} disabled={!description.trim()}>
            <Play className="w-4 h-4 mr-2" />
            {t("button")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
