import { NextResponse } from "next/server";
import { DEFAULT_PROVIDER_ID } from "@/lib/orchestrator/providers";
import { sessionManager } from "@/lib/orchestrator/session-manager";

export async function POST(request: Request) {
  try {
    const { taskId, providerId } = await request.json();

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 },
      );
    }

    const provider = providerId || DEFAULT_PROVIDER_ID;

    const session = sessionManager.createSession({
      taskId,
      providerId: provider,
      maxIterations: 5,
      metadataPath: `./.ralph/tasks/${taskId}/metadata`,
      worktreePath: `./.ralph/tasks/${taskId}/worktree`,
    });

    await session.initialize();

    return NextResponse.json({
      sessionId: session.getId(),
      phase: session.getPhase(),
    });
  } catch (error) {
    console.error("Failed to start session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
