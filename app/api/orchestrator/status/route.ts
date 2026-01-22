import { NextResponse } from "next/server";
import { sessionManager } from "@/lib/orchestrator/session-manager";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  const session = sessionManager.getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({
    phase: session.getPhase(),
    id: session.getId(),
  });
}
