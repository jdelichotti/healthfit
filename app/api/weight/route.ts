import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { weightLogs } from "@/db/schema";
import { requireSession } from "@/lib/require-session";

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(weightLogs)
    .orderBy(desc(weightLogs.loggedAt));
  return NextResponse.json({ weightLogs: rows });
}

export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.weight_kg !== "number" ||
    typeof body.logged_at !== "string"
  ) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const [row] = await db
    .insert(weightLogs)
    .values({
      loggedAt: body.logged_at,
      weightKg: String(body.weight_kg),
      notes:
        typeof body.notes === "string" && body.notes.length > 0
          ? body.notes
          : null,
    })
    .returning();

  return NextResponse.json({ weightLog: row }, { status: 201 });
}
