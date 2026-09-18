"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppHeader, AppShell } from "@/components/app-shell";
import { PrimaryButton } from "@/components/primary-button";
import { ensureBrowserSession } from "@/lib/session-client";
import { useHydrateQuizStore } from "@/lib/use-hydrate-quiz-store";
import { useQuizStore } from "@/store/quiz-store";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

type Status =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "played"; score: number | null };

function displayHandle(value: string) {
  return value.replace(/^@+/, "");
}

export function LandingPage() {
  const router = useRouter();
  const hydrated = useHydrateQuizStore();
  const setBrowserId = useQuizStore((s) => s.setBrowserId);
  const setIgUsername = useQuizStore((s) => s.setIgUsername);
  const startQuiz = useQuizStore((s) => s.startQuiz);
  const storedUsername = useQuizStore((s) => s.igUsername);
  const submitted = useQuizStore((s) => s.submitted);
  const startedAt = useQuizStore((s) => s.startedAt);
  const storedScore = useQuizStore((s) => s.score);

  const [username, setUsername] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "loading" });
  const [error, setError] = useState("");
  const usernameValue = username ?? storedUsername;

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    (async () => {
      try {
        const browserId = await ensureBrowserSession();
        if (cancelled) return;
        setBrowserId(browserId);

        const response = await fetch("/api/check-status");
        const data = await response.json();
        if (cancelled) return;

        if (process.env.NODE_ENV !== "development") {
          if (data.played) {
            setStatus({ kind: "played", score: data.score ?? storedScore });
            return;
          }

          if (submitted && storedScore !== null) {
            setStatus({ kind: "played", score: storedScore });
            return;
          }
        }

        setStatus({ kind: "ready" });
      } catch {
        if (!cancelled) {
          setStatus({ kind: "ready" });
          setError("Could not verify your session, but you can still try to start.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrated, setBrowserId, storedScore, submitted]);

  const inProgress = Boolean(startedAt) && !submitted;

  function handleStart() {
    const nextUsername = usernameValue.trim();
    setIgUsername(nextUsername);
    if (!inProgress) {
      startQuiz();
      useQuizStore.getState().setIgUsername(nextUsername);
    }
    router.push("/quiz");
  }

  return (
    <AppShell>
      <AppHeader />

      <AnimatePresence mode="wait">
        {status.kind === "loading" || !hydrated ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-1 items-center justify-center"
          >
            <p className="font-extrabold text-pink-500">Loading the party… 🎉</p>
          </motion.div>
        ) : status.kind === "played" ? (
          <motion.section
            key="played"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 mt-6 rounded-2xl border border-purple-100/80 bg-white/80 px-6 py-10 text-center shadow-sm backdrop-blur-md"
          >
            <p className="text-5xl">🎂</p>
            <p className="mt-3 text-[10px] font-extrabold tracking-widest text-pink-500 uppercase">
              Event over
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              You&apos;ve already played!
            </h2>
            <p className="mt-2 text-slate-600">
              Thanks for being part of the birthday fun ❤️
            </p>
            {status.score !== null && (
              <p className="mt-6 inline-block rounded-2xl bg-pink-50 px-5 py-2 text-2xl font-black text-pink-600">
                Your score: {status.score}/22
              </p>
            )}
            <p className="mt-6 text-sm text-slate-500">
              The prizes are already taken, haha. Screenshot this as a keepsake!
            </p>
          </motion.section>
        ) : (
          <motion.main
            key="ready"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
            className="relative z-10 flex-1 space-y-4"
          >
            <motion.div variants={fadeUp} className="flex flex-col items-center pt-2">
              <div className="relative">
                <div className="absolute -inset-1.5 rounded-[2.5rem] bg-gradient-to-r from-pink-400 via-purple-400 to-amber-300 opacity-70 blur" />
                <div className="relative h-28 w-28 rounded-[2.2rem] bg-white p-1 shadow-xl">
                  <div className="relative h-full w-full overflow-hidden rounded-[1.9rem]">
                    <Image
                      src="/images/gem-profile.jpg"
                      alt="Gem Capistrano"
                      fill
                      priority
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <span className="absolute -top-2 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full border border-purple-100 bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm backdrop-blur-md">
                  ✨ Thank you
                </span>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-pink-500 px-3 py-0.5 text-[10px] font-extrabold text-white shadow-md shadow-pink-500/40">
                  09·09·26
                </span>
              </div>

              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-lg">🎉</span>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    Gem&apos;s 22nd Birthday Quiz
                  </h2>
                  <span className="text-lg">🎂</span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  crafted with love by{" "}
                  <a
                    href="https://instagram.com/gemcapistrano"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-pink-500 hover:underline"
                  >
                    @gemcapistrano
                  </a>
                </p>
              </div>
            </motion.div>

            <motion.section
              variants={fadeUp}
              className="space-y-3 rounded-2xl border border-pink-200/60 bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 text-center shadow-sm"
            >
              <span className="inline-flex items-center rounded-full border border-pink-200 bg-white/90 px-2.5 py-0.5 text-[10px] font-extrabold tracking-widest text-pink-600 uppercase">
                Event over
              </span>
              <p className="text-sm leading-relaxed text-slate-600">
                Thank you to everyone who joined the fun{" "}
                <span className="text-pink-500">❤️</span>
              </p>
              <p className="text-sm leading-relaxed text-slate-600">
                The prizes have already been claimed, haha. You can still play if
                you just want to try the quiz!
              </p>
            </motion.section>

            <motion.div
              variants={fadeUp}
              className="space-y-2 rounded-2xl border border-purple-100 bg-white/90 p-4 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="ig" className="font-bold text-slate-900">
                  Your Instagram Handle
                </label>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">
                  Optional
                </span>
              </div>
              <div className="relative">
                <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-bold text-pink-500">
                  @
                </span>
                <input
                  id="ig"
                  value={displayHandle(usernameValue)}
                  onChange={(event) =>
                    setUsername(event.target.value.replace(/^@+/, ""))
                  }
                  placeholder="your-ig-username"
                  autoComplete="off"
                  className="w-full rounded-xl border border-purple-200/70 bg-purple-50/40 py-2.5 pr-4 pl-8 text-sm font-semibold text-slate-800 transition placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <p className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>✨</span> Totally optional now. Skip it if you just want to
                play!
              </p>
            </motion.div>

            {error && <p className="text-sm text-pink-600">{error}</p>}

            <motion.div variants={fadeUp}>
              <PrimaryButton wiggle onClick={handleStart} className="w-full py-3.5">
                <span>{inProgress ? "Continue Quiz" : "Play for fun"}</span>
                <span>{inProgress ? "🚀" : "🎮"}</span>
              </PrimaryButton>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2 pt-1 text-center">
              {[
                ["QUESTIONS", "22 Trivia"],
                ["TIME LIMIT", "~5 Mins"],
                ["PRIZES", "Taken 😅"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-purple-100/50 bg-purple-50/60 p-2"
                >
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">
                    {label}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {value}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.main>
        )}
      </AnimatePresence>

      <footer className="relative z-10 pt-4 text-center text-[10px] font-medium text-slate-400">
        Thanks for celebrating with me 🎉 • Gem&apos;s 22nd Birthday Quiz
      </footer>
    </AppShell>
  );
}
