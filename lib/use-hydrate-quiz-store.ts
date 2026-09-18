"use client";

import { useEffect, useState } from "react";

import { useQuizStore } from "@/store/quiz-store";

export function useHydrateQuizStore() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve(useQuizStore.persist.rehydrate()).finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
