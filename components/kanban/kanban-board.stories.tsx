import type { Meta, StoryObj } from "@storybook/react";
import { mockTasks } from "@/lib/mock-data";
import { KanbanBoard } from "./kanban-board";

const meta: Meta<typeof KanbanBoard> = {
  title: "Kanban/KanbanBoard",
  component: KanbanBoard,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof KanbanBoard>;

export const Default: Story = {
  args: {
    tasks: mockTasks,
  },
};

export const Empty: Story = {
  args: {
    tasks: [],
  },
};
