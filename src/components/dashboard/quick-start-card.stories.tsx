import type { Meta, StoryObj } from "@storybook/react";
import { QuickStartCard } from "./quick-start-card";

const meta: Meta<typeof QuickStartCard> = {
  title: "Dashboard/QuickStartCard",
  component: QuickStartCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof QuickStartCard>;

export const Default: Story = {};
