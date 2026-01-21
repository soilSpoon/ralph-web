import { KanbanBoard } from "@/components/kanban/kanban-board";
import { mockTasks } from "@/lib/mock-data";

export default function TasksPage() {
  return (
    <div className="container-custom py-6 space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="heading-1">Tasks</h1>
          <p className="text-muted-foreground">
            Manage and track your coding tasks
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard tasks={mockTasks} />
      </div>
    </div>
  );
}
