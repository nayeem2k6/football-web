"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "@/components/auth/account-provider";
import { accountRequest } from "@/lib/account-api";
import type { Video } from "@/lib/video-api";

interface VideoReport {
  _id: string;
  category: "copyright" | "inappropriate" | "spam" | "other";
  details: string;
  createdAt: string;
  videoId: {
    title: string;
    playbackUrl: string;
    creatorId: { username: string; displayName: string | null } | null;
  } | null;
  reporterId: { username: string; displayName: string | null } | null;
}

export function AdminVideoModeration() {
  const { user, loading: authLoading, configured } = useAccount();
  const [authorized, setAuthorized] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [reports, setReports] = useState<VideoReport[]>([]);
  const [moderationNote, setModerationNote] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [busy, setBusy] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    setErrorMessage("");
    try {
      const [videoData, reportData] = await Promise.all([
        accountRequest<{ videos: Video[] }>("/videos/admin", user),
        accountRequest<{ reports: VideoReport[] }>("/videos/admin/reports", user),
      ]);
      setVideos(videoData.videos);
      setReports(reportData.reports);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Video moderation queues could not be loaded.",
      );
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCheckingAccess(false);
      setAuthorized(false);
      return;
    }

    let active = true;
    void accountRequest<{ user: { role?: string } }>("/me", user)
      .then(({ user: profile }) => {
        if (active) setAuthorized(profile.role === "admin");
      })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorMessage(error instanceof Error ? error.message : "Admin access could not be verified.");
      })
      .finally(() => {
        if (active) setCheckingAccess(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  useEffect(() => {
    if (authorized) void loadData();
  }, [authorized, loadData]);

  async function moderateVideo(videoId: string, status: "approved" | "rejected") {
    if (!user || busy) return;
    if (status === "rejected" && moderationNote.trim().length < 5) {
      setErrorMessage("Add a moderation reason of at least 5 characters before rejecting.");
      return;
    }
    setBusy(videoId);
    setErrorMessage("");
    setNotice("");
    try {
      await accountRequest(`/videos/admin/${encodeURIComponent(videoId)}`, user, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          moderationNote: status === "rejected" ? moderationNote.trim() : "",
        }),
      });
      setModerationNote("");
      setNotice(status === "approved" ? "Video approved and published." : "Video rejected.");
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Video moderation failed.");
    } finally {
      setBusy("");
    }
  }

  async function resolveReport(reportId: string, status: "resolved" | "dismissed") {
    if (!user || busy) return;
    setBusy(reportId);
    setErrorMessage("");
    setNotice("");
    try {
      await accountRequest(
        `/videos/admin/reports/${encodeURIComponent(reportId)}`,
        user,
        {
          method: "PATCH",
          body: JSON.stringify({ status, moderatorNote: reportNote.trim() }),
        },
      );
      setReportNote("");
      setNotice(status === "resolved" ? "Video report resolved." : "Video report dismissed.");
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The video report could not be updated.");
    } finally {
      setBusy("");
    }
  }

  if (authLoading || checkingAccess) {
    return <p className="text-sm text-white/55">Checking video moderation access…</p>;
  }
  if (!configured) {
    return <p className="rounded-xl bg-amber-300/[0.06] p-4 text-sm text-amber-100">Configure Firebase to use admin tools.</p>;
  }
  if (!user || !authorized) {
    return <p className="rounded-xl border border-white/10 p-4 text-sm text-white/55">Administrator access is required to moderate videos.</p>;
  }

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <p aria-live="polite" className="rounded-xl bg-rose-400/10 p-4 text-sm text-rose-200" role="status">
          {errorMessage}
        </p>
      ) : null}
      {notice ? (
        <p aria-live="polite" className="rounded-xl bg-emerald-300/10 p-4 text-sm text-emerald-100" role="status">
          {notice}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/50">
          {loadingData ? "Refreshing moderation queues…" : `${videos.length} videos awaiting review · ${reports.length} open reports`}
        </p>
        <button
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/[0.06] disabled:opacity-50"
          disabled={loadingData || Boolean(busy)}
          onClick={() => void loadData()}
          type="button"
        >
          Refresh queues
        </button>
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Creator submissions</p>
          <h3 className="mt-2 text-xl font-black">Videos awaiting review</h3>
        </div>
        {videos.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {videos.map((video) => (
              <article className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4" key={video.id}>
                <video className="aspect-video w-full rounded-xl bg-black object-cover" controls playsInline poster={video.thumbnailUrl} preload="metadata">
                  <source src={video.playbackUrl} />
                </video>
                <div>
                  <h4 className="font-bold">{video.title}</h4>
                  <p className="mt-1 text-xs text-white/45">
                    By @{video.creator?.username ?? "unknown"} · {new Date(video.createdAt).toLocaleString()}
                  </p>
                  {video.description ? <p className="mt-2 text-sm leading-6 text-white/60">{video.description}</p> : null}
                </div>
                <label className="block space-y-2 text-sm text-white/60">
                  Rejection reason (required to reject)
                  <textarea
                    className="min-h-20 w-full rounded-xl border border-white/10 bg-[#07110e] px-3 py-2 text-white outline-none focus:border-emerald-300/50"
                    maxLength={500}
                    onChange={(event) => setModerationNote(event.target.value)}
                    value={moderationNote}
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-bold text-emerald-950 disabled:opacity-50"
                    disabled={Boolean(busy)}
                    onClick={() => void moderateVideo(video.id, "approved")}
                    type="button"
                  >
                    {busy === video.id ? "Saving…" : "Approve & publish"}
                  </button>
                  <button
                    className="rounded-full border border-rose-300/30 px-4 py-2 text-sm font-semibold text-rose-100 disabled:opacity-50"
                    disabled={Boolean(busy)}
                    onClick={() => void moderateVideo(video.id, "rejected")}
                    type="button"
                  >
                    Reject submission
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-white/10 p-5 text-sm text-white/50">
            {loadingData ? "Loading videos…" : "No videos are waiting for review."}
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Community moderation</p>
          <h3 className="mt-2 text-xl font-black">Reported videos</h3>
        </div>
        {reports.length ? (
          <ul className="space-y-3">
            {reports.map((report) => (
              <li className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4" key={report._id}>
                <div>
                  <p className="text-xs text-white/45">
                    {report.category} · reported by @{report.reporterId?.username ?? "unknown"} · {new Date(report.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2 font-semibold">{report.videoId?.title ?? "[Video no longer available]"}</p>
                  <p className="mt-1 text-sm text-white/60">
                    Creator: @{report.videoId?.creatorId?.username ?? "unknown"}
                    {report.details ? ` · ${report.details}` : ""}
                  </p>
                </div>
                {report.videoId?.playbackUrl ? (
                  <video className="aspect-video w-full max-w-xl rounded-xl bg-black object-cover" controls playsInline preload="metadata">
                    <source src={report.videoId.playbackUrl} />
                  </video>
                ) : null}
                <label className="block space-y-2 text-sm text-white/60">
                  Moderator note (optional)
                  <input
                    className="w-full rounded-xl border border-white/10 bg-[#07110e] px-3 py-2 text-white outline-none focus:border-emerald-300/50"
                    maxLength={500}
                    onChange={(event) => setReportNote(event.target.value)}
                    value={reportNote}
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-bold text-emerald-950 disabled:opacity-50"
                    disabled={Boolean(busy)}
                    onClick={() => void resolveReport(report._id, "resolved")}
                    type="button"
                  >
                    Resolve report
                  </button>
                  <button
                    className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white/70 disabled:opacity-50"
                    disabled={Boolean(busy)}
                    onClick={() => void resolveReport(report._id, "dismissed")}
                    type="button"
                  >
                    Dismiss report
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-white/10 p-5 text-sm text-white/50">
            {loadingData ? "Loading reports…" : "No open video reports."}
          </p>
        )}
      </section>
    </div>
  );
}
