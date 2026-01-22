import { create } from "zustand";
import type { Task } from "./types";

// App Store for global UI state
interface AppStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  currentTask: Task | null;
  setCurrentTask: (task: Task | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  currentTask: null,
  setCurrentTask: (task) => set({ currentTask: task }),
}));
