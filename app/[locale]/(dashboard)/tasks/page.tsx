import { useTranslations } from "next-intl";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { mockTasks } from "@/lib/mock-data";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const t = useTranslations("Tasks");

  return (
    <div className="container-custom py-6 space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="heading-1">{t("title")}</h1>
          <p className="text-xl text-muted-foreground mt-1">
            {t("description")}
          </p>
        </div>
        <Link href="/tasks/new">
          <Button className="font-semibold shadow-sm gap-2">
            <Plus className="w-4 h-4" />
            {t("newTask")}
          </Button>
        </Link>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard tasks={mockTasks} />
      </div>
    </div>
  );
}
