"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

interface TerminalViewProps {
  sessionId: string;
}

import { z } from "zod";

const SSEDataSchema = z.string();

export function TerminalView({ sessionId }: TerminalViewProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#0a0a0a",
        foreground: "#ffffff",
      },
      fontSize: 13,
      fontFamily: "var(--font-mono), monospace",
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;

    const eventSource = new EventSource(
      `/api/orchestrator/stream?sessionId=${sessionId}`,
    );

    eventSource.addEventListener("data", (event: MessageEvent) => {
      try {
        const rawData = typeof event.data === "string" ? event.data : "";
        const data = SSEDataSchema.parse(JSON.parse(rawData));
        term.write(data);
      } catch (err) {
        console.error("[TerminalView] Failed to parse data event:", err);
      }
    });

    eventSource.addEventListener("transition", (event: MessageEvent) => {
      try {
        const rawData = typeof event.data === "string" ? event.data : "";
        const phase = SSEDataSchema.parse(JSON.parse(rawData));
        term.write(
          `\r\n\x1b[33m--- Workflow Transition: ${phase} ---\x1b[0m\r\n`,
        );
      } catch (err) {
        console.error("[TerminalView] Failed to parse transition event:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      term.write("\r\n\x1b[31mConnection lost. Retrying...\x1b[0m\r\n");
    };

    const handleResize = () => fitAddon.fit();
    window.addEventListener("resize", handleResize);

    return () => {
      eventSource.close();
      term.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [sessionId]);

  return (
    <div className="w-full h-full min-h-[400px] bg-[#0a0a0a] rounded-lg overflow-hidden p-2">
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
}
