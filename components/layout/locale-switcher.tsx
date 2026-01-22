"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routing, usePathname, useRouter } from "@/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(value: string | null) {
    if (!value) return;

    const isLocale = (v: string): v is (typeof routing.locales)[number] =>
      (routing.locales as readonly string[]).includes(v);

    if (isLocale(value)) {
      router.replace(pathname, { locale: value });
    }
  }

  return (
    <Select value={locale} onValueChange={onSelectChange}>
      <SelectTrigger className="w-32 h-9 gap-2">
        <Languages className="h-4 w-4" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((cur) => (
          <SelectItem key={cur} value={cur}>
            {cur === "en" ? t("english") : t("korean")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
