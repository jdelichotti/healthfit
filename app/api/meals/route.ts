import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { meals } from "@/db/schema";
import { requireSession } from "@/lib/require-session";
import { uploadMealPhoto } from "@/lib/storage";

export async function GET() {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rows = await db.select().from(meals).orderBy(desc(meals.eatenAt));
  return NextResponse.json({ meals: rows });
}

export async function POST(request: Request) {
  if (!(await requireSession())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const photo = formData.get("photo");
  const eatenAt = formData.get("eaten_at");
  const foodName = formData.get("food_name");
  const calories = formData.get("calories");
  const weightG = formData.get("weight_g");
  const proteinG = formData.get("protein_g");
  const carbsG = formData.get("carbs_g");
  const fatG = formData.get("fat_g");
  const notes = formData.get("notes");
  const aiSuggestion = formData.get("ai_suggestion");

  if (
    typeof eatenAt !== "string" ||
    typeof foodName !== "string" ||
    typeof calories !== "string"
  ) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  let photoUrl: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    const buffer = Buffer.from(await photo.arrayBuffer());
    photoUrl = await uploadMealPhoto(buffer, photo.type || "image/jpeg");
  }

  const [row] = await db
    .insert(meals)
    .values({
      eatenAt: new Date(eatenAt),
      photoUrl,
      foodName,
      calories: Number.parseInt(calories, 10) || 0,
      weightG: typeof weightG === "string" && weightG !== "" ? weightG : null,
      proteinG: typeof proteinG === "string" && proteinG !== "" ? proteinG : null,
      carbsG: typeof carbsG === "string" && carbsG !== "" ? carbsG : null,
      fatG: typeof fatG === "string" && fatG !== "" ? fatG : null,
      notes: typeof notes === "string" && notes.length > 0 ? notes : null,
      aiSuggestion:
        typeof aiSuggestion === "string" ? JSON.parse(aiSuggestion) : null,
    })
    .returning();

  return NextResponse.json({ meal: row }, { status: 201 });
}
