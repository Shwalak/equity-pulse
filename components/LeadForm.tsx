"use client";

import { useState } from "react";
import { TIMELINES, type GoalId, type TimelineId } from "@/lib/estimate";
import { formFieldsSchema } from "@/lib/lead-schema";
import type { Tracking } from "@/lib/tracking";

type Props = {
  goal: GoalId;
  homeValue: number;
  balance: number;
  estimate: number;
  tracking: Tracking;
};

type Status = "idle" | "sending" | "done" | "error";
type Errors = Partial<Record<"name" | "email" | "phone" | "timeline", string>>;

const inputClass =
  "mt-1.5 w-full min-h-12 rounded-xl border-2 border-ink bg-paper px-4 text-base placeholder:text-ink-soft/60";

export function LeadForm({ goal, homeValue, balance, estimate, tracking }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [ref, setRef] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const values = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      timeline: String(form.get("timeline") ?? "") as TimelineId,
    };
    const parsed = formFieldsSchema.safeParse(values);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        next[key] ??= issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          goal,
          homeValue,
          mortgageBalance: balance,
          estimate,
          ...tracking,
          website: String(form.get("website") ?? ""),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 422 && data?.fieldErrors) {
        setErrors(
          Object.fromEntries(
            Object.entries(data.fieldErrors as Record<string, string[]>).map(([k, v]) => [k, v[0]]),
          ),
        );
        setStatus("idle");
        return;
      }
      if (!res.ok || !data?.ok) throw new Error("request failed");
      setRef(String(data.leadId ?? "").slice(0, 8).toUpperCase());
      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("We could not send that. Check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-3xl border-2 border-ink bg-mint p-8" role="status">
        <h3 className="font-display text-3xl font-semibold">Got it. Check your inbox.</h3>
        <p className="mt-3 max-w-prose">
          Your estimate of <strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(estimate)}</strong> is on its
          way, along with next steps.
        </p>
        {ref && <p className="mt-4 text-sm">Reference: <span className="font-semibold tabular-nums">{ref}</span></p>}
      </div>
    );
  }

  const fieldError = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${k}-error`} className="mt-1.5 text-sm font-semibold text-coral-text">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl border-2 border-ink bg-ink p-6 text-cream sm:p-8"
      aria-labelledby="form-title"
    >
      <h3 id="form-title" className="font-display text-3xl font-semibold">
        Email me this estimate
      </h3>
      <p className="mt-2 max-w-prose text-cream/80">Use fake test details. This is a demo.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="font-semibold">Full name</label>
          <input id="name" name="name" autoComplete="name" className={`${inputClass} text-ink`} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
          <div className="[&_p]:text-mint">{fieldError("name")}</div>
        </div>
        <div>
          <label htmlFor="email" className="font-semibold">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" className={`${inputClass} text-ink`} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
          <div className="[&_p]:text-mint">{fieldError("email")}</div>
        </div>
        <div>
          <label htmlFor="phone" className="font-semibold">Phone (optional)</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={`${inputClass} text-ink`} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} />
          <div className="[&_p]:text-mint">{fieldError("phone")}</div>
        </div>
        <div>
          <label htmlFor="timeline" className="font-semibold">When do you need it?</label>
          <select id="timeline" name="timeline" defaultValue="" className={`${inputClass} text-ink`} aria-invalid={!!errors.timeline} aria-describedby={errors.timeline ? "timeline-error" : undefined}>
            <option value="" disabled>Choose one</option>
            {TIMELINES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <div className="[&_p]:text-mint">{fieldError("timeline")}</div>
        </div>
      </div>

      {/* Honeypot: hidden from people, bots tend to fill it */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="min-h-12 rounded-full bg-coral px-7 font-semibold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Email me this estimate"}
        </button>
        {status === "error" && (
          <p role="alert" className="font-semibold text-mint">{message}</p>
        )}
      </div>
    </form>
  );
}
