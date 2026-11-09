# Lead scoring Lambda

Scores a lead, writes the raw JSON to S3, and returns `score` and `tier`. Zapier calls it through a **Lambda Function URL** (no API Gateway).

- Runtime: Node.js 22, region `ap-southeast-2` (Sydney)
- Handler: `index.handler`
- Files: `index.mjs` (handler), `score.mjs` (scoring, pure and tested)
- Dependencies: none to install. The AWS SDK v3 ships with the runtime.

## Scoring (hot lead = 70 or more)

| Signal | Points |
| --- | --- |
| Estimated equity >= $100k / >= $50k / below | 30 / 20 / 10 |
| Goal: renovation or debt consolidation / other | 20 / 10 |
| Timeline: this month / this quarter / later | 25 / 15 / 0 |
| Phone provided | 15 |
| Valid, non-disposable email | 10 |

## Request and response

Zapier sends `POST` with header `x-equity-pulse-secret: <SHARED_SECRET>` and the lead JSON from `/api/lead` as the body.

```json
{ "ok": true, "leadId": "...", "score": 100, "tier": "hot", "hot": true,
  "breakdown": { "equity": 30, "goal": 20, "timeline": 25, "phone": 15, "email": 10 },
  "s3Key": "leads/2026/11/09/<leadId>.json" }
```

Errors: `401` wrong or missing secret, `400` bad JSON, `413` body over 20 kB, `422` missing `leadId`, `502` S3 write failed.

## Configuration (Lambda environment variables)

| Name | Value |
| --- | --- |
| `SHARED_SECRET` | A long random string. Paste the same value into the Zap's header. |
| `BUCKET_NAME` | Your S3 bucket in `ap-southeast-2` |

## Least-privilege execution role

Attach only this inline policy (plus the basic logging policy `AWSLambdaBasicExecutionRole`). Replace `YOUR_BUCKET`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET/leads/*"
    }
  ]
}
```

## Deploy (console)

1. Lambda, Create function, Author from scratch, runtime Node.js 22, region ap-southeast-2.
2. Use the role above.
3. Paste `score.mjs` and `index.mjs` as two files in the code editor (or zip both and upload), then Deploy.
4. Add the two environment variables.
5. Configuration, Function URL, Create, auth type `NONE` (the shared secret is the guard), then copy the URL.
6. Test with a fake lead (see below).

## Local tests

```bash
npm test
```

## Try it with fake data

```bash
curl -s -X POST "$FUNCTION_URL" \
  -H "content-type: application/json" \
  -H "x-equity-pulse-secret: $SHARED_SECRET" \
  -d '{"leadId":"test-0001-aaaa","estimate":120000,"goal":"renovation","timeline":"this-month","phone":"+1 555 010 0199","email":"test@example.com"}'
```
