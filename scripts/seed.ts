/**
 * Server-only seed script. Never import this from app/ or components/.
 * Run once after applying supabase/schema.sql:
 *   npm run seed
 *
 * Questions come from `scripts/questions.local.ts` when that file exists, and
 * fall back to `scripts/questions.example.ts` otherwise. The local file is
 * gitignored so a real answer key is never committed.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createClient } from "@supabase/supabase-js";

import type { SeedQuestion } from "./question-type";
import { QUESTIONS as exampleQuestions } from "./questions.example";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

async function loadQuestions(): Promise<{ questions: SeedQuestion[]; source: string }> {
  const localPath = path.join(scriptsDir, "questions.local.ts");
  if (existsSync(localPath)) {
    const local = (await import(pathToFileURL(localPath).href)) as {
      QUESTIONS: SeedQuestion[];
    };
    return { questions: local.QUESTIONS, source: "scripts/questions.local.ts" };
  }

  return { questions: exampleQuestions, source: "scripts/questions.example.ts" };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.local.example to .env.local and fill it in.",
    );
  }

  const { questions, source } = await loadQuestions();
  console.log(`Seeding ${questions.length} questions from ${source}`);

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const question of questions) {
    const { data: existing, error: lookupError } = await supabase
      .from("questions")
      .select("id")
      .eq("order_index", question.order_index)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    if (existing) {
      const { error } = await supabase
        .from("questions")
        .update(question)
        .eq("id", existing.id);
      if (error) throw error;
      console.log(`Updated question ${question.order_index}`);
    } else {
      const { error } = await supabase.from("questions").insert(question);
      if (error) throw error;
      console.log(`Inserted question ${question.order_index}`);
    }
  }

  console.log(`Seeded ${questions.length} questions.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
