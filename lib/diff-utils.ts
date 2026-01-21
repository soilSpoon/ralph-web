export interface ParsedDiffFile {
  key: string;
  oldPath: string;
  newPath: string;
  diffText: string;
  additions: number;
  deletions: number;
}

export const splitUnifiedDiffByFile = (diffText: string): ParsedDiffFile[] => {
  const normalized = diffText.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  const blocks: string[] = [];
  let current: string[] = [];

  const pushCurrent = () => {
    const text = current.join("\n").trim();
    if (
      text &&
      (text.startsWith("diff --git ") ||
        text.startsWith("--- ") ||
        text.startsWith("+++ ") ||
        text.startsWith("Binary files ") ||
        text.includes("\n+++ ") ||
        text.includes("\nBinary files "))
    ) {
      blocks.push(text);
    }
    current = [];
  };

  for (const line of lines) {
    if (line.startsWith("diff --git ") && current.length > 0) {
      pushCurrent();
    }
    current.push(line);
  }
  pushCurrent();

  return blocks.map((blockText, index) => {
    const blockLines = blockText.split("\n");
    let oldPath = "";
    let newPath = "";
    let additions = 0;
    let deletions = 0;

    for (const line of blockLines) {
      if (line.startsWith("--- ")) {
        const raw = line.slice(4).trim();
        oldPath = raw.startsWith("a/") ? raw.slice(2) : raw;
      }
      if (line.startsWith("+++ ")) {
        const raw = line.slice(4).trim();
        newPath = raw.startsWith("b/") ? raw.slice(2) : raw;
      }
      if (line.startsWith("+") && !line.startsWith("+++ ")) {
        additions += 1;
      } else if (line.startsWith("-") && !line.startsWith("--- ")) {
        deletions += 1;
      }
    }

    const key = oldPath || newPath ? `${oldPath}->${newPath}` : `file-${index}`;

    return {
      key,
      oldPath,
      newPath,
      diffText: blockText,
      additions,
      deletions,
    };
  });
};
