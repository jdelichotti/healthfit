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
  photo: File;
  previewUrl: string;
  analysis: FoodAnalysis;
  onSaved: () => void;
}) {
  const [foodName, setFoodName] = useState(analysis.food_name);
  const [calories, setCalories] = useState(String(analysis.estimated_calories));
  const [proteinG, setProteinG] = useState(String(analysis.protein_g));
  const [carbsG, setCarbsG] = useState(String(analysis.carbs_g));
  const [fatG, setFatG] = useState(String(analysis.fat_g));
  const [eatenAt, setEatenAt] = useState(toLocalDateTimeInputValue(new Date()));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set("photo", photo);
    formData.set("eaten_at", new Date(eatenAt).toISOString());
    formData.set("food_name", foodName);
    formData.set("calories", calories);
    formData.set("protein_g", proteinG);
    formData.set("carbs_g", carbsG);
    formData.set("fat_g", fatG);
    formData.set("notes", notes);
    formData.set("ai_suggestion", JSON.stringify(analysis));

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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt="Foto de la comida"
        className="w-full rounded-lg object-cover"
      />

      <label className="flex flex-col gap-1 text-sm">
        Comida
        <input
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

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

      <p className="text-xs text-zinc-500">
        Confianza de la IA: {analysis.confidence}. Revisá y corregí antes de
        guardar.
      </p>

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
