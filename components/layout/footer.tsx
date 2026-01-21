"use client";

import { mockTasks } from "@/lib/mock-data";

export function Footer() {
  const runningTasks = mockTasks.filter((t) => t.status === "running").length;
  const reviewTasks = mockTasks.filter((t) => t.status === "review").length;

  const parts = [];
  if (runningTasks > 0)
    parts.push(`${runningTasks} task${runningTasks > 1 ? "s" : ""} running`);
  if (reviewTasks > 0)
    parts.push(
      `${reviewTasks} task${reviewTasks > 1 ? "s" : ""} pending review`,
    );

  const statusText =
    parts.length > 0 ? `Status: ${parts.join(" • ")}` : "All tasks up to date";

  return (
    <footer className="h-8 border-t bg-muted/30 flex items-center shrink-0">
      <div className="container-custom">
        <p className="text-caption text-muted-foreground">{statusText}</p>
      </div>
    </footer>
  );
}
