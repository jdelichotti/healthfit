import { put } from "@vercel/blob";

export async function uploadMealPhoto(
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const extension = contentType.split("/")[1] ?? "jpg";
  const { url } = await put(`meals/${Date.now()}.${extension}`, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });
  return url;
}
