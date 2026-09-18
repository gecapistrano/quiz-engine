/**
 * Shape of a seeded question.
 *
 * `correct_answers` never leaves the server: the questions API strips it before
 * anything reaches the browser, and grading happens in the API route.
 */
export type SeedQuestion = {
  round: "easy" | "moderate" | "difficult";
  order_index: number;
  question_text: string;
  question_type: "multiple_choice" | "text_input";
  /** Choices for multiple_choice; null for free-text questions. */
  options: string[] | null;
  /** Accepted answers, compared case-insensitively after trimming. */
  correct_answers: string[];
};
