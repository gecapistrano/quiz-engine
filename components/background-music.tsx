"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const DEFAULT_VOLUME = 0.8;

type MusicContextValue = {
  volume: number;
  muted: boolean;
  setVolume: (value: number) => void;
  toggleMute: () => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusic() {
  const value = useContext(MusicContext);
  if (!value) {
    throw new Error("useMusic must be used within BackgroundMusic");
  }
  return value;
}

export function BackgroundMusic({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playRef = useRef<() => void>(() => {});
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [muted, setMuted] = useState(false);
  const volumeRef = useRef(DEFAULT_VOLUME);
  const mutedRef = useRef(false);

  useEffect(() => {
    // No track ships with this repository. Drop one into public/audio and set
    // NEXT_PUBLIC_MUSIC_SRC to its path to turn the soundtrack on; without it
    // the quiz simply runs silent.
    const src = process.env.NEXT_PUBLIC_MUSIC_SRC;
    if (!src) return;

    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    const applyVolume = () => {
      audio.volume = mutedRef.current ? 0 : volumeRef.current;
    };

    const tryPlay = () => {
      applyVolume();
      void audio.play().catch(() => {
        // Browsers often block autoplay until the visitor taps once.
      });
    };

    playRef.current = tryPlay;
    applyVolume();
    tryPlay();

    const restart = () => {
      audio.currentTime = 0;
      void audio.play().catch(() => {
        // Wait for a tap if the browser paused playback.
      });
    };
    audio.addEventListener("ended", restart);

    const unlock = () => {
      void audio.play().then(() => {
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      }).catch(() => {
        // Wait for the next tap.
      });
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      audio.removeEventListener("ended", restart);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  function setVolume(value: number) {
    const next = Math.min(1, Math.max(0, value));
    volumeRef.current = next;
    setVolumeState(next);
    if (next > 0 && mutedRef.current) {
      mutedRef.current = false;
      setMuted(false);
    }
    playRef.current();
  }

  function toggleMute() {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    playRef.current();
  }

  return (
    <MusicContext.Provider value={{ volume, muted, setVolume, toggleMute }}>
      {children}
    </MusicContext.Provider>
  );
}
