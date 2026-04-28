import { NextResponse } from "next/server";
import { getPrediction } from "@/lib/ai";

export async function POST() {
  try {
    const result = await getPrediction();

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Prediction failed",
      },
      { status: 500 }
    );
  }
}