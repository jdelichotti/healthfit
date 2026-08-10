import { NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { estimateFoodFromDescription } from "@/lib/claude";

export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const foodName = body?.food_name;
  const weightG = typeof body?.weight_g === "number" ? body.weight_g : undefined;

  if (typeof foodName !== "string" || foodName.trim().length === 0) {
    return NextResponse.json({ error: "Falta la descripción" }, { status: 400 });
  }

  try {
    const analysis = await estimateFoodFromDescription(foodName, weightG);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("estimateFoodFromDescription failed", error);
    return NextResponse.json({ error: "No se pudo estimar" }, { status: 502 });
  }
}
