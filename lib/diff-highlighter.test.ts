import { describe, expect, it } from "vitest";
import { getDiffHighlighter } from "./diff-highlighter";

describe("DiffHighlighter", () => {
  it("should initialize highlighter and get AST", async () => {
    const highlighter = await getDiffHighlighter();
    expect(highlighter.name).toBe("shiki-custom");

    const rawCode = "const x = 1;";
    const ast = highlighter.getAST(rawCode, "test.ts", "typescript");

    expect(ast.type).toBe("root");
    expect(ast.children.length).toBeGreaterThan(0);
  });

  it("should process AST correctly", async () => {
    const highlighter = await getDiffHighlighter();
    const rawCode = "line1\nline2";
    const ast = highlighter.getAST(rawCode, "test.txt", "plaintext");

    const { syntaxFileObject, syntaxFileLineNumber } =
      highlighter.processAST(ast);

    expect(syntaxFileLineNumber).toBe(2);
    expect(syntaxFileObject[1]).toBeDefined();
    expect(syntaxFileObject[2]).toBeDefined();
    expect(syntaxFileObject[1].value).toContain("line1");
    expect(syntaxFileObject[2].value).toContain("line2");
  });

  it("should handle unknown languages gracefully", async () => {
    const highlighter = await getDiffHighlighter();
    const rawCode = "some code";
    // Shiki fallback to plaintext for unknown langs usually,
    // but our getAST has a try-catch returning empty root on error
    const ast = highlighter.getAST(rawCode, "test.unknown", "unknown-lang");

    expect(ast.type).toBe("root");
  });
});
