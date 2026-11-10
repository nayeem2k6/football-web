import type { Metadata } from "next";
import { DataAttribution, FootballEmpty, FootballUnavailable, PageIntro } from "@/components/football/football-state";
import { FixtureList } from "@/components/football/fixture-list";
import { RefreshButton } from "@/components/football/refresh-button";
import { getLiveFixtures } from "@/lib/football-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Live Scores | Football+",
  description: "Follow live football scores from API-FOOTBALL.",
};

export default async function ScoresPage() {
  const result = await getLiveFixtures();

  return (
    <main className="space-y-8">
      <PageIntro
        action={{ href: "/fixtures", label: "Browse fixtures" }}
        description="Live match updates from our football data provider. Cached data is clearly marked when a live refresh is unavailable."
        eyebrow="Match centre"
        title="Live scores"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">
          {result.ok ? `${result.value.data.length} live matches` : "Live match feed"}
        </p>
        <RefreshButton />
      </div>
      {result.ok ? (
        <>
          <DataAttribution
            fetchedAt={result.value.meta.fetchedAt}
            freshness={result.value.meta.freshness}
          />
          {result.value.data.length > 0 ? (
            <FixtureList fixtures={result.value.data} />
          ) : (
            <FootballEmpty message="There are no live matches right now." />
          )}
        </>
      ) : (
        <FootballUnavailable message={result.message} />
      )}
    </main>
  );
}
