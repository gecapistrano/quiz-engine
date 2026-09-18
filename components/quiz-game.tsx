"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

import { AppHeader, AppShell } from "@/components/app-shell";
import { InstagramLink } from "@/components/instagram-link";
import { PrimaryButton } from "@/components/primary-button";
import { getRoundMeta } from "@/lib/round-meta";
import { ensureBrowserSession } from "@/lib/session-client";
import type { PublicQuestion } from "@/lib/types";
import { useHydrateQuizStore } from "@/lib/use-hydrate-quiz-store";
import { useQuizStore } from "@/store/quiz-store";

const OPTION_LETTERS = ["A", "B", "C", "D"];

function placeholderFor(question: PublicQuestion) {
  if (question.order_index === 20) return "Starts with F...";
  if (question.order_index === 21) return "One letter...";
  if (question.order_index === 22) return "Type the number...";
  return "Type your answer...";
}

function QuestionText({ text }: { text: string }) {
  const parts = text.split(/((?:_ ?)+)/);

  return (
    <>
      {parts.map((part, index) => {
        const blankLength = part.replace(/ /g, "").match(/^_+$/)?.[0].length;
        if (!blankLength) {
          return <Fragment key={index}>{part}</Fragment>;
        }

        return (
          <span
            key={index}
            aria-hidden
            className="mx-0.5 inline-block translate-y-[0.12em] border-b-[2.5px] border-current"
            style={{ width: `${Math.max(blankLength, 1) * 0.62}em` }}
          />
        );
      })}
    </>
  );
}

