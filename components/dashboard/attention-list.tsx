import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttentionItem {
  id: string;
  title: string;
  type: "review_failed" | "approval_needed" | "error";
  taskId: string;
}

// Mock data integration later
const items: AttentionItem[] = [
  {
    id: "1",
    title: 'Review failed for "Auth System"',
    type: "review_failed",
    taskId: "t-1",
  },
  {
    id: "2",
    title: 'Approval needed for "API Schema"',
    type: "approval_needed",
    taskId: "t-3",
  },
];

export function AttentionList() {
  if (items.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-900/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          <CardTitle className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Needs Attention
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-sidebar-accent/50 rounded-lg border border-amber-100 dark:border-amber-900/30"
          >
            <span className="font-medium">{item.title}</span>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-amber-100 dark:hover:bg-amber-900/30"
            >
              View
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
