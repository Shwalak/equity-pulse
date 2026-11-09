import { describe, expect, it } from "vitest";
import { computeEstimate, formatUSD } from "./estimate";

describe("computeEstimate", () => {
  it("returns 80% of home value minus balance, rounded to the nearest $1,000", () => {
    expect(computeEstimate(650_000, 320_000)).toBe(200_000);
    expect(computeEstimate(100_000, 0)).toBe(80_000);
  });

  it("rounds to the nearest thousand", () => {
    // 0.8 * 333,333 = 266,666.4 -> 267,000
    expect(computeEstimate(333_333, 0)).toBe(267_000);
    // 0.8 * 333,000 = 266,400 -> 266,000
    expect(computeEstimate(333_000, 0)).toBe(266_000);
  });

  it("never goes below zero when the balance is above the 80% limit", () => {
    expect(computeEstimate(400_000, 320_000)).toBe(0);
    expect(computeEstimate(400_000, 900_000)).toBe(0);
  });

  it("returns 0 for non-finite input", () => {
    expect(computeEstimate(Number.NaN, 0)).toBe(0);
    expect(computeEstimate(Infinity, Infinity)).toBe(0);
  });
});

describe("formatUSD", () => {
  it("formats whole dollars with a currency symbol", () => {
    expect(formatUSD(200_000)).toBe("$200,000");
    expect(formatUSD(0)).toBe("$0");
  });
});
