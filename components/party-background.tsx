const STICKERS = [
  { emoji: "🎂", top: "6%", left: "5%", rotate: "-12deg", delay: "0s" },
  { emoji: "🎉", top: "12%", right: "7%", rotate: "10deg", delay: "0.4s" },
  { emoji: "💜", top: "38%", left: "2%", rotate: "-8deg", delay: "0.8s" },
  { emoji: "✨", top: "58%", right: "4%", rotate: "14deg", delay: "0.2s" },
  { emoji: "🌸", bottom: "12%", left: "8%", rotate: "8deg", delay: "1s" },
  { emoji: "🎈", bottom: "8%", right: "10%", rotate: "-14deg", delay: "0.6s" },
  { emoji: "⭐", top: "72%", left: "46%", rotate: "6deg", delay: "1.2s" },
];

export function PartyBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-pink-300/50 blur-3xl" />
      <div className="absolute top-20 -right-20 h-80 w-80 rounded-full bg-violet-300/40 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-amber-200/50 blur-3xl" />
      <div className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />

      {STICKERS.map((sticker) => (
        <span
          key={`${sticker.emoji}-${sticker.delay}`}
          className="sticker-float absolute text-3xl sm:text-4xl"
          style={{
            top: sticker.top,
            left: sticker.left,
            right: sticker.right,
            bottom: sticker.bottom,
            transform: `rotate(${sticker.rotate})`,
            animationDelay: sticker.delay,
          }}
        >
          {sticker.emoji}
        </span>
      ))}
    </div>
  );
}
