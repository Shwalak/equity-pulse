/**
 * Equity Pulse estimator.
 *
 * Illustrative only. Many lenders cap total borrowing against a home at a share of
 * its value; that share varies by lender, property and borrower. We use 80% as a
 * simple, clearly-labelled assumption. This is NOT a quote or an offer of credit.
 */

export const MAX_COMBINED_LTV = 0.8;
export const ROUND_TO = 1_000;

export const HOME_VALUE_RANGE = {
  min: 100_000,
  max: 2_000_000,
  step: 5_000,
  default: 650_000,
} as const;

export const BALANCE_RANGE = {
  min: 0,
  max: 1_500_000,
  step: 5_000,
  default: 320_000,
} as const;

export const GOALS = [
  { id: "renovation", label: "Renovation" },
  { id: "debt-consolidation", label: "Debt consolidation" },
  { id: "tuition", label: "Tuition" },
  { id: "rainy-day", label: "Rainy-day fund" },
] as const;

export type GoalId = (typeof GOALS)[number]["id"];

export const GOAL_IDS = GOALS.map((g) => g.id) as [GoalId, ...GoalId[]];

export const TIMELINES = [
  { id: "this-month", label: "This month" },
  { id: "this-quarter", label: "This quarter" },
  { id: "later", label: "Later" },
] as const;

export type TimelineId = (typeof TIMELINES)[number]["id"];

export const TIMELINE_IDS = TIMELINES.map((t) => t.id) as [TimelineId, ...TimelineId[]];

/** max(0, 0.80 x home value - mortgage balance), rounded to the nearest $1,000. */
export function computeEstimate(homeValue: number, mortgageBalance: number): number {
  const raw = MAX_COMBINED_LTV * homeValue - mortgageBalance;
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.round(raw / ROUND_TO) * ROUND_TO;
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatUSD(value: number): string {
  return usd.format(Number.isFinite(value) ? value : 0);
}
