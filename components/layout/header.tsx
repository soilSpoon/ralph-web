"use client";

import { Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <h1 className="heading-3">🔧 Ralph-Web</h1>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            }
          />
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>

        <ThemeToggle />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Help</span>
              </Button>
            }
          />
          <TooltipContent>
            <p>Help</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
