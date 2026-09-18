import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { toPublicQuestion } from "@/lib/to-public-question";
import type { PublicQuestion, QuestionRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("questions")
      .select(
        "id, round, order_index, question_text, question_type, options",
      )
      .order("order_index", { ascending: true });

    if (error) {
      console.error("questions", error);
      return NextResponse.json(
        { error: "Could not load questions." },
        { status: 500 },
      );
    }

    const questions: PublicQuestion[] = (
      (data ?? []) as Omit<QuestionRow, "correct_answers">[]
    ).map(toPublicQuestion);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("questions", error);
    return NextResponse.json(
      { error: "Could not load questions." },
      { status: 500 },
    );
  }
}
