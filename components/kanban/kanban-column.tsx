import { Card } from '@/components/ui/card';
import type { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from './task-card';
import { formatTaskStatus } from '@/lib/formatters';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const title = formatTaskStatus(status);

  return (
    <div className="flex flex-col gap-4 min-w-[320px]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {getStatusEmoji(status)} {title}
        </h3>
        <span className="text-sm text-muted-foreground">({tasks.length})</span>
      </div>
      
      <div className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-sm text-muted-foreground">No tasks</p>
          </Card>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}

function getStatusEmoji(status: TaskStatus): string {
  const emojiMap: Record<TaskStatus, string> = {
    pending: '📝',
    queued: '⏳',
    running: '🔄',
    review: '👀',
    merged: '✅',
    failed: '❌',
  };
  return emojiMap[status] || '📋';
}
