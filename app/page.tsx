import { asc } from "drizzle-orm";
import { db } from "@/db";
import { meals, garminDailyMetrics, weightLogs } from "@/db/schema";
import { APP_TIME_ZONE, dayKey, lastNDayKeys } from "@/lib/time";
import { CaloriesChart } from "@/components/calories-chart";
import { WeightChart } from "@/components/weight-chart";

export const dynamic = "force-dynamic";

const CHART_DAYS = 30;

export default async function Home() {
  const dayKeys = lastNDayKeys(CHART_DAYS);
  const earliestKey = dayKeys[0];

  const [mealRows, garminRows, weightRows] = await Promise.all([
    db.select().from(meals),
    db.select().from(garminDailyMetrics),
    db.select().from(weightLogs).orderBy(asc(weightLogs.loggedAt)),
  ]);

  const consumedByDay = new Map<string, number>();
  for (const meal of mealRows) {
    const key = dayKey(meal.eatenAt);
    if (key < earliestKey) continue;
    consumedByDay.set(key, (consumedByDay.get(key) ?? 0) + meal.calories);
  }

  const burnedByDay = new Map<string, number>();
  let lastSync: Date | null = null;
  for (const row of garminRows) {
    if (row.activeCalories != null) burnedByDay.set(row.date, row.activeCalories);
    if (!lastSync || row.syncedAt > lastSync) lastSync = row.syncedAt;
  }

  const caloriesData = dayKeys.map((key) => ({
    date: key.slice(5),
    consumed: consumedByDay.get(key) ?? 0,
    burned: burnedByDay.get(key) ?? 0,
  }));

  const weightData = weightRows.map((row) => ({
    date: row.loggedAt,
    weightKg: Number(row.weightKg),
  }));

  const todayKey = dayKey(new Date());
  const todayCalories = consumedByDay.get(todayKey) ?? 0;
  const currentWeight =
    weightData.length > 0 ? weightData[weightData.length - 1].weightKg : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold">HealthFit</h1>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">Hoy</p>
          <p className="text-lg font-semibold">{todayCalories} kcal</p>
        </div>
        <div className="rounded border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs text-zinc-500">Peso actual</p>
          <p className="text-lg font-semibold">
            {currentWeight !== null ? `${currentWeight} kg` : "—"}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Calorías: consumidas vs. quemadas ({CHART_DAYS} días)
        </h2>
        <CaloriesChart data={caloriesData} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Peso
        </h2>
        <WeightChart data={weightData} />
      </section>

      {lastSync && (
        <p className="text-xs text-zinc-400">
          Último sync de Garmin:{" "}
          {new Intl.DateTimeFormat("es-AR", {
            timeZone: APP_TIME_ZONE,
            dateStyle: "short",
            timeStyle: "short",
          }).format(lastSync)}
        </p>
      )}
    </div>
  );
}
