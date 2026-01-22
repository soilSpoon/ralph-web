import { Progress } from "@/components/ui/progress";
import { formatProgress, formatProgressPercent } from "@/lib/formatters";

interface ProgressBarProps {
  completed: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  completed,
  total,
  showLabel = true,
  className,
}: ProgressBarProps) {
  const percent = formatProgressPercent(completed, total);
  const label = formatProgress(completed, total);

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-small text-muted-foreground">{label}</span>
          <span className="text-small font-medium">{percent}%</span>
        </div>
      )}
      <Progress value={percent} />
    </div>
  );
}
