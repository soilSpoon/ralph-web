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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProviderSettings() {
  const t = useTranslations("Settings");
  const providerSelectId = useId();
  const apiKeyId = useId();
  const defaultProviderId = useId();

  return (
    <Card className="shadow-none rounded-sm border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">{t("provider")}</CardTitle>
        <CardDescription>{t("providerDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={providerSelectId}>{t("providerSelect")}</Label>
          <Select defaultValue="claude">
            <SelectTrigger id={providerSelectId} className="rounded-sm w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="claude">Anthropic Claude</SelectItem>
              <SelectItem value="openai">OpenAI GPT</SelectItem>
              <SelectItem value="gemini">Google Gemini</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={apiKeyId}>{t("apiKey")}</Label>
          <Input
            id={apiKeyId}
            type="password"
            placeholder={t("apiKey")}
            className="rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={defaultProviderId}>{t("defaultProvider")}</Label>
          <Select defaultValue="claude">
            <SelectTrigger id={defaultProviderId} className="rounded-sm w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="claude">Claude (Default)</SelectItem>
              <SelectItem value="gemini">Gemini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
