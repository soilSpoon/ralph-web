import type { Meta, StoryObj } from "@storybook/react";
import { TerminalView } from "./terminal-view";

const meta: Meta<typeof TerminalView> = {
  title: "Orchestrator/TerminalView",
  component: TerminalView,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TerminalView>;

export const Default: Story = {
  args: {
    sessionId: "mock-session-id",
  },
};

export const Large: Story = {
  args: {
    sessionId: "mock-session-id",
  },
  decorators: [
    (Story) => (
      <div style={{ width: "800px", height: "600px" }}>
        <Story />
      </div>
    ),
  ],
};
