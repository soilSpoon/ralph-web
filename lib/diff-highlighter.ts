import { createHighlighter, Highlighter } from "shiki";
import { type Root } from "hast";

export interface DiffHighlighter {
  name: string;
  type: "class" | "style";
  maxLineToIgnoreSyntax: number;
  setMaxLineToIgnoreSyntax: (v: number) => void;
  ignoreSyntaxHighlightList: (string | RegExp)[];
  setIgnoreSyntaxHighlightList: (v: (string | RegExp)[]) => void;
  getAST: (
    raw: string,
    fileName?: string,
    lang?: string,
    theme?: "light" | "dark",
  ) => Root;
  processAST: (ast: Root) => {
    syntaxFileObject: Record<number, any>;
    syntaxFileLineNumber: number;
  };
  hasRegisteredCurrentLang: (lang: string) => boolean;
  getHighlighterEngine: () => Highlighter | null;
}

let highlighterPromise: Promise<Highlighter> | null = null;

async function getShikiHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "typescript",
        "javascript",
        "tsx",
        "jsx",
        "html",
        "css",
        "json",
        "python",
        "markdown",
        "rust",
        "go",
        "bash",
      ],
    });
  }
  return highlighterPromise;
}

function processAST(ast: Root): {
  syntaxFileObject: Record<number, any>;
  syntaxFileLineNumber: number;
} {
  let lineNumber = 1;
  const syntaxObj: Record<number, any> = {};

  const loopAST = (nodes: any[], wrapper?: any) => {
    nodes.forEach((node) => {
      if (node.type === "text") {
        if (node.value.indexOf("\n") === -1) {
          const valueLength = node.value.length;
          if (!syntaxObj[lineNumber]) {
            node.startIndex = 0;
            node.endIndex = valueLength - 1;
            syntaxObj[lineNumber] = {
              value: node.value,
              lineNumber,
              valueLength,
              nodeList: [{ node, wrapper }],
            };
          } else {
            node.startIndex = syntaxObj[lineNumber].valueLength;
            node.endIndex = node.startIndex + valueLength - 1;
            syntaxObj[lineNumber].value += node.value;
            syntaxObj[lineNumber].valueLength += valueLength;
            syntaxObj[lineNumber].nodeList.push({ node, wrapper });
          }
          node.lineNumber = lineNumber;
          return;
        }
        const lines = node.value.split("\n");
        node.children = node.children || [];
        for (let i = 0; i < lines.length; i++) {
          const _value = i === lines.length - 1 ? lines[i] : lines[i] + "\n";
          const _lineNumber = i === 0 ? lineNumber : ++lineNumber;
          const _valueLength = _value.length;
          const _node: any = {
            type: "text",
            value: _value,
            startIndex: Infinity,
            endIndex: Infinity,
            lineNumber: _lineNumber,
          };
          if (!syntaxObj[_lineNumber]) {
            _node.startIndex = 0;
            _node.endIndex = _valueLength - 1;
            syntaxObj[_lineNumber] = {
              value: _value,
              lineNumber: _lineNumber,
              valueLength: _valueLength,
              nodeList: [{ node: _node, wrapper }],
            };
          } else {
            _node.startIndex = syntaxObj[_lineNumber].valueLength;
            _node.endIndex = _node.startIndex + _valueLength - 1;
            syntaxObj[_lineNumber].value += _value;
            syntaxObj[_lineNumber].valueLength += _valueLength;
            syntaxObj[_lineNumber].nodeList.push({ node: _node, wrapper });
          }
          node.children.push(_node);
        }
        node.lineNumber = lineNumber;
        return;
      }
      if (node.children) {
        loopAST(node.children, node);
        node.lineNumber = lineNumber;
      }
    });
  };

  loopAST(ast.children);
  return { syntaxFileObject: syntaxObj, syntaxFileLineNumber: lineNumber };
}

let cachedDiffHighlighter: DiffHighlighter | null = null;

export async function getDiffHighlighter(): Promise<DiffHighlighter> {
  if (cachedDiffHighlighter) return cachedDiffHighlighter;

  const shiki = await getShikiHighlighter();

  cachedDiffHighlighter = {
    name: "shiki-custom",
    type: "class",
    maxLineToIgnoreSyntax: 10000,
    setMaxLineToIgnoreSyntax(v) {
      this.maxLineToIgnoreSyntax = v;
    },
    ignoreSyntaxHighlightList: [],
    setIgnoreSyntaxHighlightList(v) {
      this.ignoreSyntaxHighlightList = v;
    },
    getAST(raw, _fileName, lang, theme) {
      try {
        const shikiTheme = theme === "dark" ? "github-dark" : "github-light";
        return shiki.codeToHast(raw, {
          lang: lang || "plaintext",
          theme: shikiTheme,
          defaultColor: false,
          mergeWhitespaces: false,
        }) as Root;
      } catch (e) {
        console.error("Diff highlighter error:", e);
        return {} as Root;
      }
    },
    processAST,
    hasRegisteredCurrentLang(lang) {
      return shiki.getLoadedLanguages().includes(lang);
    },
    getHighlighterEngine() {
      return shiki;
    },
  };

  return cachedDiffHighlighter;
}
