const steps = [
  { title: "Tell us the basics", body: "Home value, what you still owe, and what you would use the money for." },
  { title: "See the number move", body: "Your estimate updates as you slide. No sign-up and no credit check to play with it." },
  { title: "Get a follow-up", body: "Leave your details and a short, personal email arrives with your estimate." },
];

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8" aria-labelledby="how">
      <h2 id="how" className="font-display text-3xl font-semibold sm:text-4xl">
        Three steps, about a minute
      </h2>
      <ol className="mt-8 grid gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-3xl border-2 border-ink bg-paper p-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral font-semibold text-ink">
              {i + 1}
            </span>
            <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-ink-soft">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
