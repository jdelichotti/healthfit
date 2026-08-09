import { desc } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { meals } from "@/db/schema";
import { dayKey, formatDayLabel, formatTime } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function MealsPage() {
  const rows = await db.select().from(meals).orderBy(desc(meals.eatenAt));

  const groups = new Map<string, typeof rows>();
  for (const meal of rows) {
    const key = dayKey(meal.eatenAt);
    const group = groups.get(key) ?? [];
    group.push(meal);
    groups.set(key, group);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Comidas</h1>
        <Link
          href="/log"
          className="rounded bg-black px-3 py-1.5 text-sm text-white dark:bg-white dark:text-black"
        >
          + Nueva
        </Link>
      </div>

      {rows.length === 0 && (
        <p className="text-sm text-zinc-500">
          Todavía no registraste ninguna comida.
        </p>
      )}

      {[...groups.entries()].map(([key, dayMeals]) => {
        const totalCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);
        return (
          <section key={key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-medium capitalize text-zinc-700 dark:text-zinc-300">
                {formatDayLabel(key)}
              </h2>
              <span className="text-xs text-zinc-500">{totalCalories} kcal</span>
            </div>
            <ul className="flex flex-col gap-2">
              {dayMeals.map((meal) => (
                <li key={meal.id}>
                  <Link
                    href={`/meals/${meal.id}`}
                    className="flex items-center gap-3 rounded border border-zinc-200 p-2 dark:border-zinc-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={meal.photoUrl}
                      alt={meal.foodName}
                      className="h-14 w-14 rounded object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">{meal.foodName}</span>
                      <span className="text-xs text-zinc-500">
                        {formatTime(meal.eatenAt)} · {meal.calories} kcal
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
