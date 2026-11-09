"use client";

import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { formatUSD } from "@/lib/estimate";

export function AnimatedAmount({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(value);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      if (ref.current) ref.current.textContent = formatUSD(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) ref.current.textContent = formatUSD(Math.round(latest));
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, reduce, motionValue]);

  return (
    <span ref={ref} aria-hidden="true">
      {formatUSD(value)}
    </span>
  );
}
