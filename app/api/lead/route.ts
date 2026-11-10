import { NextResponse } from "next/server";
import { computeEstimate } from "@/lib/estimate";
import { leadPayloadSchema, type LeadRecord } from "@/lib/lead-schema";

const MAX_BODY_BYTES = 10_000;
const FORWARD_TIMEOUT_MS = 8_000;

// Keep logs useful without writing visitors' contact details to them.
function maskEmail(email: string): string {
  const [user = "", domain = ""] = email.split("@");
  return `${user.slice(0, 1)}***@${domain}`;
}

export async function POST(request: Request) {
  // 1. Basic request hygiene
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 });
  }

  // The declared length can be missing or false, so measure what actually arrived.
  let body: unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  // 2. Server-side validation (never trust the client)
  const parsed = leadPayloadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields", fieldErrors },
      { status: 422 },
    );
  }
  const data = parsed.data;

  // 3. Honeypot: bots fill hidden fields. Pretend it worked, forward nothing.
  if (data.website && data.website.trim() !== "") {
    return NextResponse.json({ ok: true, leadId: crypto.randomUUID() });
  }

  // 4. Build the lead record. The estimate is recomputed here so it cannot be spoofed.
  const lead: LeadRecord = {
    leadId: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    source: "equity-pulse-web",
    name: data.name,
    email: data.email,
    phone: data.phone ? data.phone : undefined,
    timeline: data.timeline,
    goal: data.goal,
    homeValue: data.homeValue,
    mortgageBalance: data.mortgageBalance,
    estimate: computeEstimate(data.homeValue, data.mortgageBalance),
    utm_source: data.utm_source || undefined,
    utm_medium: data.utm_medium || undefined,
    utm_campaign: data.utm_campaign || undefined,
    variant: data.variant,
  };

  const logSafe = {
    leadId: lead.leadId,
    email: maskEmail(lead.email),
    goal: lead.goal,
    timeline: lead.timeline,
    estimate: lead.estimate,
    utm_source: lead.utm_source,
    utm_campaign: lead.utm_campaign,
    variant: lead.variant,
  };

  // 5. Forward to the automation webhook if configured. Never block the visitor on it.
  const webhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  if (!webhookUrl) {
    console.info("[lead] ZAPIER_WEBHOOK_URL not set, logging only:", logSafe);
  } else {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(FORWARD_TIMEOUT_MS),
      });
      if (!res.ok) {
        console.error("[lead] webhook responded with an error status:", res.status, logSafe);
      } else {
        console.info("[lead] forwarded:", logSafe);
      }
    } catch (error) {
      console.error("[lead] webhook forward failed:", error, logSafe);
    }
  }

  return NextResponse.json({ ok: true, leadId: lead.leadId });
}
