const faqs = [
  { q: "Is this an offer or a quote?", a: "No. It is an illustrative estimate from a simple rule: 80% of your home value minus what you owe, rounded to the nearest $1,000." },
  { q: "Will this affect my credit?", a: "No. Nothing here checks your credit, and the estimator needs no personal details." },
  { q: "What happens after I submit the form?", a: "Your details go through an automated workflow that scores the request and sends a follow-up email. It is a demo, so use fake test data." },
  { q: "Why does my number show $0?", a: "When what you owe is close to or above 80% of your home value, this rule leaves no room. Try lowering the balance to see how it changes." },
  { q: "Who built this?", a: "A marketing automation showcase built with Next.js on Vercel, with Zapier and AWS behind the form. See the README for the architecture." },
];

export function FAQ() {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8" aria-labelledby="faq">
      <h2 id="faq" className="font-display text-3xl font-semibold sm:text-4xl">
        Questions people ask
      </h2>
      <div className="mt-8 divide-y-2 divide-ink/15 border-y-2 border-ink/15">
        {faqs.map((f) => (
          <details key={f.q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
              {f.q}
              <span className="text-2xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <p className="mt-3 text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
