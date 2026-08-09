import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { meals } from "@/db/schema";
import { requireSession } from "@/lib/require-session";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/meals/[id]">
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const [row] = await db
    .select()
    .from(meals)
    .where(eq(meals.id, Number(id)));

  if (!row) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ meal: row });
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/meals/[id]">
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const updates: Partial<typeof meals.$inferInsert> = {};
  if (typeof body.food_name === "string") updates.foodName = body.food_name;
  if (typeof body.calories === "number") updates.calories = body.calories;
  if (typeof body.protein_g === "string" || body.protein_g === null)
    updates.proteinG = body.protein_g;
  if (typeof body.carbs_g === "string" || body.carbs_g === null)
    updates.carbsG = body.carbs_g;
  if (typeof body.fat_g === "string" || body.fat_g === null)
    updates.fatG = body.fat_g;
  if (typeof body.notes === "string" || body.notes === null)
    updates.notes = body.notes;
  if (typeof body.eaten_at === "string")
    updates.eatenAt = new Date(body.eaten_at);

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  const [row] = await db
    .update(meals)
    .set(updates)
    .where(eq(meals.id, Number(id)))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  return NextResponse.json({ meal: row });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/meals/[id]">
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  await db.delete(meals).where(eq(meals.id, Number(id)));
  return NextResponse.json({ ok: true });
}
