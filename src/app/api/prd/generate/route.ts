import { NextResponse } from "next/server";
import { prdGenerator } from "@/lib/prd/generator";

export async function POST(request: Request) {
  try {
    const { description, answers } = await request.json();

    if (!description || !answers) {
      return NextResponse.json(
        { error: "Description and answers are required" },
        { status: 400 },
      );
    }

    const prd = await prdGenerator.generate(description, answers);

    return NextResponse.json({ prd });
  } catch (error) {
    console.error("Failed to generate PRD:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
