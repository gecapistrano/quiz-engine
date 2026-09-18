import "server-only";

import type { PlayerAnswer, QuestionRow } from "./types";

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isAnswerCorrect(question: QuestionRow, selected: string): boolean {
  const normalizedSelected = normalize(selected);
  const correct = (question.correct_answers ?? []).map((answer) =>
    normalize(String(answer)),
  );

  if (question.question_type === "text_input") {
    if (correct.includes(normalizedSelected)) {
      return true;
    }

    const asNumber = Number(normalizedSelected);
    if (!Number.isNaN(asNumber) && correct.includes(String(asNumber))) {
      return true;
    }

    return false;
  }

  return correct.includes(normalizedSelected);
}

export function gradeAnswers(
  questions: QuestionRow[],
  answers: PlayerAnswer[],
): {
  score: number;
  isPerfect: boolean;
  answersMap: Record<string, string>;
} {
  const answersById = new Map<number, string>();
  for (const answer of answers) {
    if (typeof answer.question_id !== "number") continue;
    answersById.set(answer.question_id, String(answer.selected_option ?? ""));
  }

  let score = 0;
  const answersMap: Record<string, string> = {};

  for (const question of questions) {
    const selected = answersById.get(question.id) ?? "";
    answersMap[String(question.id)] = selected;
    if (isAnswerCorrect(question, selected)) {
      score += 1;
    }
  }

  return {
    score,
    isPerfect: questions.length > 0 && score === questions.length,
    answersMap,
  };
}

export type AnswerReview = {
  question_id: number;
  order_index: number;
  question_text: string;
  selected: string;
  is_correct: boolean;
  correct_answers: string[];
};

export function reviewAnswers(
  questions: QuestionRow[],
  answersMap: Record<string, string> | null | undefined,
): AnswerReview[] {
  const map = answersMap ?? {};
  return [...questions]
    .sort((a, b) => a.order_index - b.order_index)
    .map((question) => {
      const selected = map[String(question.id)] ?? "";
      return {
        question_id: question.id,
        order_index: question.order_index,
        question_text: question.question_text,
        selected,
        is_correct: isAnswerCorrect(question, selected),
        correct_answers: question.correct_answers ?? [],
      };
    });
}

export function normalizeIgUsername(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || trimmed === "@") return null;
  return trimmed;
}
