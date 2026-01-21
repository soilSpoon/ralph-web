"use client";

import { HelpCircle, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Header() {
  const t = useTranslations("Navigation");
  const router = useRouter();

  return (
    <header className="h-14 border-b bg-background flex items-center shrink-0">
      <div className="container-custom flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="heading-3">🔧 Ralph-Web</h1>
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">{t("settings")}</span>
                </Button>
              }
            />
            <TooltipContent>
              <p>{t("settings")}</p>
            </TooltipContent>
          </Tooltip>

          <ThemeToggle />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-5 w-5" />
                  <span className="sr-only">{t("help")}</span>
                </Button>
              }
            />
            <TooltipContent>
              <p>{t("help")}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
