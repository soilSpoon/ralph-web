'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/status-badge';
import { ProgressBar } from '@/components/common/progress-bar';
import type { Task } from '@/lib/types';
import { formatRelativeTime } from '@/lib/formatters';
import { GitBranch, Clock } from 'lucide-react';
import Link from 'next/link';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  // Mock story counts for demo
  const completedStories = 3;
  const totalStories = 5;

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-2">{task.name}</CardTitle>
            <StatusBadge status={task.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProgressBar completed={completedStories} total={totalStories} showLabel={false} />
          
          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <span>{completedStories}/{totalStories} stories</span>
            <span>•</span>
            <span>{Math.round((completedStories / totalStories) * 100)}%</span>
          </div>

          <div className="space-y-1 text-caption text-muted-foreground">
            <div className="flex items-center gap-2">
              <GitBranch className="h-3 w-3" />
              <span className="truncate">{task.branchName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Iteration #{task.currentIteration}</span>
            </div>
          </div>

          <div className="text-caption text-muted-foreground">
            Updated: {formatRelativeTime(task.updatedAt)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
