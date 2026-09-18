import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { BROWSER_ID_COOKIE } from "@/lib/admin-auth";
import { isDevUnlock } from "@/lib/dev-unlock";
import { gradeAnswers, normalizeIgUsername } from "@/lib/grading";
import { getResultMessage } from "@/lib/result-message";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { PlayerAnswer, QuestionRow } from "@/lib/types";

export const dynamic = "force-dynamic";

function isPlayerAnswer(value: unknown): value is PlayerAnswer {
  if (!value || typeof value !== "object") return false;
  const row = value as PlayerAnswer;
  return (
    typeof row.question_id === "number" &&
    typeof row.selected_option === "string"
  );
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const cookieBrowserId = cookieStore.get(BROWSER_ID_COOKIE)?.value;

  let body: {
    answers?: unknown;
    ig_username?: unknown;
    browser_id?: unknown;
    time_taken_seconds?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const browserId =
    cookieBrowserId ||
    (typeof body.browser_id === "string" ? body.browser_id : "");

  if (!browserId) {
    return NextResponse.json(
      { error: "Missing browser session. Please reload and try again." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.answers) || !body.answers.every(isPlayerAnswer)) {
    return NextResponse.json(
      { error: "Answers must be an array of { question_id, selected_option }." },
      { status: 400 },
    );
  }

  const igUsername = normalizeIgUsername(body.ig_username);
  const timeTaken =
    typeof body.time_taken_seconds === "number" &&
    Number.isFinite(body.time_taken_seconds)
      ? Math.max(0, Math.round(body.time_taken_seconds))
      : null;

  try {
    const supabase = getSupabaseAdmin();

    const { data: existing, error: existingError } = await supabase
      .from("submissions")
      .select("score, is_perfect")
      .eq("browser_id", browserId)
      .maybeSingle();

    if (existingError) {
      console.error("submit existing", existingError);
      return NextResponse.json(
        { error: "Could not submit quiz." },
        { status: 500 },
      );
    }

    if (existing && !isDevUnlock()) {
      return NextResponse.json({
        alreadySubmitted: true,
        score: existing.score,
        isPerfect: existing.is_perfect,
        message: getResultMessage(existing.score, 22),
      });
    }

    if (existing && isDevUnlock()) {
      const { error: deleteError } = await supabase
        .from("submissions")
        .delete()
        .eq("browser_id", browserId);
      if (deleteError) {
        console.error("submit delete (dev)", deleteError);
        return NextResponse.json(
          { error: "Could not reset your local test run." },
          { status: 500 },
        );
      }
    }

    const { data: questionRows, error: questionsError } = await supabase
      .from("questions")
      .select(
        "id, round, order_index, question_text, question_type, options, correct_answers",
      )
      .order("order_index", { ascending: true });

    if (questionsError || !questionRows?.length) {
      console.error("submit questions", questionsError);
      return NextResponse.json(
        { error: "Could not grade quiz right now." },
        { status: 500 },
      );
    }

    const questions = questionRows as QuestionRow[];
    const { score, isPerfect, answersMap } = gradeAnswers(
      questions,
      body.answers,
    );

    const { error: insertError } = await supabase.from("submissions").insert({
      ig_username: igUsername,
      browser_id: browserId,
      answers: answersMap,
      score,
      is_perfect: isPerfect,
      time_taken_seconds: timeTaken,
    });

    if (insertError) {
      const constraintText = `${insertError.message} ${insertError.details ?? ""}`;
      if (insertError.code === "23505") {
        if (constraintText.includes("unique_ig_username")) {
          return NextResponse.json(
            {
              error:
                "This Instagram username has already been used. Use your own username, or leave it blank (you won't qualify for prizes).",
            },
            { status: 409 },
          );
        }

        const { data: replay } = await supabase
          .from("submissions")
          .select("score, is_perfect")
          .eq("browser_id", browserId)
          .maybeSingle();

        if (replay) {
          return NextResponse.json({
            alreadySubmitted: true,
            score: replay.score,
            isPerfect: replay.is_perfect,
            message: getResultMessage(replay.score, 22),
          });
        }
      }

      console.error("submit insert", insertError);
      return NextResponse.json(
        { error: "Could not save your results." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      score,
      isPerfect,
      message: getResultMessage(score, questions.length),
    });
  } catch (error) {
    console.error("submit-quiz", error);
    return NextResponse.json(
      { error: "Could not submit quiz." },
      { status: 500 },
    );
  }
}
