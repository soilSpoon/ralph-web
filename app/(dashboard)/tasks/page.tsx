import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { mockTasks } from '@/lib/mock-data';
import { KanbanColumn } from '@/components/kanban/kanban-column';
import type { TaskStatus } from '@/lib/types';
import Link from 'next/link';

const columns: TaskStatus[] = ['pending', 'queued', 'running', 'review', 'merged'];

export default function TasksPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background p-4 flex items-center justify-between">
        <h1 className="heading-2">📋 Tasks</h1>
        <Link href="/tasks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </Link>
      </div>
      
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6">
          {columns.map((status) => {
            const tasks = mockTasks.filter((t) => t.status === status);
            return <KanbanColumn key={status} status={status} tasks={tasks} />;
          })}
        </div>
      </div>
    </div>
  );
}
