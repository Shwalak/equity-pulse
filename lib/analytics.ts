/**
 * Thin wrapper around Google Analytics 4 (gtag). Safe to call anywhere:
 * it does nothing when GA is not configured or blocked by the visitor.
 * Never pass personal data (name, email, phone) as event parameters.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export function trackEvent(name: string, params: Record<string, string | number | undefined> = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
  } catch {
    // Analytics must never break the page.
  }
}
