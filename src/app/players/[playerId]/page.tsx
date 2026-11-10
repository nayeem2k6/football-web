import type { Metadata } from "next";
import Link from "next/link";
import {
  DataAttribution,
  FootballUnavailable,
  PageIntro,
} from "@/components/football/football-state";
import { getPlayer } from "@/lib/football-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Player | Football+",
  description: "Player details from the configured football data provider.",
};

type PageParams = Promise<{ playerId: string }>;
type SearchParams = Promise<{ season?: string }>;

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: PageParams;
  searchParams: SearchParams;
}) {
  const [{ playerId: rawId }, query] = await Promise.all([params, searchParams]);
  const playerId = Number(rawId);
  const season = Number(query.season ?? new Date().getUTCFullYear());
  const valid =
    Number.isSafeInteger(playerId) &&
    playerId > 0 &&
    Number.isSafeInteger(season) &&
    season >= 1900 &&
    season <= 2200;
  const result = valid ? await getPlayer(playerId, season) : null;
  const player = result?.ok ? result.value.data : null;
  const meta = result?.ok ? result.value.meta : null;

  return (
    <main className="space-y-8">
      <Link className="text-sm font-semibold text-emerald-200 hover:text-emerald-100" href="/teams">
        ← Teams
      </Link>
      {player && meta ? (
        <>
          <PageIntro
            description={[player.nationality, player.age ? `Age ${player.age}` : null]
              .filter(Boolean)
              .join(" · ")}
            eyebrow="Player profile"
            title={player.name}
          />
          <DataAttribution
            fetchedAt={meta.fetchedAt}
            freshness={meta.freshness}
          />
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Date of birth", player.birth.date],
              ["Place of birth", player.birth.place],
              ["Birth country", player.birth.country],
              ["Height", player.height],
              ["Weight", player.weight],
            ]
              .filter((entry): entry is [string, string] => Boolean(entry[1]))
              .map(([label, value]) => (
                <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4" key={label}>
                  <dt className="text-xs uppercase tracking-wide text-white/40">{label}</dt>
                  <dd className="mt-2 text-sm font-semibold text-white/80">{value}</dd>
                </div>
              ))}
          </dl>
        </>
      ) : (
        <FootballUnavailable
          message={
            !valid
              ? "A valid player ID and season are required."
              : result && !result.ok
                ? result.message
                : "Player data is unavailable from the configured provider."
          }
        />
      )}
    </main>
  );
}
