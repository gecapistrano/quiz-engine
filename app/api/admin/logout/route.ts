import { NextResponse } from "next/server";

import { ADMIN_COOKIE, cookieOptions } from "@/lib/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  return response;
}
