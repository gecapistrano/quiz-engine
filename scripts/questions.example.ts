/**
 * Example question set.
 *
 * `npm run seed` uses this file unless you create `scripts/questions.local.ts`,
 * which is gitignored. Keep your real answer key there so that publishing the
 * repository never publishes the answers to a quiz that is still being played.
 *
 *   cp scripts/questions.example.ts scripts/questions.local.ts
 *
 * Rounds run in order (easy, then moderate, then difficult) and `order_index`
 * must be unique across the whole set, because the seeder upserts on it.
 */
import type { SeedQuestion } from "./question-type";

export const QUESTIONS: SeedQuestion[] = [
  {
    round: "easy",
    order_index: 1,
    question_text: "Which planet is closest to the Sun?",
    question_type: "multiple_choice",
    options: ["Mercury", "Venus", "Earth", "Mars"],
    correct_answers: ["Mercury"],
  },
  {
    round: "easy",
    order_index: 2,
    question_text: "How many continents are there?",
    question_type: "multiple_choice",
    options: ["five", "six", "seven", "eight"],
    correct_answers: ["seven"],
  },
  {
    round: "easy",
    order_index: 3,
    question_text: "The largest ocean on Earth is the ______ Ocean.",
    question_type: "text_input",
    options: null,
    correct_answers: ["Pacific", "Pacific Ocean"],
  },
  {
    round: "moderate",
    order_index: 4,
    question_text: "Which language runs natively in a web browser?",
    question_type: "multiple_choice",
    options: ["Python", "JavaScript", "Rust", "Go"],
    correct_answers: ["JavaScript"],
  },
  {
    round: "moderate",
    order_index: 5,
    question_text: "In computing, 1 KB is how many bytes?",
    question_type: "text_input",
    options: null,
    correct_answers: ["1024", "1,024"],
  },
  {
    round: "difficult",
    order_index: 6,
    question_text: "What does the 'S' in HTTPS stand for?",
    question_type: "text_input",
    options: null,
    correct_answers: ["Secure"],
  },
];
