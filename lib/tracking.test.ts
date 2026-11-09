import { describe, expect, it } from "vitest";
import { parseTracking } from "./tracking";

describe("parseTracking", () => {
  it("defaults to variant a with no params", () => {
    expect(parseTracking("")).toEqual({
      utm_source: undefined,
      utm_medium: undefined,
      utm_campaign: undefined,
      variant: "a",
    });
  });

  it("reads UTMs and variant b", () => {
    const t = parseTracking("?utm_source=meta&utm_medium=paid&utm_campaign=heloc-nov&v=b");
    expect(t).toMatchObject({ utm_source: "meta", utm_medium: "paid", utm_campaign: "heloc-nov", variant: "b" });
  });

  it("treats unknown variants as a and truncates long values", () => {
    const t = parseTracking(`?v=zzz&utm_source=${"y".repeat(150)}`);
    expect(t.variant).toBe("a");
    expect(t.utm_source).toHaveLength(100);
  });
});
