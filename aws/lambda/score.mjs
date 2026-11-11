// Pure lead-scoring logic. No AWS imports, so it is easy to test.

export const HOT_THRESHOLD = 70;

const GOAL_LABELS = {
  renovation: "renovation",
  "debt-consolidation": "debt consolidation",
  tuition: "tuition",
  "rainy-day": "rainy-day fund",
};
// Worded to read naturally in "discuss your ___ timeline".
const TIMELINE_LABELS = {
  "this-month": "one-month",
  "this-quarter": "three-month",
  later: "flexible",
};

/** Human-friendly strings for the follow-up email, so Zapier needs no formatting steps. */
export function friendlyFields(lead) {
  const n = Number(lead?.estimate);
  const amount = Number.isFinite(n) && n > 0 ? n : 0;
  return {
    estimateFormatted: `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    goalLabel: GOAL_LABELS[lead?.goal] ?? "your goal",
    timelineLabel: TIMELINE_LABELS[lead?.timeline] ?? "your timeline",
  };
}

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "throwawaymail.com",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** True for a well-formed email whose domain is not a known throwaway provider. */
export function isValidNonDisposableEmail(email) {
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) return false;
  // Normalise (trailing dot) and check the domain and every parent domain,
  // so sub.mailinator.com is caught as well as mailinator.com.
  const labels = email.trim().toLowerCase().split("@")[1].replace(/\.$/, "").split(".");
  for (let i = 0; i < labels.length - 1; i += 1) {
    if (DISPOSABLE_DOMAINS.has(labels.slice(i).join("."))) return false;
  }
  return true;
}

/** True when the phone has at least 7 digits, so "-------" earns nothing. */
export function hasUsablePhone(phone) {
  return typeof phone === "string" && phone.replace(/\D/g, "").length >= 7;
}

/**
 * Score a lead from 0 to 100 and return the points breakdown.
 *   Equity   >= $100k +30, >= $50k +20, else +10
 *   Goal     renovation / debt-consolidation +20, other +10
 *   Timeline this-month +25, this-quarter +15, later +0
 *   Phone    provided +15
 *   Email    valid and not disposable +10
 */
export function scoreLead(lead) {
  const equity = Number(lead.estimate) || 0;
  const equityPoints = equity >= 100_000 ? 30 : equity >= 50_000 ? 20 : 10;

  const goalPoints =
    lead.goal === "renovation" || lead.goal === "debt-consolidation" ? 20 : 10;

  const timelinePoints =
    lead.timeline === "this-month" ? 25 : lead.timeline === "this-quarter" ? 15 : 0;

  const phonePoints = hasUsablePhone(lead.phone) ? 15 : 0;

  const emailPoints = isValidNonDisposableEmail(lead.email) ? 10 : 0;

  const score = equityPoints + goalPoints + timelinePoints + phonePoints + emailPoints;
  const hot = score >= HOT_THRESHOLD;

  return {
    score,
    tier: hot ? "hot" : "standard",
    hot,
    breakdown: {
      equity: equityPoints,
      goal: goalPoints,
      timeline: timelinePoints,
      phone: phonePoints,
      email: emailPoints,
    },
  };
}
