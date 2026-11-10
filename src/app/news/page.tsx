import type { Metadata } from "next";
import Link from "next/link";
import { NewsArchive } from "@/components/news/news-archive";
import { getNewsArticles } from "@/lib/news-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Football News | Football+",
  description: "Original, attributed football reporting and analysis.",
};

export default async function NewsPage() {
  const result = await getNewsArticles();

  return (
    <main className="space-y-10">
      <section className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            Football+ Editorial
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            The latest stories.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
            Original football reporting, analysis, and interviews with clear
            source attribution.
          </p>
        </div>
        <Link
          className="w-fit rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/[0.06] hover:text-white"
          href="/news/editor"
        >
          Editorial desk
        </Link>
      </section>

      {result.ok ? (
        <NewsArchive
          initialArticles={result.value.articles}
          initialNextCursor={result.value.nextCursor}
        />
      ) : (
        <p
          aria-live="polite"
          className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5 text-sm leading-6 text-amber-100/80"
          role="status"
        >
          {result.message}
        </p>
      )}
    </main>
  );
}
