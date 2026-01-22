import { taskManager } from "@/lib/tasks/task-manager";

export async function generateStaticParams() {
  const tasks = await taskManager.getTasks();
  return tasks.map((task) => ({
    id: task.id,
  }));
}
