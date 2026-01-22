import { mockTasks } from "../mock-data";
import { Task } from "../types";

class TaskManager {
  private tasks: Map<string, Task> = new Map();

  constructor() {
    // Initialize with mock tasks
    mockTasks.forEach((task) => this.tasks.set(task.id, task));
  }

  getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  addTask(task: Task): void {
    this.tasks.set(task.id, task);
  }

  updateTask(id: string, updates: Partial<Task>): void {
    const task = this.tasks.get(id);
    if (task) {
      this.tasks.set(id, { ...task, ...updates, updatedAt: new Date() });
    }
  }
}

export const taskManager = new TaskManager();
