import { NextResponse } from "next/server";
import { sessionManager } from "@/lib/orchestrator/session-manager";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // TODO: Implement actual stop logic (kill PTY, etc.)
    // session.stop();

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
