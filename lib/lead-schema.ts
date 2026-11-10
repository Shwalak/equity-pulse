import { z } from "zod";
import { BALANCE_RANGE, GOAL_IDS, HOME_VALUE_RANGE, TIMELINE_IDS } from "./estimate";

/** Fields the visitor types into the form. Used on the client and the server. */
/**
 * Spreadsheets treat a leading = + - @ as a formula. Strip those from free-text
 * fields so a hostile name cannot run a formula when the lead lands in a Sheet.
 */
const stripFormulaPrefix = (v: string) => v.replace(/^[=+\-@\t\r\s]+/, "");

export const formFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .transform(stripFormulaPrefix)
    .pipe(
      z
        .string()
        .min(2, "Please enter your name")
        .max(80, "That name is a bit long"),
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address")),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .refine(
      (v) => v === "" || (/^\+?[0-9 ()-]{7,20}$/.test(v) && v.replace(/\D/g, "").length >= 7),
      "Enter a valid phone number, or leave it blank",
    )
    .optional(),
  timeline: z.enum(TIMELINE_IDS, { error: "Choose a timeline" }),
});

const optionalTracking = z.string().trim().max(100).transform(stripFormulaPrefix).optional();

/** Full payload accepted by POST /api/lead. */
export const leadPayloadSchema = formFieldsSchema.extend({
  goal: z.enum(GOAL_IDS),
  homeValue: z.number().int().min(HOME_VALUE_RANGE.min).max(HOME_VALUE_RANGE.max),
  mortgageBalance: z.number().int().min(BALANCE_RANGE.min).max(BALANCE_RANGE.max),
  // Sent by the client for convenience. The server recomputes it and ignores this value.
  estimate: z.number().min(0).max(10_000_000).optional(),
  utm_source: optionalTracking,
  utm_medium: optionalTracking,
  utm_campaign: optionalTracking,
  variant: z.enum(["a", "b"]).default("a"),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(200).optional(),
});

export type FormFields = z.infer<typeof formFieldsSchema>;
export type LeadPayload = z.infer<typeof leadPayloadSchema>;

/** Lead record forwarded to the automation webhook (Zapier). */
export type LeadRecord = {
  leadId: string;
  receivedAt: string;
  source: "equity-pulse-web";
  name: string;
  email: string;
  phone?: string;
  timeline: LeadPayload["timeline"];
  goal: LeadPayload["goal"];
  homeValue: number;
  mortgageBalance: number;
  estimate: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  variant: "a" | "b";
};
