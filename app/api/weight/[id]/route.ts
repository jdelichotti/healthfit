import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { weightLogs } from "@/db/schema";
import { requireSession } from "@/lib/require-session";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/weight/[id]">
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const updates: Partial<typeof weightLogs.$inferInsert> = {};
  if (typeof body.weight_kg === "number") updates.weightKg = String(body.weight_kg);
  if (typeof body.logged_at === "string") updates.loggedAt = body.logged_at;
  if (typeof body.notes === "string" || body.notes === null)
    updates.notes = body.notes;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
  }

  const [row] = await db
    .update(weightLogs)
    .set(updates)
    .where(eq(weightLogs.id, Number(id)))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  return NextResponse.json({ weightLog: row });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/weight/[id]">
) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await ctx.params;
  await db.delete(weightLogs).where(eq(weightLogs.id, Number(id)));
  return NextResponse.json({ ok: true });
}
