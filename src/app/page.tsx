const sections = [
  "Live scores",
  "Fixtures & results",
  "Football news",
  "Short videos",
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <a className="text-lg font-bold tracking-tight" href="/">
          FOOTBALL<span className="text-emerald-400">+</span>
        </a>
        <span className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70">
          Platform foundation
        </span>
      </header>

      <section className="flex flex-1 flex-col justify-center py-20">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Football, all in one place
        </p>
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
          The matchday starts here.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-white/65">
          Scores, stories, and short-form football video are coming together in
          one platform. Live data will appear only after a licensed provider is
          configured.
        </p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((section) => (
            <div
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm font-medium text-white/80"
              key={section}
            >
              {section}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 pt-5 text-sm text-white/45">
        Built for football fans and creators.
      </footer>
    </main>
  );
}
