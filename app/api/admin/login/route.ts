import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE,
  cookieOptions,
  createAdminToken,
  passwordsMatch,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "Admin password is not configured." },
      { status: 500 },
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!passwordsMatch(password, expected)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    ADMIN_COOKIE,
    createAdminToken(),
    cookieOptions(60 * 60 * 24 * 7),
  );
  return response;
}
