"use client";

import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function ProviderSettings() {
  const t = useTranslations("Settings");

  return (
    <Card className="shadow-none rounded-sm border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">{t("provider")}</CardTitle>
        <CardDescription>
          Configure your AI model providers and API keys.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="provider-select">{t("providerSelect")}</Label>
          <Select defaultValue="claude">
            <SelectTrigger id="provider-select" className="rounded-sm w-full">
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
          <Label htmlFor="api-key">{t("apiKey")}</Label>
          <Input
            id="api-key"
            type="password"
            placeholder={t("apiKey")}
            className="rounded-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-provider">{t("defaultProvider")}</Label>
          <Select defaultValue="claude">
            <SelectTrigger id="default-provider" className="rounded-sm w-full">
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
