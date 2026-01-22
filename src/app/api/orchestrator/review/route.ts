import { NextResponse } from "next/server";
import { sessionManager } from "@/lib/orchestrator/session-manager";
import { reviewManager } from "@/lib/review/manager";

export async function POST(request: Request) {
  try {
    const { sessionId, type, decision } = await request.json();

    if (!sessionId || !type || !decision) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    reviewManager.submitReview(session.getId(), type, decision);
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
