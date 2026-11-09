# Architecture and lead scoring

```mermaid
flowchart LR
  A[Visitor on Vercel landing page] --> B[POST /api/lead]
  B -->|validate, honeypot, recompute estimate| C[Zapier Catch Hook]
  C --> D[AWS Lambda Function URL]
  D -->|raw JSON| E[(S3 bucket)]
  D -->|score + tier| C
  C --> F[Google Sheet row]
  C -->|hot leads only| G[Slack alert]
  C --> H[Personalised Gmail email]
```

## Lead payload

`source, leadId, receivedAt, name, email, phone, timeline, goal, homeValue, mortgageBalance, estimate, utm_source, utm_medium, utm_campaign, variant`

## Scoring (hot lead at 70 or more)

| Signal | Points |
| --- | --- |
| Estimated equity $100k or more / $50k or more / below | 30 / 20 / 10 |
| Goal renovation or debt consolidation / other | 20 / 10 |
| Timeline this month / this quarter | 25 / 15 |
| Phone provided | 15 |
| Valid, non-disposable email | 10 |

## Safety choices

Honeypot field, server-side validation, estimate recomputed on the server, 10 kB body cap, webhook call with an 8 second timeout inside try/catch (the visitor still sees success if the webhook is down), emails masked in logs, no long-lived AWS keys.
