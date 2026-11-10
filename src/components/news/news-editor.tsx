"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { accountRequest } from "@/lib/account-api";
import { useAccount } from "@/components/auth/account-provider";
import type { NewsArticle, NewsCategory } from "@/lib/news-api";

const categoryLabels: Record<NewsCategory, string> = {
  news: "News",
  transfers: "Transfers",
  tactics: "Tactics",
  interviews: "Interviews",
};

interface ArticleForm {
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: NewsCategory;
  sourceName: string;
  sourceUrl: string;
  status: "draft" | "published";
}

const emptyForm: ArticleForm = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  category: "news",
  sourceName: "Football+ Editorial",
  sourceUrl: "",
  status: "draft",
};

function createSlug(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160)
    .replace(/-+$/g, "");
}

export function NewsEditor() {
  const { user, loading, configured } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoadingArticles(true);
    void (async () => {
      try {
        const profile = await accountRequest<{ user: { role?: string } }>(
          "/me",
          user,
        );
        if (!active) return;
        if (profile.user.role !== "admin") {
          setMessage("An administrator account is required to manage news.");
          return;
        }
        setIsAdmin(true);
        const result = await accountRequest<{
          articles: NewsArticle[];
          nextCursor: string | null;
        }>(
          "/news/admin/articles?limit=20",
          user,
        );
        if (active) {
          setArticles(result.articles);
          setNextCursor(result.nextCursor);
        }
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "News articles could not be loaded.",
          );
        }
      } finally {
        if (active) setLoadingArticles(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  async function loadMoreArticles() {
    if (!user || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    setMessage("");
    try {
      const query = new URLSearchParams({
        limit: "20",
        cursor: nextCursor,
      });
      const result = await accountRequest<{
        articles: NewsArticle[];
        nextCursor: string | null;
      }>(`/news/admin/articles?${query.toString()}`, user);
      setArticles((current) => [
        ...current,
        ...result.articles.filter(
          (article) => !current.some((existing) => existing.id === article.id),
        ),
      ]);
      setNextCursor(result.nextCursor);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "More articles could not be loaded.",
      );
    } finally {
      setLoadingMore(false);
    }
  }

  function editArticle(article: NewsArticle) {
    setEditingId(article.id);
    setForm({
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      body: article.body,
      category: article.category,
      sourceName: article.sourceName,
      sourceUrl: article.sourceUrl ?? "",
      status: article.status,
    });
    setMessage("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function submitArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");
    try {
      const path = editingId
        ? `/news/admin/articles/${encodeURIComponent(editingId)}`
        : "/news/admin/articles";
      const result = await accountRequest<{ article: NewsArticle }>(path, user, {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...form,
          sourceUrl: form.sourceUrl.trim() || undefined,
        }),
      });
      setArticles((current) => [
        result.article,
        ...current.filter((article) => article.id !== result.article.id),
      ]);
      resetForm();
      setMessage(
        result.article.status === "published"
          ? "Article published."
          : "Draft saved.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "The article could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-white/55">Checking your account…</p>;
  }
  if (!configured) {
    return (
      <p className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5 text-sm leading-6 text-amber-100/80">
        Sign-in is not configured yet. Configure Firebase Web Authentication
        before managing editorial content.
      </p>
    );
  }
  if (!user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <p className="text-white/65">Sign in with an administrator account to manage stories.</p>
        <Link
          className="mt-4 inline-flex rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-bold text-emerald-950"
          href="/login"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
      {isAdmin ? (
        <form
          className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7"
          onSubmit={submitArticle}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                Editorial desk
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {editingId ? "Edit story" : "Write a story"}
              </h2>
            </div>
            {editingId ? (
              <button
                className="text-sm text-white/55 hover:text-white"
                onClick={resetForm}
                type="button"
              >
                New story
              </button>
            ) : null}
          </div>

          <label className="block space-y-2 text-sm font-medium text-white/75">
            Headline
            <input
              className="w-full rounded-xl border border-white/10 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
              maxLength={120}
              onChange={(event) => {
                const title = event.target.value;
                setForm((current) => ({
                  ...current,
                  title,
                  ...(editingId ? {} : { slug: createSlug(title) }),
                }));
              }}
              required
              value={form.title}
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-white/75">
            Article URL slug
            <input
              className="w-full rounded-xl border border-white/10 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
              maxLength={160}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: createSlug(event.target.value) }))
              }
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
              value={form.slug}
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-white/75">
            Short summary
            <textarea
              className="min-h-24 w-full rounded-xl border border-white/10 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
              maxLength={280}
              onChange={(event) =>
                setForm((current) => ({ ...current, summary: event.target.value }))
              }
              required
              value={form.summary}
            />
          </label>

          <label className="block space-y-2 text-sm font-medium text-white/75">
            Article text
            <textarea
              className="min-h-72 w-full rounded-xl border border-white/10 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
              maxLength={20000}
              onChange={(event) =>
                setForm((current) => ({ ...current, body: event.target.value }))
              }
              required
              value={form.body}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium text-white/75">
              Section
              <select
                className="w-full rounded-xl border border-white/10 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value as NewsCategory,
                  }))
                }
                value={form.category}
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-2 text-sm font-medium text-white/75">
              Attribution / source
              <input
                className="w-full rounded-xl border border-white/10 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
                maxLength={120}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sourceName: event.target.value }))
                }
                required
                value={form.sourceName}
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium text-white/75">
            Original source URL (optional; HTTPS only)
            <input
              className="w-full rounded-xl border border-white/10 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
              onChange={(event) =>
                setForm((current) => ({ ...current, sourceUrl: event.target.value }))
              }
              placeholder="https://example.com/story"
              type="url"
              value={form.sourceUrl}
            />
          </label>

          <label className="block max-w-xs space-y-2 text-sm font-medium text-white/75">
            Save as
            <select
              className="w-full rounded-xl border border-white/10 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as ArticleForm["status"],
                }))
              }
              value={form.status}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-200 disabled:opacity-50"
              disabled={saving}
              type="submit"
            >
              {saving
                ? "Saving…"
                : form.status === "published"
                  ? "Publish story"
                  : "Save draft"}
            </button>
          </div>
          <p className="text-xs leading-5 text-white/40">
            Publish only original reporting or content you have permission to use.
            Article text is displayed as plain text; HTML is not accepted.
          </p>
        </form>
      ) : null}

      {isAdmin ? <aside className="space-y-4">
        <h2 className="text-xl font-bold">Your editorial queue</h2>
        {loadingArticles ? (
          <p className="text-sm text-white/45">Loading articles…</p>
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <article
              className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
              key={article.id}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  {article.status}
                </span>
                {isAdmin ? (
                  <button
                    className="text-xs font-semibold text-white/60 hover:text-white"
                    onClick={() => editArticle(article)}
                    type="button"
                  >
                    Edit
                  </button>
                ) : null}
              </div>
              {article.status === "published" ? (
                <Link
                  className="mt-3 block font-semibold text-white hover:text-emerald-100"
                  href={`/news/${article.slug}`}
                >
                  {article.title}
                </Link>
              ) : (
                <p className="mt-3 font-semibold text-white">{article.title}</p>
              )}
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">
                {article.summary}
              </p>
            </article>
          ))
        ) : (
          <p className="rounded-2xl border border-white/10 p-4 text-sm leading-6 text-white/50">
            No editorial stories yet.
          </p>
        )}
        {nextCursor ? (
          <button
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            disabled={loadingMore}
            onClick={loadMoreArticles}
            type="button"
          >
            {loadingMore ? "Loading…" : "Load more articles"}
          </button>
        ) : null}
      </aside> : null}
      {message ? (
        <p
          aria-live="polite"
          className="lg:col-span-2 rounded-xl border border-white/10 p-4 text-sm text-white/70"
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
