import type { Meta, StoryObj } from "@storybook/react";
import { splitUnifiedDiffByFile } from "@/lib/diff-utils";
import { mockDiff } from "@/lib/mock-data";
import { DiffViewer } from "./diff-viewer";

const diffFiles = splitUnifiedDiffByFile(mockDiff);

const meta: Meta<typeof DiffViewer> = {
  title: "Review/DiffViewer",
  component: DiffViewer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DiffViewer>;

export const Default: Story = {
  args: {
    diffFile: diffFiles[0],
  },
};

export const MultipleFiles: Story = {
  args: {
    diffFile: diffFiles[1] || diffFiles[0],
  },
};
