"use client";

import { StatusOverview } from "@/components/dashboard/status-overview";
import { QuickStartCard } from "@/components/dashboard/quick-start-card";
import { AttentionList } from "@/components/dashboard/attention-list";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { mockTasks, mockActivity } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store/use-app-store";
import { useEffect } from "react";

export default function DashboardPage() {
  const { setTasks, tasks } = useAppStore();

  useEffect(() => {
    // Load mock data on mount
    setTasks(mockTasks);
  }, [setTasks]);

  const displayTasks = tasks.length > 0 ? tasks : mockTasks;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
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