export function QuizGame() {
  const router = useRouter();
  const hydrated = useHydrateQuizStore();
  const questions = useQuizStore((s) => s.questions);
  const setQuestions = useQuizStore((s) => s.setQuestions);
  const currentIndex = useQuizStore((s) => s.currentIndex);
  const answers = useQuizStore((s) => s.answers);
  const selectAnswer = useQuizStore((s) => s.selectAnswer);
  const goNext = useQuizStore((s) => s.goNext);
  const igUsername = useQuizStore((s) => s.igUsername);
  const browserId = useQuizStore((s) => s.browserId);
  const setBrowserId = useQuizStore((s) => s.setBrowserId);
  const startedAt = useQuizStore((s) => s.startedAt);
  const submitted = useQuizStore((s) => s.submitted);
  const setResult = useQuizStore((s) => s.setResult);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tallying, setTallying] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (submitted) {
      router.replace("/results");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const id = browserId || (await ensureBrowserSession());
        if (cancelled) return;
        setBrowserId(id);

        const statusRes = await fetch("/api/check-status");
        const status = await statusRes.json();
        if (cancelled) return;
        if (status.played) {
          setResult({
            score: status.score ?? 0,
            isPerfect: Boolean(status.isPerfect),
            message: "",
          });
          router.replace("/");
          return;
        }

        const response = await fetch("/api/questions");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not load questions.");
        }
        if (cancelled) return;
        setQuestions(data.questions ?? []);
        if (!useQuizStore.getState().startedAt) {
          useQuizStore.setState({ startedAt: Date.now() });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load quiz.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [browserId, hydrated, router, setBrowserId, setQuestions, setResult, submitted]);

  const question = questions[currentIndex];
  const selected = question ? (answers[question.id] ?? "") : "";
  const canAdvance = selected.trim().length > 0;
  const isLast = currentIndex === questions.length - 1;
  const progress = questions.length
    ? ((currentIndex + 1) / questions.length) * 100
    : 0;
  const roundMeta = question ? getRoundMeta(question.round) : null;
  const isRoundStart = useMemo(() => {
    if (!question) return false;
    if (currentIndex === 0) return true;
    return questions[currentIndex - 1]?.round !== question.round;
  }, [currentIndex, question, questions]);

  async function handleNext() {
    if (!question || !canAdvance || tallying) return;

    if (question.question_type === "text_input") {
      selectAnswer(question.id, selected.trim());
    }

    if (!isLast) {
      goNext();
      return;
    }

    const latestAnswers = {
      ...useQuizStore.getState().answers,
      [question.id]:
        question.question_type === "text_input"
          ? selected.trim()
          : useQuizStore.getState().answers[question.id],
    };

    setTallying(true);
    setError("");

    const payload = {
      answers: Object.entries(latestAnswers).map(([question_id, selected_option]) => ({
        question_id: Number(question_id),
        selected_option,
      })),
      ig_username: igUsername,
      browser_id: browserId,
      time_taken_seconds: startedAt
        ? Math.round((Date.now() - startedAt) / 1000)
        : null,
    };

    try {
      const wait = new Promise((resolve) => setTimeout(resolve, 1600));
      const request = fetch("/api/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const [response] = await Promise.all([request, wait]);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not submit quiz.");
      }

      setResult({
        score: data.score,
        isPerfect: Boolean(data.isPerfect),
        message: data.message,
      });
      router.push("/results");
    } catch (err) {
      setTallying(false);
      setError(err instanceof Error ? err.message : "Could not submit quiz.");
    }
  }

  if (!hydrated || loading) {
    return (
      <AppShell>
        <AppHeader title="Birthday Quiz" />
        <p className="relative z-10 flex flex-1 items-center justify-center font-extrabold text-pink-500">
          Get ready...
        </p>
      </AppShell>
    );
  }

  if (error && !question) {
    return (
      <AppShell>
        <AppHeader />
        <div className="relative z-10 rounded-2xl border border-purple-100 bg-white/90 p-6 text-center shadow-sm">
          <p className="font-extrabold text-slate-900">{error}</p>
          <InstagramLink className="mt-6" />
        </div>
      </AppShell>
    );
  }

  if (!question) {
    return (
      <AppShell>
        <AppHeader />
        <p className="relative z-10 font-extrabold">No questions yet.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <AppHeader title="Birthday Quiz" />

      <div className="relative z-10 mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-pink-200 bg-pink-50 px-2.5 py-1 text-[11px] font-extrabold text-pink-600">
            Q{question.order_index} / {questions.length}
          </span>
          {roundMeta && (
            <span
              className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${roundMeta.className}`}
            >
              {roundMeta.label}
            </span>
          )}
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-purple-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.main
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="relative z-10 flex-1 space-y-4"
        >
          <div className="space-y-3 rounded-2xl border border-purple-100 bg-white/90 p-4 shadow-sm backdrop-blur-md">
            {question.round === "difficult" && roundMeta?.extra && isRoundStart && (
              <p className="text-[11px] font-medium text-pink-600">{roundMeta.extra}</p>
            )}
            <h2 className="text-base leading-snug font-extrabold text-slate-900">
              <QuestionText text={question.question_text} />
            </h2>
          </div>

          {question.question_type === "multiple_choice" && question.options ? (
            <div className="space-y-2.5">
              {question.options.map((option, index) => {
                const active = selected === option;
                const letter = OPTION_LETTERS[index] ?? String(index + 1);
                return (
                  <motion.button
                    key={option}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectAnswer(question.id, option)}
                    className={`group flex w-full items-center justify-between rounded-2xl p-3.5 text-left transition ${
                      active
                        ? "border-2 border-pink-400 bg-pink-50 shadow-sm"
                        : "border border-purple-100/90 bg-white hover:bg-purple-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${
                          active
                            ? "bg-pink-500 text-white"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {letter}
                      </span>
                      <span
                        className={`text-xs ${
                          active
                            ? "font-extrabold text-slate-900"
                            : "font-semibold text-slate-800"
                        }`}
                      >
                        {option}
                      </span>
                    </div>
                    {active ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white">
                        ✓
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-purple-200 group-hover:border-purple-300" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <input
              value={selected}
              onChange={(event) => selectAnswer(question.id, event.target.value)}
              placeholder={placeholderFor(question)}
              autoComplete="off"
              autoCapitalize="off"
              className="w-full rounded-2xl border border-purple-200/70 bg-white px-4 py-3.5 text-sm font-semibold outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-purple-400"
            />
          )}

          {error && <p className="text-sm text-pink-600">{error}</p>}
        </motion.main>
      </AnimatePresence>

      <div className="relative z-10 pt-3">
        <PrimaryButton
          onClick={handleNext}
          disabled={!canAdvance || tallying}
          className="h-12 w-full py-3 text-sm"
        >
          <span>{isLast ? "Finish Quiz" : "Lock In & Next"}</span>
          <span>{isLast ? "🎉" : "⚡"}</span>
        </PrimaryButton>
      </div>

      <AnimatePresence>
        {tallying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 flex items-center justify-center bg-[#fdf8ff]/80 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="text-5xl"
              >
                🧮
              </motion.div>
              <p className="mt-4 text-lg font-extrabold text-pink-600">
                Tallying your answers...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
