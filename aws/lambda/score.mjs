// Pure lead-scoring logic. No AWS imports, so it is easy to test.

export const HOT_THRESHOLD = 70;

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
  const domain = email.trim().toLowerCase().split("@")[1];
  return !DISPOSABLE_DOMAINS.has(domain);
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

  const phonePoints = typeof lead.phone === "string" && lead.phone.trim() !== "" ? 15 : 0;

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
