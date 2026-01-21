import { Badge } from '@/components/ui/badge';
import { getStatusBadgeVariant, formatTaskStatus } from '@/lib/formatters';
import type { TaskStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = getStatusBadgeVariant(status);
  const label = formatTaskStatus(status);

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
