import type { Metadata } from "next";
import Link from "next/link";
import {
  DataAttribution,
  FootballEmpty,
  FootballUnavailable,
  PageIntro,
} from "@/components/football/football-state";
import { getTeamsByLeague } from "@/lib/football-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Teams | Football+",
  description: "Browse football teams from the configured football data provider.",
};

type SearchParams = Promise<{ leagueId?: string; season?: string }>;

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await searchParams;
  const leagueId = Number(query.leagueId);
  const season = Number(query.season);
  const requested = query.leagueId !== undefined || query.season !== undefined;
  const valid =
    Number.isSafeInteger(leagueId) &&
    leagueId > 0 &&
    Number.isSafeInteger(season) &&
    season >= 1900 &&
    season <= 2200;
  const result = valid ? await getTeamsByLeague(leagueId, season) : null;

  return (
    <main className="space-y-8">
      <PageIntro
        description="Choose a provider-supported league and season to browse its teams."
        eyebrow="Football directory"
        title="Teams"
      />
      <form className="flex flex-wrap items-end gap-3" method="get">
        <label className="space-y-1.5 text-xs font-semibold uppercase tracking-wide text-white/50">
          League ID
          <input
            className="block w-32 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-white"
            min="1"
            name="leagueId"
            required
            type="number"
            defaultValue={query.leagueId ?? ""}
          />
        </label>
        <label className="space-y-1.5 text-xs font-semibold uppercase tracking-wide text-white/50">
          Season
          <input
            className="block w-28 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2.5 text-sm text-white"
            max="2200"
            min="1900"
            name="season"
            required
            type="number"
            defaultValue={query.season ?? new Date().getUTCFullYear()}
          />
        </label>
        <button
          className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-bold text-emerald-950"
          type="submit"
        >
          Find teams
        </button>
      </form>

      {result?.ok ? (
        <>
          <DataAttribution
            fetchedAt={result.value.meta.fetchedAt}
            freshness={result.value.meta.freshness}
          />
          {result.value.data.length ? (
            <section aria-label="Teams" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.value.data.map((team) => (
                <Link
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-emerald-300/30"
                  href={`/teams/${team.id}?season=${season}`}
                  key={team.id}
                >
                  <h2 className="text-lg font-bold">{team.name}</h2>
                  <p className="mt-2 text-sm text-white/50">
                    {team.country ?? "Country not listed"}
                    {team.founded ? ` · Founded ${team.founded}` : ""}
                  </p>
                  <span className="mt-4 inline-block text-sm font-semibold text-emerald-200">
                    Team and squad →
                  </span>
                </Link>
              ))}
            </section>
          ) : (
            <FootballEmpty message={`No teams were returned for league ${leagueId} in ${season}.`} />
          )}
        </>
      ) : requested ? (
        <FootballUnavailable
          message={
            valid
              ? result && !result.ok
                ? result.message
                : "Team data could not be loaded."
              : "Enter a valid league ID and season."
          }
        />
      ) : (
        <p className="text-sm leading-6 text-white/50">
          Team results come directly from API-FOOTBALL. Enter a league ID supported by your provider plan.
        </p>
      )}
    </main>
  );
}
