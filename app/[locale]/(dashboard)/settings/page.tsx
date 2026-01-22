"use client";

import { Save, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConcurrencySettings } from "@/components/settings/concurrency-settings";
import { GitSettings } from "@/components/settings/git-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ProviderSettings } from "@/components/settings/provider-settings";
import { WorktreeSettings } from "@/components/settings/worktree-settings";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const t = useTranslations("Settings");

  const handleSave = () => {
    toast.success(t("saved"));
  };

  return (
    <div className="container-custom py-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-border/40">
        <div className="flex flex-col gap-1">
          <h1 className="heading-1 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={handleSave} className="gap-2 rounded-sm shadow-sm">
          <Save className="w-4 h-4" />
          {t("save")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div className="space-y-6">
          <ProviderSettings />
          <ConcurrencySettings />
        </div>
        <div className="space-y-6">
          <GitSettings />
          <WorktreeSettings />
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
}
