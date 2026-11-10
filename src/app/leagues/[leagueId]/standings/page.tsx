import type { Metadata } from "next";
import Link from "next/link";
import { DataAttribution, FootballUnavailable, PageIntro } from "@/components/football/football-state";
import { getStandings } from "@/lib/football-api";
import type { FootballStandingRow } from "@/lib/football-types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "League Tables | Football+",
  description: "Current league standings from API-FOOTBALL.",
};

type PageParams = Promise<{ leagueId: string }>;
type SearchParams = Promise<{ season?: string | string[] }>;

function StandingsTable({ rows }: { rows: FootballStandingRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-white/45">
          <tr>
            <th className="px-4 py-4 font-semibold">#</th>
            <th className="px-4 py-4 font-semibold">Club</th>
            <th className="px-3 py-4 text-center font-semibold">P</th>
            <th className="px-3 py-4 text-center font-semibold">W</th>
            <th className="px-3 py-4 text-center font-semibold">D</th>
            <th className="px-3 py-4 text-center font-semibold">L</th>
            <th className="px-3 py-4 text-center font-semibold">GD</th>
            <th className="px-4 py-4 text-right font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.07]">
          {rows.map((row) => (
            <tr className="transition hover:bg-white/[0.025]" key={row.team.id}>
              <td className="px-4 py-4 tabular-nums text-white/45">{row.rank}</td>
              <td className="px-4 py-4 font-semibold text-white">{row.team.name}</td>
              <td className="px-3 py-4 text-center tabular-nums text-white/65">{row.all.played}</td>
              <td className="px-3 py-4 text-center tabular-nums text-white/65">{row.all.win}</td>
              <td className="px-3 py-4 text-center tabular-nums text-white/65">{row.all.draw}</td>
              <td className="px-3 py-4 text-center tabular-nums text-white/65">{row.all.lose}</td>
              <td className="px-3 py-4 text-center tabular-nums text-white/65">{row.goalsDiff}</td>
              <td className="px-4 py-4 text-right font-black tabular-nums text-emerald-200">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function StandingsPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: SearchParams;
}) {
  const [{ leagueId: leagueValue }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const querySeason = Array.isArray(query.season)
    ? query.season[0]
    : query.season;
  const season = Number(querySeason ?? new Date().getUTCFullYear());
  const leagueId = Number(leagueValue);
  const validParameters =
    Number.isSafeInteger(leagueId) &&
    leagueId > 0 &&
    Number.isSafeInteger(season) &&
    season >= 1900 &&
    season <= 2200;
  const result = validParameters
    ? await getStandings(leagueId, season)
    : null;
  const league = result?.ok ? result.value.data[0]?.league : null;

  return (
    <main className="space-y-8">
      <PageIntro
        action={{ href: "/fixtures", label: "View fixtures" }}
        description="Standings are supplied by the football data provider. Select a league and season in the URL."
        eyebrow="Competitions"
        title={league?.name ?? "League table"}
      />
      <form className="flex flex-wrap items-end gap-3" method="get">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wide text-white/45" htmlFor="season">
            Season
          </label>
          <input
            className="w-28 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-white"
            defaultValue={validParameters ? season : new Date().getUTCFullYear()}
            id="season"
            max="2200"
            min="1900"
            name="season"
            type="number"
          />
        </div>
        <button
          className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-200"
          type="submit"
        >
          Update season
        </button>
        <Link
          className="pb-2.5 text-xs text-white/40 hover:text-white/70"
          href="/leagues/39/standings"
        >
          Premier League
        </Link>
      </form>
      {!validParameters ? (
        <FootballUnavailable message="A valid league ID and season are required." />
      ) : result?.ok ? (
        <>
          <DataAttribution
            fetchedAt={result.value.meta.fetchedAt}
            freshness={result.value.meta.freshness}
          />
          {league && result.value.data[0].standings.length > 0 ? (
            result.value.data[0].standings.map((group, index) => (
              <section className="space-y-4" key={`${league.id}-${index}`}>
                {result.value.data[0].standings.length > 1 ? (
                  <h2 className="text-lg font-bold text-white">
                    {group[0]?.group ?? `Group ${index + 1}`}
                  </h2>
                ) : null}
                <StandingsTable rows={group} />
              </section>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 p-8 text-center text-white/55">
              No standings were returned for league {leagueId} in {season}.
            </div>
          )}
        </>
      ) : (
        <FootballUnavailable
          message={result && !result.ok ? result.message : "League table unavailable."}
        />
      )}
    </main>
  );
}
