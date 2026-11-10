import Link from "next/link";

export function ComingSoon({
  eyebrow,
  title,
  description,
  nextStep,
}: {
  eyebrow: string;
  title: string;
  description: string;
  nextStep: string;
}) {
  return (
    <main className="flex min-h-[55vh] items-center">
      <section className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/60">
          {description}
        </p>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <p className="text-sm font-semibold text-white/85">What comes next</p>
          <p className="mt-2 text-sm leading-6 text-white/50">{nextStep}</p>
        </div>
        <Link
          className="mt-8 inline-flex rounded-full bg-emerald-300 px-6 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-200"
          href="/"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
