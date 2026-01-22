import type { Meta, StoryObj } from "@storybook/react";
import { ProviderSettings } from "@/components/settings/provider-settings";

const meta: Meta<typeof ProviderSettings> = {
  title: "Settings/ProviderSettings",
  component: ProviderSettings,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProviderSettings>;

export const Default: Story = {};
