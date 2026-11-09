import { describe, expect, it } from "vitest";
import { formFieldsSchema, leadPayloadSchema } from "./lead-schema";

const validPayload = {
  name: "Test Person",
  email: "Test.Person@Example.com",
  phone: "",
  timeline: "this-month",
  goal: "renovation",
  homeValue: 650_000,
  mortgageBalance: 320_000,
  variant: "a",
};

describe("formFieldsSchema", () => {
  it("accepts a valid form and normalises the email", () => {
    const result = formFieldsSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("test.person@example.com");
  });

  it("rejects an invalid email", () => {
    const result = formFieldsSchema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("allows a blank phone number but rejects a malformed one", () => {
    expect(formFieldsSchema.safeParse({ ...validPayload, phone: "" }).success).toBe(true);
    expect(formFieldsSchema.safeParse({ ...validPayload, phone: "+91 98765 43210" }).success).toBe(true);
    expect(formFieldsSchema.safeParse({ ...validPayload, phone: "abc" }).success).toBe(false);
  });

  it("rejects an unknown timeline", () => {
    expect(formFieldsSchema.safeParse({ ...validPayload, timeline: "someday" }).success).toBe(false);
  });
});

describe("leadPayloadSchema", () => {
  it("accepts a full payload and defaults the variant", () => {
    const { variant: _variant, ...withoutVariant } = validPayload;
    void _variant;
    const result = leadPayloadSchema.safeParse(withoutVariant);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.variant).toBe("a");
  });

  it("rejects out-of-range home values and unknown goals", () => {
    expect(leadPayloadSchema.safeParse({ ...validPayload, homeValue: 5 }).success).toBe(false);
    expect(leadPayloadSchema.safeParse({ ...validPayload, goal: "vacation" }).success).toBe(false);
  });

  it("caps tracking values at 100 characters", () => {
    const long = "x".repeat(101);
    expect(leadPayloadSchema.safeParse({ ...validPayload, utm_source: long }).success).toBe(false);
  });
});
