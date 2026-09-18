import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  ADMIN_COOKIE,
  isValidAdminToken,
  unauthorized,
} from "@/lib/admin-auth";
import { reviewAnswers } from "@/lib/grading";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { QuestionRow, SubmissionRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!isValidAdminToken(token)) {
    return unauthorized();
  }

  try {
    const supabase = getSupabaseAdmin();
    const [{ data, error }, { data: questionRows, error: questionsError }] =
      await Promise.all([
        supabase
          .from("submissions")
          .select(
            "id, ig_username, score, is_perfect, completed_at, time_taken_seconds, answers",
          )
          .order("score", { ascending: false })
          .order("completed_at", { ascending: true }),
        supabase
          .from("questions")
          .select(
            "id, round, order_index, question_text, question_type, options, correct_answers",
          )
          .order("order_index", { ascending: true }),
      ]);

    if (error || questionsError) {
      console.error("admin submissions", error || questionsError);
      return NextResponse.json(
        { error: "Could not load submissions." },
        { status: 500 },
      );
    }

    const questions = (questionRows ?? []) as QuestionRow[];
    const submissions = ((data ?? []) as SubmissionRow[]).map((row) => ({
      id: row.id,
      ig_username: row.ig_username,
      score: row.score,
      is_perfect: row.is_perfect,
      completed_at: row.completed_at,
      time_taken_seconds: row.time_taken_seconds,
      answer_review: reviewAnswers(questions, row.answers),
    }));

    const firstCompleter =
      [...submissions].sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime(),
      )[0] ?? null;

    const firstPerfect =
      submissions
        .filter((row) => row.is_perfect)
        .sort(
          (a, b) =>
            new Date(a.completed_at).getTime() -
            new Date(b.completed_at).getTime(),
        )[0] ?? null;

    const topScorer = firstPerfect ? null : (submissions[0] ?? null);

    return NextResponse.json({
      submissions,
      highlights: {
        firstCompleter,
        topScorer,
        firstPerfect,
      },
    });
  } catch (error) {
    console.error("admin submissions", error);
    return NextResponse.json(
      { error: "Could not load submissions." },
      { status: 500 },
    );
  }
}
