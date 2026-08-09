"use client";

import { useRouter } from "next/navigation";

export function WeightList({
  rows,
}: {
  rows: { id: number; loggedAt: string; weightKg: string }[];
}) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este registro de peso?")) return;
    const res = await fetch(`/api/weight/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  if (rows.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex items-center justify-between rounded border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
        >
          <span>{row.loggedAt}</span>
          <span className="font-medium">{row.weightKg} kg</span>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="text-xs text-red-600"
          >
            Eliminar
          </button>
        </li>
      ))}
    </ul>
  );
}
