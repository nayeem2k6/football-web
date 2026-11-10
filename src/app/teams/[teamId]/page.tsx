import type { Metadata } from "next";
import Link from "next/link";
import {
  DataAttribution,
  FootballUnavailable,
  PageIntro,
} from "@/components/football/football-state";
import { getTeam, getTeamSquad } from "@/lib/football-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Team | Football+",
  description: "Team details and squad from the configured football data provider.",
};

type PageParams = Promise<{ teamId: string }>;
type SearchParams = Promise<{ season?: string }>;

export default async function TeamPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: SearchParams;
}) {
  const [{ teamId: rawId }, query] = await Promise.all([params, searchParams]);
  const teamId = Number(rawId);
  const season = Number(query.season ?? new Date().getUTCFullYear());
  const valid =
    Number.isSafeInteger(teamId) &&
    teamId > 0 &&
    Number.isSafeInteger(season) &&
    season >= 1900 &&
    season <= 2200;
  const [teamResult, squadResult] = valid
    ? await Promise.all([getTeam(teamId), getTeamSquad(teamId)])
    : [null, null];
  const team = teamResult?.ok ? teamResult.value.data : null;
  const squad = squadResult?.ok ? squadResult.value.data : null;
  const teamMeta = teamResult?.ok ? teamResult.value.meta : null;
  const error =
    teamResult && !teamResult.ok
      ? teamResult.message
      : squadResult && !squadResult.ok
        ? squadResult.message
        : null;

  return (
    <main className="space-y-8">
      <Link className="text-sm font-semibold text-emerald-200 hover:text-emerald-100" href="/teams">
        ← All teams
      </Link>
      {team && teamMeta ? (
        <>
          <PageIntro
            description={[
              team.country,
              team.founded ? `Founded ${team.founded}` : null,
              team.national ? "National team" : null,
            ]
              .filter(Boolean)
              .join(" · ")}
            eyebrow="Team profile"
            title={team.name}
          />
          <DataAttribution
            fetchedAt={teamMeta.fetchedAt}
            freshness={teamMeta.freshness}
          />
          {team.venue ? (
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <h2 className="text-lg font-bold">Home venue</h2>
              <p className="mt-2 text-sm text-white/60">
                {[team.venue.name, team.venue.city].filter(Boolean).join(" · ") || "Venue details unavailable"}
              </p>
              <p className="mt-1 text-xs text-white/40">
                {team.venue.capacity ? `Capacity ${team.venue.capacity.toLocaleString()}` : ""}
                {team.venue.surface ? ` · ${team.venue.surface}` : ""}
              </p>
            </section>
          ) : null}
          <section className="space-y-4">
            <h2 className="text-2xl font-black">Squad</h2>
            {squad ? (
              squad.players.length ? (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {squad.players.map((player) => (
                    <li className="rounded-xl border border-white/10 bg-white/[0.025] p-4" key={player.id}>
                      <Link
                        className="font-semibold text-white hover:text-emerald-100"
                        href={`/players/${player.id}?season=${season}`}
                      >
                        {player.name}
                      </Link>
                      <p className="mt-1 text-xs text-white/45">
                        {[player.position, player.age ? `Age ${player.age}` : null]
                          .filter(Boolean)
                          .join(" · ") || "Player details"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/50">No squad was returned for this team.</p>
              )
            ) : error ? (
              <FootballUnavailable message={error} />
            ) : (
              <FootballUnavailable message="Squad information is unavailable for this team." />
            )}
          </section>
        </>
      ) : (
        <FootballUnavailable
          message={
            !valid
              ? "A valid team ID and season are required."
              : error ?? "Team data is unavailable from the configured provider."
          }
        />
      )}
    </main>
  );
}
