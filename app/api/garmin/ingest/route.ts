import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { garminDailyMetrics } from "@/db/schema";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.GARMIN_INGEST_SECRET;

  if (!expected || authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.date !== "string") {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const [row] = await db
    .insert(garminDailyMetrics)
    .values({
      date: body.date,
      steps: typeof body.steps === "number" ? body.steps : null,
      activeCalories:
        typeof body.active_calories === "number" ? body.active_calories : null,
      restingHeartRate:
        typeof body.resting_heart_rate === "number"
          ? body.resting_heart_rate
          : null,
      avgHeartRate:
        typeof body.avg_heart_rate === "number" ? body.avg_heart_rate : null,
      sleepMinutes:
        typeof body.sleep_minutes === "number" ? body.sleep_minutes : null,
      rawPayload: body.raw_payload ?? null,
      syncedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: garminDailyMetrics.date,
      set: {
        steps: sql`excluded.steps`,
        activeCalories: sql`excluded.active_calories`,
        restingHeartRate: sql`excluded.resting_heart_rate`,
        avgHeartRate: sql`excluded.avg_heart_rate`,
        sleepMinutes: sql`excluded.sleep_minutes`,
        rawPayload: sql`excluded.raw_payload`,
        syncedAt: sql`excluded.synced_at`,
      },
    })
    .returning();

  return NextResponse.json({ garminDailyMetric: row }, { status: 201 });
}
