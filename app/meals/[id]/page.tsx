import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { meals } from "@/db/schema";
import { MealEditForm } from "@/components/meal-edit-form";

export const dynamic = "force-dynamic";

export default async function MealDetailPage({
  params,
}: PageProps<"/meals/[id]">) {
  const { id } = await params;
  const [meal] = await db
    .select()
    .from(meals)
    .where(eq(meals.id, Number(id)));

  if (!meal) notFound();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Editar comida</h1>
      <MealEditForm
        meal={{
          id: meal.id,
          eatenAt: meal.eatenAt.toISOString(),
          photoUrl: meal.photoUrl,
          foodName: meal.foodName,
          calories: meal.calories,
          weightG: meal.weightG,
          proteinG: meal.proteinG,
          carbsG: meal.carbsG,
          fatG: meal.fatG,
          notes: meal.notes,
        }}
      />
    </div>
  );
}
