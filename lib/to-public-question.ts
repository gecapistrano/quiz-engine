import type { PublicQuestion, QuestionRow } from "./types";

export function toPublicQuestion(
  row: Omit<QuestionRow, "correct_answers">,
): PublicQuestion {
  return {
    id: row.id,
    round: row.round,
    order_index: row.order_index,
    question_text: row.question_text,
    question_type: row.question_type,
    options: row.options,
  };
}
