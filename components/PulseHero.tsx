"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  BALANCE_RANGE,
  HOME_VALUE_RANGE,
  computeEstimate,
  type GoalId,
} from "@/lib/estimate";
import { parseTracking } from "@/lib/tracking";
import { Estimator } from "./Estimator";
import { LeadForm } from "./LeadForm";

const subscribe = () => () => {};
const getSearch = () => window.location.search;
const getServerSearch = () => "";

const HEADLINES = {
  a: "See what your home could unlock.",
  b: "Your home may be holding more than you think.",
} as const;

export function PulseHero() {
  const search = useSyncExternalStore(subscribe, getSearch, getServerSearch);
  const tracking = useMemo(() => parseTracking(search), [search]);
  const reduce = useReducedMotion();

  const [homeValue, setHomeValue] = useState<number>(HOME_VALUE_RANGE.default);
  const [balance, setBalance] = useState<number>(BALANCE_RANGE.default);
  const [goal, setGoal] = useState<GoalId>("renovation");
  const estimate = computeEstimate(homeValue, balance);

  return (
    <section id="top" className="mx-auto w-full max-w-6xl px-5 pb-12 pt-6 sm:px-8 sm:pt-12">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10 max-w-3xl"
      >
        <h1 className="font-display text-[2.6rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          {HEADLINES[tracking.variant]}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-soft">
          Slide three controls and watch your estimate move. It takes about a minute, and nothing
          here touches your credit.
        </p>
      </motion.div>

      <Estimator
        homeValue={homeValue}
        balance={balance}
        goal={goal}
        estimate={estimate}
        onHomeValue={setHomeValue}
        onBalance={setBalance}
        onGoal={setGoal}
      />

      <div className="relative mt-10">
        <LeadForm
          goal={goal}
          homeValue={homeValue}
          balance={balance}
          estimate={estimate}
          tracking={tracking}
        />
      </div>
    </section>
  );
}
