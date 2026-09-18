export type Round = "easy" | "moderate" | "difficult";
export type QuestionType = "multiple_choice" | "text_input";

export type PublicQuestion = {
  id: number;
  round: Round;
  order_index: number;
  question_text: string;
  question_type: QuestionType;
  options: string[] | null;
};

export type QuestionRow = PublicQuestion & {
  correct_answers: string[];
};

export type PlayerAnswer = {
  question_id: number;
  selected_option: string;
};

export type SubmissionRow = {
  id: string;
  ig_username: string | null;
  browser_id: string;
  answers: Record<string, string>;
  score: number;
  is_perfect: boolean;
  completed_at: string;
  time_taken_seconds: number | null;
};
