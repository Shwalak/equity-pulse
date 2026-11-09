"use client";

import { useId } from "react";
import {
  BALANCE_RANGE,
  GOALS,
  HOME_VALUE_RANGE,
  formatUSD,
  type GoalId,
} from "@/lib/estimate";
import { AnimatedAmount } from "./AnimatedAmount";

type Props = {
  homeValue: number;
  balance: number;
  goal: GoalId;
  estimate: number;
  onHomeValue: (v: number) => void;
  onBalance: (v: number) => void;
  onGoal: (g: GoalId) => void;
};

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        <output htmlFor={id} className="font-display text-xl font-semibold tabular-nums">
          {formatUSD(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="slider mt-1"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ["--pct" as string]: `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Estimator({ homeValue, balance, goal, estimate, onHomeValue, onBalance, onGoal }: Props) {
  const goalLabel = GOALS.find((g) => g.id === goal)?.label ?? "";
  const ltv = homeValue > 0 ? Math.round((balance / homeValue) * 100) : 0;

  return (
    <div id="estimate" className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start lg:gap-12">
      <div className="space-y-7 rounded-3xl border-2 border-ink bg-paper p-6 sm:p-8">
        <Slider label="Home value" value={homeValue} {...HOME_VALUE_RANGE} onChange={onHomeValue} />
        <Slider label="What you still owe" value={balance} {...BALANCE_RANGE} onChange={onBalance} />
        <fieldset>
          <legend className="font-semibold">What would you use it for?</legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {GOALS.map((g) => {
              const active = g.id === goal;
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onGoal(g.id)}
                  className={`min-h-11 rounded-full border-2 border-ink px-4 text-sm font-semibold transition-colors ${
                    active ? "bg-coral text-ink" : "bg-transparent text-ink hover:bg-cream-deep"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="px-2 pb-4 pt-3 lg:sticky lg:top-6">
        <div className="receipt px-6 pb-7 pt-8 sm:px-8" role="group" aria-label="Equity estimate">
          <p className="text-sm font-semibold text-ink-soft">Estimated equity you could tap</p>
          <p className="mt-1 font-display text-5xl font-semibold tabular-nums sm:text-6xl">
            <AnimatedAmount value={estimate} />
          </p>
          <p className="sr-only" aria-live="polite">
            Estimated equity {formatUSD(estimate)}
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <div className="receipt-line flex justify-between pb-2">
              <span>Home value</span>
              <span className="tabular-nums">{formatUSD(homeValue)}</span>
            </div>
            <div className="receipt-line flex justify-between pb-2">
              <span>80% of home value</span>
              <span className="tabular-nums">{formatUSD(homeValue * 0.8)}</span>
            </div>
            <div className="receipt-line flex justify-between pb-2">
              <span>Minus what you owe ({ltv}%)</span>
              <span className="tabular-nums">−{formatUSD(balance)}</span>
            </div>
            <div className="flex justify-between">
              <span>Planned use</span>
              <span>{goalLabel}</span>
            </div>
          </div>
          <p className="mt-5 text-xs text-ink-soft">
            Illustrative only. Not an offer, quote or credit decision.
          </p>
        </div>
      </div>
    </div>
  );
}
