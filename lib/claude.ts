import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import * as z from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const FoodAnalysisSchema = z.object({
  food_name: z
    .string()
    .describe(
      "Short, human-readable description of the meal in Spanish, e.g. 'Milanesa con puré de papas'"
    ),
  weight_g: z.number().describe("Estimated total weight of the portion, in grams"),
  estimated_calories: z.number().int(),
  protein_g: z.number(),
  carbs_g: z.number(),
  fat_g: z.number(),
  confidence: z.enum(["low", "medium", "high"]),
});

export type FoodAnalysis = z.infer<typeof FoodAnalysisSchema>;

export async function analyzeFoodPhoto(
  imageBase64: string,
  mediaType: "image/jpeg" | "image/png" | "image/webp"
): Promise<FoodAnalysis> {
  const message = await client.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    output_config: {
      format: zodOutputFormat(FoodAnalysisSchema),
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data: imageBase64 },
          },
          {
            type: "text",
            text: "Identificá la comida en esta foto, estimá su peso total en gramos, y estimá sus calorías y macronutrientes (proteínas, carbohidratos, grasas en gramos) para la porción completa visible. Sé realista respecto al tamaño de la porción.",
          },
        ],
      },
    ],
  });

  if (!message.parsed_output) {
    throw new Error("Claude no devolvió una respuesta estructurada válida");
  }

  return message.parsed_output;
}

export async function estimateFoodFromDescription(
  foodName: string,
  weightG?: number
): Promise<FoodAnalysis> {
  const weightInstruction = weightG
    ? `La porción pesa exactamente ${weightG} g — usá ese dato como fijo y estimá las calorías y macronutrientes en consecuencia.`
    : "Estimá también un peso típico de la porción en gramos.";

  const message = await client.messages.parse({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    output_config: {
      format: zodOutputFormat(FoodAnalysisSchema),
    },
    messages: [
      {
        role: "user",
        content: `Estimá las calorías y macronutrientes (proteínas, carbohidratos, grasas en gramos) de esta comida a partir de su descripción: "${foodName}". ${weightInstruction} Sé realista.`,
      },
    ],
  });

  if (!message.parsed_output) {
    throw new Error("Claude no devolvió una respuesta estructurada válida");
  }

  return message.parsed_output;
}
