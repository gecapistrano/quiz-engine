"use client";

import { useMusic } from "@/components/background-music";

export function SoundButton() {
  const { volume, muted, setVolume, toggleMute } = useMusic();
  const percent = Math.round(volume * 100);

  return (
    <div className="flex items-center gap-1 rounded-full border border-purple-200/60 bg-purple-100/70 py-1 pr-2 pl-1">
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted || percent === 0 ? "Unmute music" : "Mute music"}
        className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-slate-700"
      >
        {muted || percent === 0 ? "🔇" : percent < 40 ? "🔈" : "🔊"}
      </button>
      <input
        type="range"
        min={0}
        max={100}
        value={muted ? 0 : percent}
        aria-label="Music volume"
        onChange={(event) => setVolume(Number(event.target.value) / 100)}
        className="h-1.5 w-16 cursor-pointer accent-pink-500"
      />
    </div>
  );
}
