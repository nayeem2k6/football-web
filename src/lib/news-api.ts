export type NewsCategory = "news" | "transfers" | "tactics" | "interviews";

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: NewsCategory;
  sourceName: string;
  sourceUrl: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: { displayName: string | null; username: string } | null;
}

export interface NewsArticlesPage {
  articles: NewsArticle[];
  nextCursor: string | null;
}

import { apiBaseUrl } from "./api-base-url";

async function getNews<T>(path: string): Promise<
  | { ok: true; value: T }
  | { ok: false; notFound: boolean; message: string }
> {
  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/+$/, "")}/news${path}`,
      { cache: "no-store", headers: { accept: "application/json" } },
    );
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message =
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "object" &&
        body.error !== null &&
        "message" in body.error &&
        typeof body.error.message === "string"
          ? body.error.message
          : "News could not be loaded right now.";
      return {
        ok: false,
        notFound: response.status === 404,
        message,
      };
    }
    return { ok: true, value: body as T };
  } catch (error) {
    console.error("Could not reach the Football Platform news API", error);
    return {
      ok: false,
      notFound: false,
      message: "The news service could not be reached. Please try again later.",
    };
  }
}

export function getNewsArticles(cursor?: string, category?: NewsCategory) {
  const query = new URLSearchParams({ limit: "20" });
  if (cursor) query.set("cursor", cursor);
  if (category) query.set("category", category);
  return getNews<NewsArticlesPage>(`?${query.toString()}`);
}

export function getNewsArticle(slug: string) {
  return getNews<{ article: NewsArticle }>(`/${encodeURIComponent(slug)}`);
}
