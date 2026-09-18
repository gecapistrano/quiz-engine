"use client";

import type { ReactNode } from "react";

import { SoundButton } from "@/components/sound-button";

export function AppHeader({ kicker = "GEM'S 22ND", title = "Birthday Quiz" }: {
  kicker?: string;
  title?: string;
}) {
  return (
    <header className="relative z-10 flex items-center justify-between pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500 text-xl font-bold text-white shadow-lg shadow-pink-500/30">
          🎂
        </div>
        <div>
          <span className="block text-[10px] font-extrabold tracking-widest text-pink-500 uppercase">
            {kicker}
          </span>
          <h1 className="text-base leading-tight font-extrabold text-slate-900">
            {title}
          </h1>
        </div>
      </div>
      <SoundButton />
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-[#fdf8ff] text-slate-800 selection:bg-pink-100 selection:text-pink-600">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#fdf8ff] px-5 py-6 shadow-2xl">
        <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="pointer-events-none absolute top-48 -right-16 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-amber-100/50 blur-2xl" />
        {children}
      </div>
    </div>
  );
}
