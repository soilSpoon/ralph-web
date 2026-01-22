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
import { Label } from "@/components/ui/label";

export function NotificationSettings() {
  const t = useTranslations("Settings");
  const notifyCompleteId = useId();
  const notifyErrorId = useId();

  return (
    <Card className="shadow-none rounded-sm border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">{t("notifications")}</CardTitle>
        <CardDescription>{t("notificationDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id={notifyCompleteId} defaultChecked />
          <Label htmlFor={notifyCompleteId} className="cursor-pointer">
            {t("notifyOnComplete")}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id={notifyErrorId} defaultChecked />
          <Label htmlFor={notifyErrorId} className="cursor-pointer">
            {t("notifyOnError")}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
