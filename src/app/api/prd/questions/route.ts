import { NextResponse } from "next/server";
import { prdGenerator } from "@/lib/prd/generator";

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 },
      );
    }

    const questions = await prdGenerator.generateQuestions(description);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Failed to generate questions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
