"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "@/components/auth/account-provider";
import { accountRequest } from "@/lib/account-api";

type AdminAccess = "loading" | "allowed" | "denied" | "error";

interface DashboardCounts {
  users: number;
  commentReports: number;
  pendingVideos: number;
  videoReports: number;
  articles: number;
}

const dashboardSections = [
  { id: "admin-users", label: "Users & comments" },
  { id: "admin-videos", label: "Video moderation" },
  { id: "admin-news", label: "News & transfers" },
  { id: "admin-audit", label: "Audit trail" },
];

export function AdminDashboard() {
  const { user, loading: authLoading, configured } = useAccount();
  const [access, setAccess] = useState<AdminAccess>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(false);

  const loadCounts = useCallback(async () => {
    if (!user) return;
    setLoadingCounts(true);
    setErrorMessage("");
    try {
      const [users, comments, videos, videoReports, articles] = await Promise.all([
        accountRequest<{ users: unknown[] }>("/admin/users?limit=50", user),
        accountRequest<{ reports: unknown[] }>("/admin/social/reports?limit=50", user),
        accountRequest<{ videos: unknown[] }>("/videos/admin", user),
        accountRequest<{ reports: unknown[] }>("/videos/admin/reports", user),
        accountRequest<{ articles: unknown[] }>("/news/admin/articles?limit=50", user),
      ]);
      setCounts({
        users: users.users.length,
        commentReports: comments.reports.length,
        pendingVideos: videos.videos.length,
        videoReports: videoReports.reports.length,
        articles: articles.articles.length,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Dashboard counts could not be loaded.",
      );
    } finally {
      setLoadingCounts(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setAccess("denied");
      return;
    }

    let active = true;
    void accountRequest<{ user: { role?: string } }>("/me", user)
      .then(({ user: profile }) => {
        if (active) setAccess(profile.role === "admin" ? "allowed" : "denied");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Administrator access could not be verified.",
        );
        setAccess("error");
      });

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  useEffect(() => {
    if (access === "allowed") void loadCounts();
  }, [access, loadCounts]);

  if (authLoading || access === "loading") {
    return <p className="text-sm text-white/55">Checking administrator access…</p>;
  }
  if (!configured) {
    return (
      <p className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5 text-sm text-amber-100/80">
        Sign-in is not configured. Configure Firebase before using administrator tools.
      </p>
    );
  }
  if (access === "error") {
    return (
      <p aria-live="polite" className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.05] p-5 text-sm text-rose-100" role="status">
        {errorMessage}
      </p>
    );
  }
  if (access === "denied") {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <h2 className="text-xl font-bold">Administrator access required</h2>
        <p className="mt-2 text-sm text-white/55">
          Sign in with an authorized administrator account to use these tools.
        </p>
        <Link
          className="mt-4 inline-flex rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-bold text-emerald-950"
          href={user ? "/profile" : "/login"}
        >
          {user ? "Return to profile" : "Sign in"}
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Live overview
          </p>
          <h2 className="mt-2 text-2xl font-black">Admin control center</h2>
        </div>
        <button
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/[0.06] disabled:opacity-50"
          disabled={loadingCounts}
          onClick={() => void loadCounts()}
          type="button"
        >
          {loadingCounts ? "Refreshing…" : "Refresh overview"}
        </button>
      </div>
      {errorMessage ? (
        <p aria-live="polite" className="rounded-xl bg-rose-400/10 p-4 text-sm text-rose-200" role="status">
          {errorMessage}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "User accounts loaded", value: counts?.users, href: "#admin-users" },
          { label: "Open comment reports", value: counts?.commentReports, href: "#admin-users" },
          { label: "Videos awaiting review", value: counts?.pendingVideos, href: "#admin-videos" },
          { label: "Open video reports", value: counts?.videoReports, href: "#admin-videos" },
          { label: "Editorial items loaded", value: counts?.articles, href: "#admin-news" },
        ].map((item) => (
          <Link
            className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-emerald-200/30"
            href={item.href}
            key={item.label}
          >
            <p className="text-xs leading-5 text-white/50">{item.label}</p>
            <p className="mt-2 text-3xl font-black text-white">
              {item.value ?? (loadingCounts ? "…" : "—")}
            </p>
          </Link>
        ))}
      </div>
      <nav aria-label="Admin dashboard sections" className="flex flex-wrap gap-2">
        {dashboardSections.map((section) => (
          <a
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/65 transition hover:border-emerald-200/30 hover:text-emerald-100"
            href={`#${section.id}`}
            key={section.id}
          >
            {section.label}
          </a>
        ))}
      </nav>
    </section>
  );
}
