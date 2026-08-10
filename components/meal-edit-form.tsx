"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toLocalDateTimeInputValue } from "@/lib/time";
import type { FoodAnalysis } from "@/lib/claude";

export function MealEditForm({
  meal,
}: {
  meal: {
    id: number;
    eatenAt: string;
    photoUrl: string | null;
    foodName: string;
    calories: number;
    weightG: string | null;
    proteinG: string | null;
    carbsG: string | null;
    fatG: string | null;
    notes: string | null;
  };
}) {
  const [foodName, setFoodName] = useState(meal.foodName);
  const [calories, setCalories] = useState(String(meal.calories));
  const [weightG, setWeightG] = useState(meal.weightG ?? "");
  const [proteinG, setProteinG] = useState(meal.proteinG ?? "");
  const [carbsG, setCarbsG] = useState(meal.carbsG ?? "");
  const [fatG, setFatG] = useState(meal.fatG ?? "");
  const [eatenAt, setEatenAt] = useState(
    toLocalDateTimeInputValue(new Date(meal.eatenAt))
  );
  const [notes, setNotes] = useState(meal.notes ?? "");
  const [recalculating, setRecalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRecalculate() {
    if (!foodName.trim()) return;
    setRecalculating(true);
    setError(null);

    const res = await fetch("/api/meals/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        food_name: foodName,
        weight_g: weightG ? Number(weightG) : undefined,
      }),
    });

    setRecalculating(false);

    if (!res.ok) {
      setError("No se pudo recalcular");
      return;
    }

    const { analysis } = (await res.json()) as { analysis: FoodAnalysis };
    setCalories(String(analysis.estimated_calories));
    setProteinG(String(analysis.protein_g));
    setCarbsG(String(analysis.carbs_g));
    setFatG(String(analysis.fat_g));
    setWeightG(String(analysis.weight_g));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/meals/${meal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        food_name: foodName,
        calories: Number.parseInt(calories, 10) || 0,
        weight_g: weightG || null,
        protein_g: proteinG || null,
        carbs_g: carbsG || null,
        fat_g: fatG || null,
        notes: notes || null,
        eaten_at: new Date(eatenAt).toISOString(),
      }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("No se pudo guardar los cambios");
      return;
    }

    router.push("/meals");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta comida?")) return;
    setDeleting(true);
    const res = await fetch(`/api/meals/${meal.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      setError("No se pudo eliminar");
      return;
    }

    router.push("/meals");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {meal.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={meal.photoUrl}
          alt={meal.foodName}
          className="w-full rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-zinc-300 text-sm text-zinc-400 dark:border-zinc-700">
          Sin foto
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Comida
        <input
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          required
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <div className="flex items-end gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Peso estimado (g)
          <input
            type="number"
            value={weightG}
            onChange={(e) => setWeightG(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button
          type="button"
          onClick={handleRecalculate}
          disabled={recalculating || !foodName.trim()}
          className="rounded border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
        >
          {recalculating ? "Recalculando..." : "Recalcular con IA"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Calorías
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Hora
          <input
            type="datetime-local"
            value={eatenAt}
            onChange={(e) => setEatenAt(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Proteína (g)
          <input
            type="number"
            value={proteinG}
            onChange={(e) => setProteinG(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Carbos (g)
          <input
            type="number"
            value={carbsG}
            onChange={(e) => setCarbsG(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Grasas (g)
          <input
            type="number"
            value={fatG}
            onChange={(e) => setFatG(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Notas (opcional)
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded bg-black px-3 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded border border-red-300 px-3 py-2 text-red-600 disabled:opacity-50 dark:border-red-900"
        >
          {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </form>
  );
}
