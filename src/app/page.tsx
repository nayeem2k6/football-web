import type { Metadata } from "next";
import Link from "next/link";
import {
  DataAttribution,
  FootballEmpty,
  FootballUnavailable,
} from "@/components/football/football-state";
import { FixtureList } from "@/components/football/fixture-list";
import { getLiveFixtures } from "@/lib/football-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Football+ | The home of football",
  description:
    "Live football scores, fixtures, league tables, original stories and creator videos. Your matchday, all in one place.",
};

const discoveryLinks = [
  {
    number: "01",
    category: "Matchday",
    title: "Every fixture. Every result.",
    description:
      "Find your next kick-off, catch up on the final whistle and follow the matches that matter to you.",
    href: "/fixtures",
    action: "Explore fixtures",
    icon: "↗",
  },
  {
    number: "02",
    category: "The table",
    title: "See how it all adds up.",
    description:
      "Keep an eye on the race for the top, the European places and everything in between.",
    href: "/leagues/39/standings",
    action: "View the Premier League",
    icon: "↗",
  },
  {
    number: "03",
    category: "Stories",
    title: "Football, with more to say.",
    description:
      "Original coverage, thoughtful analysis and transfer stories with their sources in view.",
    href: "/news",
    action: "Read the latest",
    icon: "↗",
  },
];

