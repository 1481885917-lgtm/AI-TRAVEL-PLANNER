import { NextResponse } from "next/server";
import { createTravelPlan } from "@/lib/agents/planner-graph";
import { plannerInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = plannerInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "INVALID_INPUT",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  try {
    const plan = await createTravelPlan(parsed.data);
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json(
      {
        error: "PLAN_GENERATION_FAILED",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
