import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsArticle } from "@/lib/news-api";
import { SocialEngagement } from "@/components/social/social-engagement";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getNewsArticle(slug);
  return {
    title: result.ok ? `${result.value.article.title} | Football+` : "Football News | Football+",
    description: result.ok
      ? result.value.article.summary
      : "Football news and editorial coverage on Football+.",
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getNewsArticle(slug);
  if (!result.ok && result.notFound) notFound();

  return (
    <main className="mx-auto max-w-3xl">
      <Link
        className="text-sm font-semibold text-emerald-200 hover:text-emerald-100"
        href="/news"
      >
        <span aria-hidden="true">←</span> All stories
      </Link>
      {result.ok ? (
        <article className="mt-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            {result.value.article.category}
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            {result.value.article.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-white/65">
            {result.value.article.summary}
          </p>
          <div className="mt-6 border-y border-white/10 py-4 text-sm text-white/45">
            <p>
              By{" "}
              {result.value.article.author?.displayName ??
                result.value.article.author?.username ??
                "Football+ Editorial"}
            </p>
            <p className="mt-1">
              {result.value.article.publishedAt
                ? new Intl.DateTimeFormat("en", {
                    dateStyle: "long",
                    timeZone: "UTC",
                  }).format(new Date(result.value.article.publishedAt))
                : ""}
              {" · "}Source: {result.value.article.sourceName}
              {result.value.article.sourceUrl ? (
                <>
                  {" · "}
                  <a
                    className="text-emerald-200 underline underline-offset-4"
                    href={result.value.article.sourceUrl}
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    Original source
                  </a>
                </>
              ) : null}
            </p>
          </div>
          <div className="mt-8 whitespace-pre-wrap text-base leading-8 text-white/80">
            {result.value.article.body}
          </div>
          <SocialEngagement contentId={result.value.article.id} contentType="article" />
        </article>
      ) : (
        <div
          aria-live="polite"
          className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5 text-sm leading-6 text-amber-100/80"
          role="status"
        >
          {result.message}
        </div>
      )}
    </main>
  );
}
