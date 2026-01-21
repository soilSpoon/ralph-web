"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeVariant } from "@/lib/formatters";
import type { TaskStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const t = useTranslations("Status");
  const variant = getStatusBadgeVariant(status);
  const label = t(status);

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
