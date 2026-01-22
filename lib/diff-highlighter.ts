import { type Properties, type Root, type RootContent } from "hast";
import { createHighlighter, type Highlighter } from "shiki";

type SyntaxNodeType = "text" | "element" | "root";

interface SyntaxNode {
  type: SyntaxNodeType;
  tagName?: string;
  properties?: Properties;
  value: string;
  lineNumber: number;
  valueLength: number;
  startIndex: number;
  endIndex: number;
  children?: SyntaxNode[];
}

interface SyntaxLine {
  value: string;
  lineNumber: number;
  valueLength: number;
  nodeList: { node: SyntaxNode; wrapper?: SyntaxNode }[];
}

export type SyntaxFileMap = Record<number, SyntaxLine>;

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
    syntaxFileObject: SyntaxFileMap;
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
  syntaxFileObject: SyntaxFileMap;
  syntaxFileLineNumber: number;
} {
  let lineNumber = 1;
  const syntaxObj: SyntaxFileMap = {};

  const loopAST = (nodes: RootContent[], wrapper?: SyntaxNode) => {
    for (const node of nodes) {
      if (node.type === "text") {
        const textValue = node.value;
        const textNode: SyntaxNode = {
          type: "text",
          value: textValue,
          lineNumber: lineNumber,
          valueLength: textValue.length,
          startIndex: 0,
          endIndex: 0,
          children: [],
        };

        if (!textValue.includes("\n")) {
          const valueLength = textValue.length;
          if (!syntaxObj[lineNumber]) {
            textNode.startIndex = 0;
            textNode.endIndex = valueLength - 1;
            syntaxObj[lineNumber] = {
              value: textValue,
              lineNumber: lineNumber,
              valueLength: valueLength,
              nodeList: [{ node: textNode, wrapper }],
            };
          } else {
            textNode.startIndex = syntaxObj[lineNumber].valueLength;
            textNode.endIndex = textNode.startIndex + valueLength - 1;
            syntaxObj[lineNumber].value += textValue;
            syntaxObj[lineNumber].valueLength += valueLength;
            syntaxObj[lineNumber].nodeList.push({ node: textNode, wrapper });
          }
          continue;
        }

        const lines = textValue.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const _value = i === lines.length - 1 ? lines[i] : `${lines[i]}\n`;
          const _lineNumber = i === 0 ? lineNumber : ++lineNumber;
          const _valueLength = _value.length;
          const _node: SyntaxNode = {
            type: "text",
            value: _value,
            lineNumber: _lineNumber,
            valueLength: _valueLength,
            startIndex: 0,
            endIndex: 0,
            children: [],
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
          textNode.children?.push(_node);
        }
        continue;
      }

      if (node.type === "element") {
        const elementNode: SyntaxNode = {
          type: node.type,
          tagName: node.tagName,
          properties: node.properties,
          value: "",
          lineNumber: lineNumber,
          valueLength: 0,
          startIndex: 0,
          endIndex: 0,
          children: [],
        };
        loopAST(node.children, elementNode);
      }
    }
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
        const hast = shiki.codeToHast(raw, {
          lang: lang || "plaintext",
          theme: shikiTheme,
          defaultColor: false,
          mergeWhitespaces: false,
        });
        return hast;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("Diff highlighter error:", errorMessage);
        return { type: "root", children: [] };
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
