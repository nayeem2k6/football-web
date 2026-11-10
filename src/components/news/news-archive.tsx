"use client";

import { useState } from "react";
import Link from "next/link";
import { getNewsArticles, type NewsArticle, type NewsCategory } from "@/lib/news-api";

const categoryLabels: Record<string, string> = {
  news: "News",
  transfers: "Transfers",
  tactics: "Tactics",
  interviews: "Interviews",
};

export function NewsArchive({
  initialArticles,
  initialNextCursor,
  category,
}: {
  initialArticles: NewsArticle[];
  initialNextCursor: string | null;
  category?: NewsCategory;
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    setErrorMessage("");
    try {
      const result = await getNewsArticles(nextCursor, category);
      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }
      setArticles((current) => [...current, ...result.value.articles]);
      setNextCursor(result.value.nextCursor);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "More stories could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (articles.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-8">
        <h2 className="text-xl font-bold">
          {category === "transfers" ? "No transfer stories published yet" : "No stories published yet"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
          The editorial desk is ready for original reporting or content
          published with permission. We do not display fabricated stories.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-label="Latest football stories" className="grid gap-5 md:grid-cols-2">
        {articles.map((article, index) => (
          <article
            className={`rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-emerald-300/30 ${
              index === 0 ? "md:col-span-2 md:p-8" : ""
            }`}
            key={article.id}
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              {categoryLabels[article.category] ?? "News"}
            </p>
            <h2
              className={`mt-4 font-bold leading-tight tracking-tight ${
                index === 0 ? "text-3xl sm:text-4xl" : "text-2xl"
              }`}
            >
              <Link
                className="transition hover:text-emerald-100"
                href={`/news/${article.slug}`}
              >
                {article.title}
              </Link>
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-white/55">
              {article.summary}
            </p>
            <p className="mt-6 text-xs text-white/40">
              {article.publishedAt
                ? new Intl.DateTimeFormat("en", {
                    dateStyle: "medium",
                    timeZone: "UTC",
                  }).format(new Date(article.publishedAt))
                : ""}
              {" · "}Source: {article.sourceName}
            </p>
          </article>
        ))}
      </section>

      {errorMessage ? (
        <p aria-live="polite" className="text-sm text-rose-200" role="status">
          {errorMessage}
        </p>
      ) : null}
      {nextCursor ? (
        <div className="text-center">
          <button
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            disabled={loading}
            onClick={loadMore}
            type="button"
          >
            {loading ? "Loading…" : category === "transfers" ? "Load more transfer stories" : "Load more stories"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
