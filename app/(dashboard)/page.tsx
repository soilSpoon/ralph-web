import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AttentionList } from "@/components/dashboard/attention-list";
import { QuickStartCard } from "@/components/dashboard/quick-start-card";
import { StatusOverview } from "@/components/dashboard/status-overview";
import { mockActivity, mockTasks } from "@/lib/mock-data";

export default function DashboardPage() {
  const displayTasks = mockTasks;

  return (
    <div className="container-custom py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="heading-1">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your coding tasks</p>
      </div>

      <QuickStartCard />

      <StatusOverview tasks={displayTasks} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <AttentionList />
          {/* Recent tasks list could go here */}
        </div>
        <div className="md:col-span-1">
          <ActivityFeed activities={mockActivity} />
        </div>
      </div>
    </div>
  );
}
