"use client";

const STORAGE_KEY = "birthday-quiz-browser-id";

export async function ensureBrowserSession(): Promise<string> {
  const existing =
    typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY);

  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientBrowserId: existing }),
  });

  if (!response.ok) {
    throw new Error("Could not start a quiz session.");
  }

  const data = (await response.json()) as { browserId: string };
  localStorage.setItem(STORAGE_KEY, data.browserId);
  return data.browserId;
}
