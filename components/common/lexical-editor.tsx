"use client";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";

const theme = {
  // Add styling here
  paragraph: "mb-2",
  text: {
    bold: "font-bold",
    italic: "italic",
    strikethrough: "line-through",
    underline: "underline",
  },
  list: {
    ul: "list-disc ml-4",
    ol: "list-decimal ml-4",
    listitem: "mb-1",
  },
  heading: {
    h1: "text-2xl font-bold mb-4",
    h2: "text-xl font-bold mb-3",
    h3: "text-lg font-bold mb-2",
  },
  code: "bg-muted p-1 rounded font-mono text-sm",
  quote: "border-l-4 border-primary pl-4 italic",
};

function onError(error: Error) {
  console.error(error);
}

interface LexicalEditorProps {
  initialConfig?: Partial<InitialConfigType>;
  placeholder?: string;
  readonly?: boolean;
}

export function LexicalEditor({
  initialConfig,
  placeholder = "무엇을 만들고 싶으신가요?",
  readonly = false,
}: LexicalEditorProps) {
  const config: InitialConfigType = {
    namespace: "RalphEditor",
    theme,
    onError,
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      LinkNode,
      AutoLinkNode,
    ],
    editable: !readonly,
    ...initialConfig,
  };

  return (
    <LexicalComposer initialConfig={config}>
      <div className="relative border rounded-lg bg-background p-4 min-h-[150px]">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="outline-none min-h-[150px]" />
          }
          placeholder={
            <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <CheckListPlugin />
        <TablePlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      </div>
    </LexicalComposer>
  );
}
