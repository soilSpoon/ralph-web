"use client";

import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/routing";

export function QuickStartCard() {
  const t = useTranslations("QuickStart");
  const router = useRouter();
  const [description, setDescription] = useState("");

  const handleStart = () => {
    if (!description.trim()) return;
    router.push(`/tasks/new?description=${encodeURIComponent(description)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleStart();
    }
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
            onKeyDown={handleKeyDown}
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
