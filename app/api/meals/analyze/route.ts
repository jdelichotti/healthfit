import { NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { analyzeFoodPhoto } from "@/lib/claude";

const SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const photo = formData.get("photo");

  if (!(photo instanceof File)) {
    return NextResponse.json({ error: "Falta la foto" }, { status: 400 });
  }

  if (!SUPPORTED_TYPES.includes(photo.type as (typeof SUPPORTED_TYPES)[number])) {
    return NextResponse.json(
      { error: "Formato de imagen no soportado" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await photo.arrayBuffer());
  const base64 = buffer.toString("base64");

  try {
    const analysis = await analyzeFoodPhoto(
      base64,
      photo.type as (typeof SUPPORTED_TYPES)[number]
    );
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("analyzeFoodPhoto failed", error);
    return NextResponse.json(
      { error: "No se pudo analizar la foto" },
      { status: 502 }
    );
  }
}
