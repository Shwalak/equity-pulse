import { describe, expect, it, vi } from "vitest";
import { handler } from "./index.mjs";
import { HOT_THRESHOLD, isValidNonDisposableEmail, scoreLead } from "./score.mjs";

const base = {
  leadId: "11111111-2222-3333-4444-555555555555",
  estimate: 120_000,
  goal: "renovation",
  timeline: "this-month",
  phone: "+1 555 010 0199",
  email: "test@example.com",
};

describe("scoreLead", () => {
  it("gives a perfect lead 100 points and the hot tier", () => {
    const r = scoreLead(base);
    expect(r.score).toBe(100);
    expect(r.tier).toBe("hot");
    expect(r.hot).toBe(true);
  });

  it.each([
    [100_000, 30],
    [99_000, 20],
    [50_000, 20],
    [49_000, 10],
    [0, 10],
  ])("equity %i gives %i points", (estimate, points) => {
    expect(scoreLead({ ...base, estimate }).breakdown.equity).toBe(points);
  });

  it("scores goals", () => {
    expect(scoreLead({ ...base, goal: "renovation" }).breakdown.goal).toBe(20);
    expect(scoreLead({ ...base, goal: "debt-consolidation" }).breakdown.goal).toBe(20);
    expect(scoreLead({ ...base, goal: "tuition" }).breakdown.goal).toBe(10);
    expect(scoreLead({ ...base, goal: "rainy-day" }).breakdown.goal).toBe(10);
  });

  it("scores timelines", () => {
    expect(scoreLead({ ...base, timeline: "this-month" }).breakdown.timeline).toBe(25);
    expect(scoreLead({ ...base, timeline: "this-quarter" }).breakdown.timeline).toBe(15);
    expect(scoreLead({ ...base, timeline: "later" }).breakdown.timeline).toBe(0);
  });

  it("only awards phone points when a phone is given", () => {
    expect(scoreLead({ ...base, phone: undefined }).breakdown.phone).toBe(0);
    expect(scoreLead({ ...base, phone: "  " }).breakdown.phone).toBe(0);
    expect(scoreLead(base).breakdown.phone).toBe(15);
  });

  it("treats exactly 70 as hot and 69 or less as standard", () => {
    // 20 equity + 20 goal + 15 timeline + 15 phone = 70 (email invalid)
    const at70 = scoreLead({
      ...base,
      estimate: 60_000,
      timeline: "this-quarter",
      email: "bad",
    });
    expect(at70.score).toBe(HOT_THRESHOLD);
    expect(at70.hot).toBe(true);
    const at60 = scoreLead({
      ...base,
      estimate: 60_000,
      timeline: "this-quarter",
      phone: undefined,
      email: "bad",
    });
    expect(at60.score).toBe(55);
    expect(at60.tier).toBe("standard");
  });

  it("gives a cold lead the minimum score", () => {
    const r = scoreLead({
      estimate: 0,
      goal: "rainy-day",
      timeline: "later",
      email: "x@mailinator.com",
    });
    expect(r.score).toBe(20);
    expect(r.tier).toBe("standard");
  });
});

describe("isValidNonDisposableEmail", () => {
  it("accepts normal emails and rejects bad or disposable ones", () => {
    expect(isValidNonDisposableEmail("a@b.co")).toBe(true);
    expect(isValidNonDisposableEmail("a@Mailinator.com")).toBe(false);
    expect(isValidNonDisposableEmail("nope")).toBe(false);
    expect(isValidNonDisposableEmail(undefined)).toBe(false);
  });
});

describe("handler", () => {
  const secret = "test-secret";
  const event = (over = {}) => ({
    headers: { "x-equity-pulse-secret": secret },
    body: JSON.stringify(base),
    isBase64Encoded: false,
    ...over,
  });
  const deps = () => ({ put: vi.fn().mockResolvedValue(undefined), secret, bucket: "b" });

  it("rejects a missing or wrong secret", async () => {
    const d = deps();
    expect((await handler(event({ headers: {} }), {}, d)).statusCode).toBe(401);
    expect(
      (await handler(event({ headers: { "x-equity-pulse-secret": "nope" } }), {}, d)).statusCode,
    ).toBe(401);
    expect(d.put).not.toHaveBeenCalled();
  });

  it("scores, stores to S3 and returns tier", async () => {
    const d = deps();
    const res = await handler(event(), {}, d);
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(body).toMatchObject({ ok: true, score: 100, tier: "hot", hot: true });
    expect(d.put).toHaveBeenCalledTimes(1);
    expect(body.s3Key).toMatch(/^leads\/\d{4}\/\d{2}\/\d{2}\/.+\.json$/);
  });

  it("handles base64 bodies", async () => {
    const d = deps();
    const b64 = Buffer.from(JSON.stringify(base)).toString("base64");
    const res = await handler(event({ body: b64, isBase64Encoded: true }), {}, d);
    expect(res.statusCode).toBe(200);
  });

  it("rejects bad JSON and missing leadId", async () => {
    const d = deps();
    expect((await handler(event({ body: "{" }), {}, d)).statusCode).toBe(400);
    expect((await handler(event({ body: "{}" }), {}, d)).statusCode).toBe(422);
  });

  it("returns 502 when S3 fails", async () => {
    const d = { ...deps(), put: vi.fn().mockRejectedValue(new Error("boom")) };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await handler(event(), {}, d)).statusCode).toBe(502);
    spy.mockRestore();
  });
});
