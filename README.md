# Equity Pulse

A mobile-first campaign landing page and lead automation pipeline for a home equity offer. Move three sliders, see an illustrative estimate, and leave details to get a follow-up email.

> **Disclaimer:** an independent concept project. Not a lender, not affiliated with any lender, no real rates or offers. Estimates are illustrative (80% combined loan-to-value rule). Use fake test data only.

## What it shows

- **Vercel / Next.js:** App Router landing page, UTM capture, A/B headline (`?v=b`), generated OG image.
- **Zapier:** webhook-triggered multi-step Zap (Sheet row, Slack alert for hot leads, Gmail follow-up).
- **AWS:** Lambda Function URL scoring leads and storing raw JSON in S3.
- **Claude Code / Codex:** built with Claude Code; Codex used for test and review passes.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the diagram, payload and scoring.

## Run locally

```bash
npm install
cp .env.example .env.local   # optionally add ZAPIER_WEBHOOK_URL
npm run dev
npm test && npm run lint && npm run typecheck
```

Without `ZAPIER_WEBHOOK_URL` the API route logs the lead (email masked) and still returns success.

## Deploy

Import the repo in Vercel, add `ZAPIER_WEBHOOK_URL` (and optionally `NEXT_PUBLIC_SITE_URL`), deploy.

## Estimate formula

`max(0, 0.80 x homeValue - mortgageBalance)`, rounded to the nearest $1,000.

## Credits

Fonts: Fraunces and DM Sans via Fontsource, SIL Open Font License. Code: MIT.
