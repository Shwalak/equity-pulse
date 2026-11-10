// AWS Lambda (Node.js 22, Function URL). Scores a lead and stores the raw JSON in S3.
// Environment variables:
//   SHARED_SECRET  value Zapier must send in the x-equity-pulse-secret header
//   BUCKET_NAME    S3 bucket for raw lead JSON (same region as the function)
import { timingSafeEqual } from "node:crypto";
import { scoreLead } from "./score.mjs";

// The AWS SDK v3 ships inside the Lambda Node.js runtime, so it is imported lazily.
// That keeps local tests free of the SDK: they inject their own `put` function.
let s3Client;
async function putObject(input) {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  s3Client ??= new S3Client({});
  await s3Client.send(new PutObjectCommand(input));
}
const SECRET_HEADER = "x-equity-pulse-secret";
const MAX_BODY_BYTES = 20_000;

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function secretMatches(provided, expected) {
  if (typeof provided !== "string" || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function maskEmail(email) {
  if (typeof email !== "string") return "(none)";
  const [user = "", domain = ""] = email.split("@");
  return `${user.slice(0, 1)}***@${domain}`;
}

export const handler = async (event, _context, deps = {}) => {
  const put = deps.put ?? putObject;
  const secret = deps.secret ?? process.env.SHARED_SECRET;
  const bucket = deps.bucket ?? process.env.BUCKET_NAME;

  // Function URL headers arrive lower-cased.
  if (!secretMatches(event?.headers?.[SECRET_HEADER], secret)) {
    return respond(401, { ok: false, error: "Unauthorized" });
  }

  let raw = event.body ?? "";
  if (event.isBase64Encoded) raw = Buffer.from(raw, "base64").toString("utf8");
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
    return respond(413, { ok: false, error: "Payload too large" });
  }

  let lead;
  try {
    lead = JSON.parse(raw);
  } catch {
    return respond(400, { ok: false, error: "Invalid JSON" });
  }
  if (!lead || typeof lead !== "object" || typeof lead.leadId !== "string" || !lead.leadId) {
    return respond(422, { ok: false, error: "leadId is required" });
  }
  if (!/^[A-Za-z0-9-]{8,64}$/.test(lead.leadId)) {
    return respond(422, { ok: false, error: "leadId has an invalid format" });
  }

  const result = scoreLead(lead);
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "/");
  const key = `leads/${day}/${lead.leadId}.json`;

  try {
    await put({
      Bucket: bucket,
      Key: key,
      ContentType: "application/json",
      // Never trust client-supplied scoring fields: drop them before storing.
      Body: JSON.stringify({ ...lead, hot: undefined, breakdown: undefined, score: result.score, tier: result.tier }),
    });
  } catch (error) {
    console.error("[lambda] S3 write failed", error?.name, lead.leadId);
    return respond(502, { ok: false, error: "Could not store lead" });
  }

  console.info("[lambda] scored", {
    leadId: lead.leadId,
    email: maskEmail(lead.email),
    score: result.score,
    tier: result.tier,
  });

  return respond(200, {
    ok: true,
    leadId: lead.leadId,
    score: result.score,
    tier: result.tier,
    hot: result.hot,
    breakdown: result.breakdown,
    s3Key: key,
  });
};
