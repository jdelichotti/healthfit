"use client";

import { useState, type FormEvent } from "react";
import type { FoodAnalysis } from "@/lib/claude";
import { toLocalDateTimeInputValue } from "@/lib/time";

export function MealConfirmForm({
  photo,
  previewUrl,
  analysis,
  onSaved,
}: {
  photo: File | null;
  previewUrl: string | null;
  analysis: FoodAnalysis | null;
  onSaved: () => void;
}) {
  const [foodName, setFoodName] = useState(analysis?.food_name ?? "");
  const [weightG, setWeightG] = useState(analysis ? String(analysis.weight_g) : "");
  const [calories, setCalories] = useState(
    analysis ? String(analysis.estimated_calories) : ""
  );
  const [proteinG, setProteinG] = useState(analysis ? String(analysis.protein_g) : "");
  const [carbsG, setCarbsG] = useState(analysis ? String(analysis.carbs_g) : "");
  const [fatG, setFatG] = useState(analysis ? String(analysis.fat_g) : "");
  const [eatenAt, setEatenAt] = useState(toLocalDateTimeInputValue(new Date()));
  const [notes, setNotes] = useState("");
  const [lastAnalysis, setLastAnalysis] = useState<FoodAnalysis | null>(analysis);
  const [recalculating, setRecalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const { analysis: newAnalysis } = (await res.json()) as {
      analysis: FoodAnalysis;
    };
    setCalories(String(newAnalysis.estimated_calories));
    setProteinG(String(newAnalysis.protein_g));
    setCarbsG(String(newAnalysis.carbs_g));
    setFatG(String(newAnalysis.fat_g));
    setWeightG(String(newAnalysis.weight_g));
    setLastAnalysis(newAnalysis);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData();
    if (photo) formData.set("photo", photo);
    formData.set("eaten_at", new Date(eatenAt).toISOString());
    formData.set("food_name", foodName);
    formData.set("calories", calories || "0");
    formData.set("weight_g", weightG);
    formData.set("protein_g", proteinG);
    formData.set("carbs_g", carbsG);
    formData.set("fat_g", fatG);
    formData.set("notes", notes);
    if (lastAnalysis) formData.set("ai_suggestion", JSON.stringify(lastAnalysis));

    const res = await fetch("/api/meals", { method: "POST", body: formData });
    setSaving(false);

    if (!res.ok) {
      setError("No se pudo guardar la comida");
      return;
    }

    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Foto de la comida"
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
          placeholder="Ej: Milanesa con puré de papas"
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

      {lastAnalysis && (
        <p className="text-xs text-zinc-500">
          Confianza de la IA: {lastAnalysis.confidence}. Revisá y corregí antes
          de guardar.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {saving ? "Guardando..." : "Guardar comida"}
      </button>
    </form>
  );
}
