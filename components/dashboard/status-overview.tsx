import { FileText, ListTodo, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/types";

interface StatusOverviewProps {
  tasks: Task[];
}

export function StatusOverview({ tasks }: StatusOverviewProps) {
  const counts = {
    running: tasks.filter((t) => t.status === "running").length,
    review: tasks.filter((t) => t.status === "review").length,
    draft: tasks.filter((t) => t.status === "draft").length,
    queued: tasks.filter((t) => t.status === "queued").length,
  };

  const items = [
    {
      label: "Running",
      count: counts.running,
      icon: Play,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Review",
      count: counts.review,
      icon: FileText,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Draft",
      count: counts.draft,
      icon: FileText, // Or dedicated Draft icon
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      label: "Queued",
      count: counts.queued,
      icon: ListTodo,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {item.label}
              </p>
              <div className="text-2xl font-bold">{item.count}</div>
            </div>
            <div className={`p-3 rounded-full ${item.bgColor} ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
