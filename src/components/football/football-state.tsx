import Link from "next/link";

export function FootballUnavailable({ message }: { message: string }) {
  return (
    <section
      aria-live="polite"
      className="rounded-2xl border border-amber-200/20 bg-amber-100/[0.04] p-6 sm:p-8"
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
        Data unavailable
      </p>
      <h2 className="mt-3 text-xl font-bold text-white">
        We couldn&apos;t load football data
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{message}</p>
      <p className="mt-3 text-xs leading-5 text-white/40">
        Scores and tables are supplied by a live data provider. We never
        substitute sample results.
      </p>
    </section>
  );
}

export function FootballEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-10 text-center">
      <p className="text-lg font-semibold text-white">{message}</p>
      <p className="mt-2 text-sm text-white/45">
        Try another date or check back when matches are scheduled.
      </p>
    </div>
  );
}

export function DataAttribution({
  freshness,
  fetchedAt,
}: {
  freshness: "fresh" | "stale";
  fetchedAt: string;
}) {
  const formattedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(fetchedAt));

  return (
    <p className="text-xs text-white/40">
      Source: API-FOOTBALL · Updated {formattedDate} UTC
      {freshness === "stale" ? " · Showing cached data" : ""}
    </p>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-white/55">
          {description}
        </p>
      </div>
      {action ? (
        <Link
          className="w-fit rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-emerald-300/50 hover:text-emerald-200"
          href={action.href}
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