export default async function HomePage() {
  const liveResult = await getLiveFixtures();
  const featuredFixture =
    liveResult.ok && liveResult.value.data.length > 0
      ? liveResult.value.data[0]
      : null;

  return (
    <main className="space-y-16 pb-8 sm:space-y-24">
      <section
        aria-labelledby="home-heading"
        className="home-hero relative isolate overflow-hidden rounded-[1.75rem] border border-white/[0.09] sm:rounded-[2rem]"
      >
        <div aria-hidden="true" className="home-hero-grid" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-36 -top-40 -z-10 h-[30rem] w-[30rem] rounded-full bg-lime-300/[0.11] blur-[100px]"
        />
        <div className="relative grid min-h-[31rem] items-center gap-12 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:px-16 lg:py-16">
          <div className="max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-200/20 bg-lime-200/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-lime-200 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
              A better view of the beautiful game
            </p>
            <h1
              className="max-w-[12ch] text-[clamp(3.35rem,8vw,6.6rem)] font-black leading-[0.91] tracking-[-0.075em] text-white"
              id="home-heading"
            >
              The game is
              <span className="block text-lime-300">better together.</span>
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
              From the first whistle to the stories after it, find your place
              in the football conversation.
            </p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-bold text-[#132010] shadow-[0_8px_30px_rgba(190,242,100,0.12)] transition hover:-translate-y-0.5 hover:bg-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-200"
                href="/scores"
              >
                Go to the match centre <span aria-hidden="true">↗</span>
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.035] px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                href="/news"
              >
                Discover the stories
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-5 text-xs text-white/45 sm:mt-12">
              <span className="inline-flex items-center gap-2">
                <span className="font-bold text-white">LIVE</span> scores
              </span>
              <span className="h-1 w-1 rounded-full bg-lime-300/70" />
              <span>Fixtures that matter</span>
              <span className="h-1 w-1 rounded-full bg-lime-300/70" />
              <span>Stories worth sharing</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[31rem] lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2rem] border border-lime-200/[0.08] sm:-inset-7"
            />
            <div className="relative overflow-hidden rounded-[1.4rem] border border-white/[0.12] bg-[#0b1713]/90 shadow-[0_24px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:rounded-[1.7rem]">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                    Your matchday
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">Match centre</p>
                </div>
                <Link
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/65 transition hover:border-lime-200/40 hover:text-lime-100"
                  href="/scores"
                >
                  All scores <span aria-hidden="true">→</span>
                </Link>
              </div>
              {featuredFixture ? (
                <div className="p-5 sm:p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <p className="truncate text-xs font-semibold text-white/55">
                      {featuredFixture.league.name}
                    </p>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-300/20 bg-rose-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-200">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-300" />
                      Live
                    </span>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
                    <div className="min-w-0 text-center">
                      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-sm font-black text-lime-100 sm:h-14 sm:w-14">
                        {featuredFixture.teams.home.name.slice(0, 3).toUpperCase()}
                      </span>
                      <p className="mt-3 truncate text-xs font-semibold text-white sm:text-sm">
                        {featuredFixture.teams.home.name}
                      </p>
                    </div>
                    <div className="min-w-[5.5rem] text-center">
                      <p className="font-mono text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        {featuredFixture.goals.home ?? "–"}
                        <span className="px-1.5 text-white/30">:</span>
                        {featuredFixture.goals.away ?? "–"}
                      </p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-rose-200">
                        {featuredFixture.status.elapsed !== null
                          ? `${featuredFixture.status.elapsed} minutes`
                          : featuredFixture.status.short}
                      </p>
                    </div>
                    <div className="min-w-0 text-center">
                      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] text-sm font-black text-lime-100 sm:h-14 sm:w-14">
                        {featuredFixture.teams.away.name.slice(0, 3).toUpperCase()}
                      </span>
                      <p className="mt-3 truncate text-xs font-semibold text-white sm:text-sm">
                        {featuredFixture.teams.away.name}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 text-[11px] text-white/40">
                    <span>{featuredFixture.league.country ?? "Matchday"}</span>
                    <span>Live match data</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-6">
                  <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-5 text-center">
                    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-lime-200/10 text-lg text-lime-200">
                      ✳
                    </span>
                    <p className="text-sm font-semibold text-white">
                      {liveResult.ok ? "Between kick-offs" : "Matchday data"}
                    </p>
                    <p className="mt-1.5 max-w-xs text-xs leading-5 text-white/45">
                      {liveResult.ok
                        ? "No matches are live at this moment. There is always more football to explore."
                        : "Live scores will appear here when the match feed is available."}
                    </p>
                  </div>
                  <Link
                    className="mt-4 flex min-h-11 items-center justify-center rounded-xl bg-white/[0.055] text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                    href="/fixtures"
                  >
                    Find your next kick-off <span className="ml-2" aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
              <div className="border-t border-white/[0.08] px-5 py-3 sm:px-6">
                <p className="text-[10px] text-white/35">
                  Scores and fixtures supplied by API-FOOTBALL
                </p>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute -bottom-5 -left-3 -z-10 h-24 w-24 rounded-full bg-lime-300/10 blur-2xl sm:-left-8"
            />
          </div>
        </div>
        <div className="relative grid grid-cols-1 divide-y divide-white/[0.08] border-t border-white/[0.08] bg-black/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            ["01", "Follow the action", "Live scores and upcoming fixtures"],
            ["02", "Know the story", "News, transfers and analysis"],
            ["03", "Join the conversation", "Creators and the fan community"],
          ].map(([number, title, detail]) => (
            <div className="flex items-center gap-4 px-6 py-4 sm:px-7 sm:py-5" key={number}>
              <span className="text-xs font-bold tracking-widest text-lime-200/70">
                {number}
              </span>
              <div>
                <p className="text-xs font-semibold text-white/85 sm:text-sm">{title}</p>
                <p className="mt-1 text-[11px] text-white/40">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="live-heading" className="space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-lime-200 sm:text-xs">
              The match centre
            </p>
            <h2
              className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl"
              id="live-heading"
            >
              Live right now<span className="text-lime-300">.</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
              Real-time match updates, with the source and freshness always clear.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/75 transition hover:border-lime-200/40 hover:text-lime-100 sm:text-sm"
            href="/scores"
          >
            View all live scores <span aria-hidden="true">↗</span>
          </Link>
        </div>
        {liveResult.ok ? (
          <>
            <DataAttribution
              fetchedAt={liveResult.value.meta.fetchedAt}
              freshness={liveResult.value.meta.freshness}
            />
            {liveResult.value.data.length > 0 ? (
              <FixtureList fixtures={liveResult.value.data.slice(0, 4)} />
            ) : (
              <FootballEmpty message="No matches are live right now." />
            )}
          </>
        ) : (
          <FootballUnavailable message={liveResult.message} />
        )}
      </section>

      <section aria-labelledby="discover-heading" className="space-y-6 sm:space-y-8">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-lime-200 sm:text-xs">
            Find your football
          </p>
          <h2
            className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl"
            id="discover-heading"
          >
            Make yourself at home<span className="text-lime-300">.</span>
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/45">
            Everything you love about the game, ready for your next visit.
          </p>
        </div>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {discoveryLinks.map((card) => (
            <article
              className="group relative flex min-h-64 flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012))] p-5 transition duration-300 hover:-translate-y-1 hover:border-lime-200/25 hover:bg-white/[0.055] sm:min-h-72 sm:p-7"
              key={card.number}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.2em] text-lime-200/70">
                  {card.category}
                </span>
                <span className="text-xs text-white/30">{card.number}</span>
              </div>
              <h3 className="mt-8 max-w-[14ch] text-xl font-bold leading-snug tracking-tight text-white sm:mt-10 sm:text-2xl">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/45">{card.description}</p>
              <Link
                className="mt-auto inline-flex min-h-11 items-end gap-2 pt-6 text-xs font-semibold text-lime-100 transition group-hover:text-lime-200 sm:text-sm"
                href={card.href}
              >
                {card.action}
                <span aria-hidden="true">{card.icon}</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-2xl border border-lime-200/15 bg-[linear-gradient(110deg,rgba(190,242,100,0.1),rgba(190,242,100,0.025)_55%,rgba(255,255,255,0.02))] px-6 py-8 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-9 sm:py-9">
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime-200 sm:text-xs">
            More than matchday
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
            Your club. Your voice. Your football.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
            Meet creators, share what you think and make this community yours.
          </p>
        </div>
        <Link
          className="relative mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-[#142012] transition hover:-translate-y-0.5 hover:bg-lime-100 sm:mt-0 sm:shrink-0 sm:text-sm"
          href="/creator"
        >
          Explore the creator hub <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  );
}
