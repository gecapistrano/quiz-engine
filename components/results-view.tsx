"use client";

import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppHeader, AppShell } from "@/components/app-shell";
import { InstagramLink } from "@/components/instagram-link";
import { getResultMessage } from "@/lib/result-message";
import { useHydrateQuizStore } from "@/lib/use-hydrate-quiz-store";
import { useQuizStore } from "@/store/quiz-store";

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, target]);

  return value;
}

export function ResultsView() {
  const router = useRouter();
  const hydrated = useHydrateQuizStore();
  const score = useQuizStore((s) => s.score);
  const isPerfect = useQuizStore((s) => s.isPerfect);
  const resultMessage = useQuizStore((s) => s.resultMessage);
  const submitted = useQuizStore((s) => s.submitted);
  const counted = useCountUp(score ?? 0, 1500);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!submitted || score === null) {
      router.replace("/");
    }
  }, [hydrated, router, score, submitted]);

  useEffect(() => {
    if (score === null) return;
    const timer = setTimeout(() => setShowMessage(true), 1500);
    return () => clearTimeout(timer);
  }, [score]);

  useEffect(() => {
    if (!isPerfect && score !== 22) return;

    const burst = () => {
      void confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.65 },
      });
      void confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
      });
      void confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
      });
    };

    burst();
    const t1 = setTimeout(burst, 450);
    const t2 = setTimeout(burst, 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isPerfect, score]);

  if (!hydrated || score === null) {
    return (
      <AppShell>
        <AppHeader />
        <p className="relative z-10 flex flex-1 items-center justify-center font-extrabold text-pink-500">
          Loading results…
        </p>
      </AppShell>
    );
  }

  const message = resultMessage || getResultMessage(score, 22);
  const perfect = isPerfect || score === 22;

  return (
    <AppShell>
      <AppHeader />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-sm font-extrabold tracking-widest text-pink-500 uppercase">
          Your score
        </p>
        <p className="mt-2 text-7xl font-black text-slate-900">
          {counted}
          <span className="text-3xl text-slate-300">/22</span>
        </p>

        {showMessage && (
          <motion.section
            initial={{ opacity: 0, scale: 0.86 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              perfect
                ? { type: "spring", bounce: 0.5, duration: 0.8 }
                : { duration: 0.4, ease: "easeOut" }
            }
            className="mt-8 w-full rounded-2xl border border-purple-100 bg-white/90 px-6 py-8 shadow-sm backdrop-blur-md"
          >
            <p className="text-base leading-relaxed font-medium text-slate-800">
              {message}
            </p>
            <p className="mt-6 text-sm text-slate-500">
              Thank you for being part of the fun! You may send a screenshot of
              your score to @gemcapistrano ❤️
            </p>
          </motion.section>
        )}

        <InstagramLink className="mt-8" />
      </div>
    </AppShell>
  );
}
