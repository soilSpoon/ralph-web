import type { PatternCategory, TaskStatus } from "./types";

// Date and time formatters
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return formatDate(date);
}

// Status formatters
export function formatTaskStatus(status: TaskStatus): string {
  const statusMap: Record<TaskStatus, string> = {
    draft: "Draft",
    pending: "Pending",
    queued: "Queued",
    running: "Running",
    review: "Review",
    merged: "Merged",
    failed: "Failed",
  };
  return statusMap[status] || status;
}

export function getStatusColor(status: TaskStatus): string {
  const colorMap: Record<TaskStatus, string> = {
    draft: "var(--color-draft)",
    pending: "var(--color-queued)",
    queued: "var(--color-queued)",
    running: "var(--color-running)",
    review: "var(--color-review)",
    merged: "var(--color-merged)",
    failed: "var(--color-failed)",
  };
  return colorMap[status] || "var(--color-draft)";
}

export function getStatusBadgeVariant(
  status: TaskStatus,
): "default" | "secondary" | "destructive" | "outline" {
  const variantMap: Record<
    TaskStatus,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    draft: "outline",
    pending: "secondary",
    queued: "secondary",
    running: "default",
    review: "secondary",
    merged: "default",
    failed: "destructive",
  };
  return variantMap[status] || "default";
}

// Progress formatters
export function formatProgress(completed: number, total: number): string {
  return `${completed}/${total}`;
}

export function formatProgressPercent(
  completed: number,
  total: number,
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Category formatters
export function formatPatternCategory(category: PatternCategory): string {
  const categoryMap: Record<PatternCategory, string> = {
    convention: "Convention",
    gotcha: "Gotcha",
    tip: "Tip",
  };
  return categoryMap[category] || category;
}

// File size formatter
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

// Duration formatter
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}
