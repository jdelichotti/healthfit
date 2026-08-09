import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { weightLogs } from "@/db/schema";
import { WeightForm } from "@/components/weight-form";
import { WeightChart } from "@/components/weight-chart";
import { WeightList } from "@/components/weight-list";

export const dynamic = "force-dynamic";

export default async function WeightPage() {
  const rows = await db
    .select()
    .from(weightLogs)
    .orderBy(asc(weightLogs.loggedAt));

  const chartData = rows.map((row) => ({
    date: row.loggedAt,
    weightKg: Number(row.weightKg),
  }));

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold">Peso</h1>
      <WeightForm />
      <WeightChart data={chartData} />
      <WeightList
        rows={[...rows]
          .sort((a, b) => (a.loggedAt < b.loggedAt ? 1 : -1))
          .map((row) => ({
            id: row.id,
            loggedAt: row.loggedAt,
            weightKg: row.weightKg,
          }))}
      />
    </div>
  );
}
