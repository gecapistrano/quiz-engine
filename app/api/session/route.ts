import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { BROWSER_ID_COOKIE, cookieOptions } from "@/lib/admin-auth";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(BROWSER_ID_COOKIE)?.value;

  let clientBrowserId: unknown;
  try {
    const body = await request.json();
    clientBrowserId = body?.clientBrowserId;
  } catch {
    clientBrowserId = undefined;
  }

  const browserId = isUuid(existingCookie)
    ? existingCookie
    : isUuid(clientBrowserId)
      ? clientBrowserId
      : crypto.randomUUID();

  const response = NextResponse.json({ browserId });
  response.cookies.set(
    BROWSER_ID_COOKIE,
    browserId,
    cookieOptions(60 * 60 * 24 * 365),
  );
  return response;
}
