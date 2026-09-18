"use client";

import { FormEvent, Fragment, useEffect, useState } from "react";

type AnswerReview = {
  question_id: number;
  order_index: number;
  question_text: string;
  selected: string;
  is_correct: boolean;
  correct_answers: string[];
};

type Submission = {
  id: string;
  ig_username: string | null;
  score: number;
  is_perfect: boolean;
  completed_at: string;
  time_taken_seconds: number | null;
  answer_review?: AnswerReview[];
};

type Highlights = {
  firstCompleter: Submission | null;
  topScorer: Submission | null;
  firstPerfect: Submission | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function labelFor(row: Submission | null) {
  if (!row) return "—";
  return `${row.ig_username || "(no IG)"} · ${row.score}/22`;
}

export function AdminDashboard() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [highlights, setHighlights] = useState<Highlights | null>(null);
  const [loadError, setLoadError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  async function loadSubmissions() {
    const response = await fetch("/api/admin/submissions");
    if (response.status === 401) {
      setAuthed(false);
      return false;
    }
    const data = await response.json();
    if (!response.ok) {
      setLoadError(data.error || "Could not load submissions.");
      setAuthed(true);
      return false;
    }
    setSubmissions(data.submissions ?? []);
    setHighlights(data.highlights ?? null);
    setLoadError("");
    setAuthed(true);
    return true;
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/submissions")
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 401) {
          setAuthed(false);
          return;
        }
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok) {
          setLoadError(data.error || "Could not load submissions.");
          setAuthed(true);
          return;
        }
        setSubmissions(data.submissions ?? []);
        setHighlights(data.highlights ?? null);
        setLoadError("");
        setAuthed(true);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("Could not load submissions.");
          setAuthed(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authed) return;
    const timer = setInterval(() => {
      void loadSubmissions();
    }, 7000);
    return () => clearInterval(timer);
  }, [authed]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoginError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setLoginError(data.error || "Wrong password.");
      return;
    }
    setPassword("");
    await loadSubmissions();
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setSubmissions([]);
    setHighlights(null);
  }

  if (authed === null) {
    return <p className="p-8 text-sm text-neutral-600">Checking session…</p>;
  }

  if (!authed) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm items-center px-4">
        <form onSubmit={handleLogin} className="w-full space-y-3">
          <h1 className="text-xl font-semibold">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded border border-neutral-300 px-3 py-2"
          />
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button
            type="submit"
            className="w-full rounded bg-neutral-900 px-3 py-2 text-white"
          >
            Enter
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Live submissions</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded border px-3 py-1.5 text-sm"
        >
          Log out
        </button>
      </div>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-neutral-500">🏃 First completer</p>
          <p className="mt-1 font-medium">
            {labelFor(highlights?.firstCompleter ?? null)}
          </p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-neutral-500">🥇 Current top scorer</p>
          <p className="mt-1 font-medium">
            {highlights?.firstPerfect
              ? "Perfect score already claimed"
              : labelFor(highlights?.topScorer ?? null)}
          </p>
        </div>
        <div className="rounded border bg-white p-4">
          <p className="text-sm text-neutral-500">💯 First perfect</p>
          <p className="mt-1 font-medium">
            {labelFor(highlights?.firstPerfect ?? null)}
          </p>
        </div>
      </section>

      {loadError && <p className="mb-3 text-sm text-red-600">{loadError}</p>}

      <div className="overflow-x-auto rounded border bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-neutral-50">
            <tr>
              <th className="px-3 py-2">Rank</th>
              <th className="px-3 py-2">IG username</th>
              <th className="px-3 py-2">Score</th>
              <th className="px-3 py-2">Perfect</th>
              <th className="px-3 py-2">Completed</th>
              <th className="px-3 py-2">Time (s)</th>
              <th className="px-3 py-2">Answers</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-neutral-500" colSpan={7}>
                  No submissions yet.
                </td>
              </tr>
            ) : (
              submissions.map((row, index) => (
                <Fragment key={row.id}>
                <tr
                  className={`border-b ${
                    row.is_perfect ? "bg-yellow-50" : ""
                  } ${openId === row.id ? "" : "last:border-0"}`}
                >
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2">{row.ig_username || "—"}</td>
                  <td className="px-3 py-2 font-medium">{row.score}/22</td>
                  <td className="px-3 py-2">{row.is_perfect ? "yes" : ""}</td>
                  <td className="px-3 py-2">{formatDate(row.completed_at)}</td>
                  <td className="px-3 py-2">
                    {row.time_taken_seconds ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenId((current) =>
                          current === row.id ? null : row.id,
                        )
                      }
                      className="rounded border px-2 py-1 text-xs"
                    >
                      {openId === row.id ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>
                {openId === row.id && (
                  <tr key={`${row.id}-answers`} className="border-b bg-neutral-50 last:border-0">
                    <td colSpan={7} className="px-3 py-3">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-neutral-500">
                            <th className="py-1 pr-2">#</th>
                            <th className="py-1 pr-2">Question</th>
                            <th className="py-1 pr-2">Their answer</th>
                            <th className="py-1 pr-2">Result</th>
                            <th className="py-1">Correct answer(s)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(row.answer_review ?? []).map((item) => (
                            <tr key={item.question_id} className="align-top border-t border-neutral-200">
                              <td className="py-1.5 pr-2">{item.order_index}</td>
                              <td className="py-1.5 pr-2">{item.question_text}</td>
                              <td className="py-1.5 pr-2 font-medium">
                                {item.selected || "—"}
                              </td>
                              <td className={`py-1.5 pr-2 font-semibold ${item.is_correct ? "text-green-700" : "text-red-700"}`}>
                                {item.is_correct ? "correct" : "wrong"}
                              </td>
                              <td className="py-1.5 text-neutral-600">
                                {item.correct_answers.join(" / ")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-neutral-500">
        Auto-refreshes every 7 seconds. Times shown in Asia/Manila.
      </p>
    </main>
  );
}
