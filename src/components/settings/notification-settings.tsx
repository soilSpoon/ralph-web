"use client";

import { useTranslations } from "next-intl";
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

  return (
    <Card className="shadow-none rounded-sm border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">{t("notifications")}</CardTitle>
        <CardDescription>{t("notificationDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="notify-complete" defaultChecked />
          <Label htmlFor="notify-complete" className="cursor-pointer">
            {t("notifyOnComplete")}
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="notify-error" defaultChecked />
          <Label htmlFor="notify-error" className="cursor-pointer">
            {t("notifyOnError")}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
