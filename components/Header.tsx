export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <a href="#top" className="flex items-center gap-2.5 font-display text-xl font-semibold">
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
          <rect width="32" height="32" rx="9" fill="#0F1B2D" />
          <path d="M5 18h5l3-7 5 12 3-8 2 3h4" fill="none" stroke="#FF6B4A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Equity Pulse
      </a>
      <a
        href="#estimate"
        className="rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold transition-colors hover:bg-ink hover:text-cream"
      >
        Try the estimator
      </a>
    </header>
  );
}
