import { NextRequest } from "next/server";
import { sessionManager } from "@/lib/orchestrator/session-manager";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return new Response("sessionId is required", { status: 400 });
  }

  const loop = sessionManager.getSession(sessionId);

  if (!loop) {
    return new Response("Session not found", { status: 404 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const onData = (data: string) => {
        controller.enqueue(
          encoder.encode(`event: data\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      const onTransition = (phase: string) => {
        controller.enqueue(
          encoder.encode(
            `event: transition\ndata: ${JSON.stringify(phase)}\n\n`,
          ),
        );
      };

      loop.on("data", onData);
      loop.on("transition", onTransition);

      // Heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, 15000);

      request.signal.addEventListener("abort", () => {
        loop.off("data", onData);
        loop.off("transition", onTransition);
        clearInterval(heartbeat);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
