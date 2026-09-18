import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "admin_session";
export const BROWSER_ID_COOKIE = "browser_id";

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Missing ADMIN_PASSWORD");
  }
  return password;
}

export function createAdminToken(): string {
  return createHmac("sha256", getAdminPassword())
    .update("birthday-quiz-admin-session")
    .digest("hex");
}

export function isValidAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const expected = createAdminToken();
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function passwordsMatch(input: string, expected: string): boolean {
  const a = createHmac("sha256", "admin-compare").update(input).digest();
  const b = createHmac("sha256", "admin-compare").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
