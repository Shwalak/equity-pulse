# QA checklist (run before and after any change)

A short standard procedure so changes to the page or the automation are checked the same way every time. Use fake test data only.

## 1. Before you change anything
- [ ] `npm test`, `npm run lint`, `npm run typecheck` all pass (Node 22).
- [ ] Note the current live Zap version and the Lambda's last-modified time.

## 2. Page review
- [ ] Spelling, dates and names read correctly on desktop and a 375 px phone.
- [ ] Demo disclaimer is visible near the form and in the footer.
- [ ] No lender names, NMLS numbers, real rates or "approved" claims.
- [ ] All links open the right place (footer, FAQ, privacy text if present).
- [ ] Keyboard only: Tab reaches every field and button, focus is visible.

## 3. Pipeline test leads (submit each on the live page)
| Test | Input | Expect |
| --- | --- | --- |
| Hot lead | Renovation, this month, phone with 7+ digits, valid email | Sheet row, score 70+, tier hot, Slack alert, Gmail follow-up |
| Cold lead | Later, no phone | Sheet row, tier standard, no Slack, no Gmail |
| Bad phone | `-------` | Form shows a phone error, nothing reaches the Sheet |
| Formula name | `=SUM(1+1) Test` | Row shows `SUM(1+1) Test`, no formula runs |
| Honeypot | Fill the hidden field (API call) | Success response, nothing forwarded |
| Zero equity | Mortgage above 80% of home value | Estimate $0, row still logged |

## 4. Field check (Sheet row against the form)
- [ ] `receivedAt`, `name`, `email`, `phone` (shown as text, with the `+`), `goal`, `timeline`
- [ ] `homeValue`, `mortgageBalance`, `estimate` match the page
- [ ] `score` and `tier` match the scoring table in the README
- [ ] `utm_source`, `utm_campaign`, `variant` match the URL used (`?utm_source=...&v=b`)

## 5. Analytics
- [ ] GA4 Realtime shows the visit, `form_start` and `generate_lead` events.
- [ ] No name, email or phone appears in any event parameter.

## 6. After the change
- [ ] Delete or label test rows so reports stay accurate.
- [ ] Update the README and this checklist if behaviour changed.
