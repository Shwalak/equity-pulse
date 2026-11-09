export type Variant = "a" | "b";

export type Tracking = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  variant: Variant;
};

// Strip control characters and cap length so tracking values are safe to forward.
function clean(value: string | null): string | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 100);
  return cleaned || undefined;
}

/** Reads utm_source, utm_medium, utm_campaign and ?v=a|b (default a) from a query string. */
export function parseTracking(search: string): Tracking {
  const params = new URLSearchParams(search);
  return {
    utm_source: clean(params.get("utm_source")),
    utm_medium: clean(params.get("utm_medium")),
    utm_campaign: clean(params.get("utm_campaign")),
    variant: params.get("v")?.toLowerCase() === "b" ? "b" : "a",
  };
}
