import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { BROWSER_ID_COOKIE } from "@/lib/admin-auth";
import { isDevUnlock } from "@/lib/dev-unlock";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const browserId = cookieStore.get(BROWSER_ID_COOKIE)?.value;

  if (!browserId) {
    return NextResponse.json({ played: false, score: null, browserId: null });
  }

  if (isDevUnlock()) {
    return NextResponse.json({ played: false, score: null, browserId });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("submissions")
      .select("score, ig_username, is_perfect")
      .eq("browser_id", browserId)
      .maybeSingle();

    if (error) {
      console.error("check-status", error);
      return NextResponse.json(
        { error: "Could not check quiz status." },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ played: false, score: null, browserId });
    }

    return NextResponse.json({
      played: true,
      score: data.score,
      isPerfect: data.is_perfect,
      igUsername: data.ig_username,
      browserId,
    });
  } catch (error) {
    console.error("check-status", error);
    return NextResponse.json(
      { error: "Could not check quiz status." },
      { status: 500 },
    );
  }
}
