import { create } from "zustand";
import { Task, ActivityItem } from "@/lib/types";

interface AppState {
  tasks: Task[];
  currentTask: Task | undefined;
  sidebarOpen: boolean;
  activityLog: ActivityItem[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  setCurrentTask: (task: Task | undefined) => void;
  toggleSidebar: () => void;
  addActivity: (activity: ActivityItem) => void;
}

export const useAppStore = create<AppState>((set) => ({
  tasks: [],
  currentTask: undefined,
  sidebarOpen: true,
  activityLog: [],

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  setCurrentTask: (task) => set({ currentTask: task }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  addActivity: (activity) =>
    set((state) => ({ activityLog: [activity, ...state.activityLog] })),
}));
