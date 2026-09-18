import type { Round } from "./types";

export function getRoundMeta(round: Round) {
  if (round === "easy") {
    return {
      label: "Easy Round 🟢",
      extra: null as string | null,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (round === "moderate") {
    return {
      label: "Moderate Round 🟡",
      extra: null as string | null,
      className: "bg-purple-50 text-purple-600 border-purple-200",
    };
  }

  return {
    label: "Difficult Round 🔴",
    extra: "I'm sorry! No one might get a perfect score 😭",
    className: "bg-pink-50 text-pink-600 border-pink-200",
  };
}
