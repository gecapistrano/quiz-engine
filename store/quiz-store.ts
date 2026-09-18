"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { PublicQuestion } from "@/lib/types";

type QuizState = {
  igUsername: string;
  browserId: string;
  questions: PublicQuestion[];
  currentIndex: number;
  answers: Record<number, string>;
  startedAt: number | null;
  score: number | null;
  isPerfect: boolean;
  resultMessage: string | null;
  submitted: boolean;
  setIgUsername: (value: string) => void;
  setBrowserId: (value: string) => void;
  setQuestions: (questions: PublicQuestion[]) => void;
  selectAnswer: (questionId: number, value: string) => void;
  goNext: () => void;
  startQuiz: () => void;
  setResult: (payload: {
    score: number;
    isPerfect: boolean;
    message: string;
  }) => void;
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      igUsername: "",
      browserId: "",
      questions: [],
      currentIndex: 0,
      answers: {},
      startedAt: null,
      score: null,
      isPerfect: false,
      resultMessage: null,
      submitted: false,
      setIgUsername: (igUsername) => set({ igUsername }),
      setBrowserId: (browserId) => set({ browserId }),
      setQuestions: (questions) =>
        set({
          questions: [...questions].sort((a, b) => a.order_index - b.order_index),
        }),
      selectAnswer: (questionId, value) =>
        set({
          answers: { ...get().answers, [questionId]: value },
        }),
      goNext: () => {
        const { currentIndex, questions } = get();
        if (currentIndex < questions.length - 1) {
          set({ currentIndex: currentIndex + 1 });
        }
      },
      startQuiz: () =>
        set({
          currentIndex: 0,
          answers: {},
          startedAt: Date.now(),
          score: null,
          isPerfect: false,
          resultMessage: null,
          submitted: false,
          questions: [],
        }),
      setResult: ({ score, isPerfect, message }) =>
        set({
          score,
          isPerfect,
          resultMessage: message,
          submitted: true,
        }),
    }),
    {
      name: "birthday-quiz-progress",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (state) => ({
        igUsername: state.igUsername,
        browserId: state.browserId,
        currentIndex: state.currentIndex,
        answers: state.answers,
        startedAt: state.startedAt,
        score: state.score,
        isPerfect: state.isPerfect,
        resultMessage: state.resultMessage,
        submitted: state.submitted,
      }),
    },
  ),
);
