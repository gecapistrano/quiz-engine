const IG_URL = "https://instagram.com/gemcapistrano";

export function InstagramIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5ZM12 7.25A4.75 4.75 0 1 1 12 16.75 4.75 4.75 0 0 1 12 7.25Zm0 1.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Zm5.13-2.38a1.13 1.13 0 1 1 0 2.25 1.13 1.13 0 0 1 0-2.25Z" />
    </svg>
  );
}

export function InstagramLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={IG_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="@gemcapistrano on Instagram"
      className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-pink-500 text-white shadow-lg shadow-pink-500/30 transition hover:bg-pink-600 ${className}`}
    >
      <InstagramIcon />
    </a>
  );
}
