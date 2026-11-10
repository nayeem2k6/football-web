import type { FootballFixture } from "@/lib/football-types";

function MatchStatus({ fixture }: { fixture: FootballFixture }) {
  const live =
    fixture.status.elapsed !== null &&
    fixture.status.short !== "HT" &&
    fixture.status.short !== "FT";
  const finished = ["FT", "AET", "PEN"].includes(fixture.status.short);
  const time = new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(fixture.date));

  return (
    <div className="flex min-w-16 flex-col items-center gap-1">
      <span
        className={`text-xs font-bold ${live ? "text-rose-300" : finished ? "text-white/40" : "text-white/65"}`}
      >
        {live
          ? `${fixture.status.elapsed}'`
          : finished
            ? fixture.status.short
            : time}
      </span>
      {live ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" /> : null}
    </div>
  );
}

export function FixtureList({ fixtures }: { fixtures: FootballFixture[] }) {
  return (
    <div className="space-y-5">
      {fixtures.map((fixture) => (
        <section
          aria-label={`${fixture.league.name} matches`}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]"
          key={fixture.id}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] px-5 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
              <span>{fixture.league.name}</span>
              {fixture.league.country ? (
                <span className="text-white/35">/ {fixture.league.country}</span>
              ) : null}
            </div>
            {fixture.league.round ? (
              <span className="text-xs text-white/35">{fixture.league.round}</span>
            ) : null}
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 sm:grid-cols-[1fr_auto_1fr]">
            <div className="flex items-center justify-end gap-3 text-right">
              <span className="text-sm font-semibold text-white sm:text-base">
                {fixture.teams.home.name}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-black/20 px-3 py-2">
              <MatchStatus fixture={fixture} />
              {fixture.goals.home !== null && fixture.goals.away !== null ? (
                <span className="min-w-[4.5rem] text-center text-lg font-black tabular-nums">
                  {fixture.goals.home} <span className="text-white/30">-</span>{" "}
                  {fixture.goals.away}
                </span>
              ) : null}
            </div>
            <div className="col-span-2 flex items-center justify-start gap-3 sm:col-span-1">
              <span className="text-sm font-semibold text-white sm:text-base">
                {fixture.teams.away.name}
              </span>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
