import "../../../test/env";
import { afterEach, describe, expect, it, vi } from "bun:test";
import type { ParsedDiffFile } from "@/lib/diff-utils";
import { cleanup, fireEvent, render } from "../../../test/utils";
import { FileTree } from "./file-tree";

afterEach(() => {
  cleanup();
});

describe("FileTree", () => {
  const mockFiles: ParsedDiffFile[] = [
    {
      key: "file-1",
      oldPath: "src/old.ts",
      newPath: "src/new.ts",
      diffText: "...",
      additions: 10,
      deletions: 5,
    },
    {
      key: "file-2",
      oldPath: "/dev/null",
      newPath: "src/created.ts",
      diffText: "...",
      additions: 5,
      deletions: 0,
    },
  ];

  it("should render list of files", () => {
    const { getByText } = render(
      <FileTree files={mockFiles} selectedFileKey={null} onSelect={() => {}} />,
    );
    expect(getByText("src/new.ts")).toBeDefined();
    expect(getByText("src/created.ts")).toBeDefined();
  });

  it("should show addition/deletion stats", () => {
    const { getByText } = render(
      <FileTree files={mockFiles} selectedFileKey={null} onSelect={() => {}} />,
    );
    expect(getByText("+10")).toBeDefined();
    expect(getByText("-5")).toBeDefined();
    expect(getByText("+5")).toBeDefined();
  });

  it("should highlight selected file", () => {
    const { getByText } = render(
      <FileTree
        files={mockFiles}
        selectedFileKey="file-1"
        onSelect={() => {}}
      />,
    );
    // Usually checked by class, looking for bg-primary/5
    // We can query the button containing the text and check class
    const button = getByText("src/new.ts").closest("button");
    expect(button?.className).toContain("bg-primary/5");
  });

  it("should call onSelect when clicked", () => {
    const onSelect = vi.fn();
    const { getByText } = render(
      <FileTree files={mockFiles} selectedFileKey={null} onSelect={onSelect} />,
    );

    fireEvent.click(getByText("src/new.ts"));
    expect(onSelect).toHaveBeenCalledWith(mockFiles[0]);
  });
});
