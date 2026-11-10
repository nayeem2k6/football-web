import type { Metadata } from "next";
import { DataAttribution, FootballEmpty, FootballUnavailable, PageIntro } from "@/components/football/football-state";
import { FixtureDateForm } from "@/components/football/fixture-date-form";
import { FixtureList } from "@/components/football/fixture-list";
import { getFixturesByDate } from "@/lib/football-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Fixtures & Results | Football+",
  description: "Browse real football fixtures and results by date.",
};

type SearchParams = Promise<{ date?: string | string[] }>;

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const parameters = await searchParams;
  const queryDate = Array.isArray(parameters.date)
    ? parameters.date[0]
    : parameters.date;
  const date = queryDate ?? new Date().toISOString().slice(0, 10);
  const validDate = isValidDate(date);
  const result = validDate ? await getFixturesByDate(date) : null;

  return (
    <main className="space-y-8">
      <PageIntro
        description="Browse match schedules and completed results by date."
        eyebrow="Match centre"
        title="Fixtures & results"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-white/65">
          {validDate
            ? new Intl.DateTimeFormat("en", {
                dateStyle: "full",
                timeZone: "UTC",
              }).format(new Date(`${date}T00:00:00.000Z`))
            : "Select a valid date"}
        </p>
        <FixtureDateForm date={validDate ? date : new Date().toISOString().slice(0, 10)} />
      </div>
      {!validDate ? (
        <FootballUnavailable message="Choose a valid calendar date to view fixtures." />
      ) : result?.ok ? (
        <>
          <DataAttribution
            fetchedAt={result.value.meta.fetchedAt}
            freshness={result.value.meta.freshness}
          />
          {result.value.data.length > 0 ? (
            <FixtureList fixtures={result.value.data} />
          ) : (
            <FootballEmpty message="No fixtures or results were returned for this date." />
          )}
        </>
      ) : (
        <FootballUnavailable
          message={
            result && !result.ok
              ? result.message
              : "Football data could not be loaded."
          }
        />
      )}
    </main>
  );
}
