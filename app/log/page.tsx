"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import type { FoodAnalysis } from "@/lib/claude";
import { MealConfirmForm } from "@/components/meal-confirm-form";

type Stage =
  | { step: "idle" }
  | { step: "analyzing"; photo: File; previewUrl: string }
  | {
      step: "ready";
      photo: File | null;
      previewUrl: string | null;
      analysis: FoodAnalysis | null;
    }
  | { step: "error"; message: string };

export default function LogPage() {
  const [stage, setStage] = useState<Stage>({ step: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const compressed = await imageCompression(file, {
      maxWidthOrHeight: 1024,
      maxSizeMB: 0.4,
      useWebWorker: true,
      fileType: "image/jpeg",
    });

    const previewUrl = URL.createObjectURL(compressed);
    setStage({ step: "analyzing", photo: compressed, previewUrl });

    const formData = new FormData();
    formData.set("photo", compressed);

    const res = await fetch("/api/meals/analyze", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      setStage({ step: "error", message: "No se pudo analizar la foto" });
      return;
    }

    const { analysis } = (await res.json()) as { analysis: FoodAnalysis };
    setStage({ step: "ready", photo: compressed, previewUrl, analysis });
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Registrar comida</h1>

      {stage.step === "idle" && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded bg-black px-3 py-4 text-white dark:bg-white dark:text-black"
          >
            Sacar foto
          </button>
          <button
            type="button"
            onClick={() =>
              setStage({
                step: "ready",
                photo: null,
                previewUrl: null,
                analysis: null,
              })
            }
            className="rounded border border-zinc-300 px-3 py-4 dark:border-zinc-700"
          >
            Registrar sin foto
          </button>
        </div>
      )}

      {stage.step === "analyzing" && (
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stage.previewUrl}
            alt="Foto de la comida"
            className="w-full rounded-lg object-cover"
          />
          <p className="text-sm text-zinc-500">Analizando la foto...</p>
        </div>
      )}

      {stage.step === "ready" && (
        <MealConfirmForm
          photo={stage.photo}
          previewUrl={stage.previewUrl}
          analysis={stage.analysis}
          onSaved={() => router.push("/meals")}
        />
      )}

      {stage.step === "error" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-red-600">{stage.message}</p>
          <button
            type="button"
            onClick={() => setStage({ step: "idle" })}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
