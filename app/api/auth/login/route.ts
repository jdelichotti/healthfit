import { NextResponse } from "next/server";
import { createSessionToken, verifyPassword, SESSION_COOKIE } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos, probá de nuevo más tarde" },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = body?.password;
  const storedHash = process.env.APP_PASSWORD_HASH;

  if (
    !storedHash ||
    typeof password !== "string" ||
    !verifyPassword(password, storedHash)
  ) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}
