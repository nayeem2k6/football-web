"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAccount } from "@/components/auth/account-provider";
import { accountRequest, type Profile, type PublicProfileResponse } from "@/lib/account-api";
import type { Video } from "@/lib/video-api";

interface VideoReport {
  _id: string;
  category: "copyright" | "inappropriate" | "spam" | "other";
  details: string;
  createdAt: string;
  videoId: {
    title: string;
    playbackUrl: string;
  } | null;
  reporterId: {
    username: string;
    displayName: string | null;
  } | null;
}

function statusLabel(status: Video["status"]): string {
  if (status === "approved") return "Published";
  if (status === "rejected") return "Needs changes";
  return "In review";
}

export function CreatorHub() {
  const { user, loading: authLoading, configured } = useAccount();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [reports, setReports] = useState<VideoReport[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [followers, setFollowers] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [moderationNote, setModerationNote] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    setErrorMessage("");
    try {
      const current = await accountRequest<{ user: Profile }>("/me", user);
      setProfile(current.user);
      const dashboard = await accountRequest<{ videos: Video[] }>(
        "/videos/creator",
        user,
      );
      setVideos(dashboard.videos);
      const publicProfile = await accountRequest<PublicProfileResponse>(
        `/users/${encodeURIComponent(current.user.username)}`,
        user,
      );
      setFollowers(publicProfile.counts.followers);

      const admin = current.user.role === "admin";
      setIsAdmin(admin);
      if (admin) {
        const [queue, openReports] = await Promise.all([
          accountRequest<{ videos: Video[] }>("/videos/admin", user),
          accountRequest<{ reports: VideoReport[] }>("/videos/admin/reports", user),
        ]);
        setVideos((currentVideos) => {
          const ownIds = new Set(currentVideos.map((video) => video.id));
          return [
            ...currentVideos,
            ...queue.videos.filter((video) => !ownIds.has(video.id)),
          ];
        });
        setReports(openReports.reports);
      } else {
        setReports([]);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "The creator dashboard could not be loaded.",
      );
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadingData(false);
      return;
    }
    void loadDashboard();
  }, [authLoading, user, loadDashboard]);

  async function submitVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !file) return;
    setUploading(true);
    setErrorMessage("");
    setMessage("");
    try {
      if (file.size > 100_000_000) {
        throw new Error("Videos must be 100 MB or smaller.");
      }
      const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
      const allowedMimeTypes: Record<string, string[]> = {
        ".mp4": ["video/mp4"],
        ".mov": ["video/quicktime"],
        ".webm": ["video/webm"],
        ".m4v": ["video/x-m4v", "video/mp4"],
      };
      if (!allowedMimeTypes[extension]?.includes(file.type.toLowerCase())) {
        throw new Error("Choose an MP4, MOV, WebM, or M4V video with a matching file type.");
      }

      const uploadForm = new FormData();
      uploadForm.set("file", file);
      uploadForm.set("title", title);
      uploadForm.set("description", description);
      uploadForm.set("rightsConfirmed", String(rightsConfirmed));
      await accountRequest<{ video: Video }>("/videos", user, {
        method: "POST",
        body: uploadForm,
      });
      setTitle("");
      setDescription("");
      setFile(null);
      setRightsConfirmed(false);
      setMessage("Video uploaded. It will appear publicly after moderation.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The video could not be uploaded. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function moderateVideo(videoId: string, status: "approved" | "rejected") {
    if (!user) return;
    setErrorMessage("");
    setMessage("");
    try {
      await accountRequest(`/videos/admin/${encodeURIComponent(videoId)}`, user, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          moderationNote: status === "rejected" ? moderationNote : "",
        }),
      });
      setModerationNote("");
      setMessage(status === "approved" ? "Video approved." : "Video rejected.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Moderation failed.");
    }
  }

  async function resolveReport(reportId: string, status: "resolved" | "dismissed") {
    if (!user) return;
    setErrorMessage("");
    try {
      await accountRequest(
        `/videos/admin/reports/${encodeURIComponent(reportId)}`,
        user,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The report could not be updated.");
    }
  }

  if (authLoading || loadingData) {
    return <p className="text-sm text-white/55">Loading creator hub…</p>;
  }
  if (!configured) {
    return (
      <p className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5 text-sm leading-6 text-amber-100/80">
        Sign-in is not configured. Configure Firebase Web Authentication before using creator tools.
      </p>
    );
  }
  if (!user) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <p className="text-white/65">Sign in to manage your creator profile and videos.</p>
        <Link className="mt-4 inline-flex rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-bold text-emerald-950" href="/login">
          Sign in
        </Link>
      </section>
    );
  }

  const ownVideos = videos.filter(
    (video) => video.creator?.username === profile?.username,
  );
  const pendingVideos = isAdmin
    ? videos.filter((video) => video.status === "pending")
    : [];

  return (
    <div className="space-y-10">
      {errorMessage ? (
        <p aria-live="polite" className="rounded-xl bg-rose-400/10 p-4 text-sm text-rose-200">
          {errorMessage}
        </p>
      ) : null}
      {message ? (
        <p aria-live="polite" className="rounded-xl bg-emerald-300/10 p-4 text-sm text-emerald-100">
          {message}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <p className="text-xs uppercase tracking-wider text-white/45">Published</p>
          <p className="mt-2 text-3xl font-black">{ownVideos.filter((video) => video.status === "approved").length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <p className="text-xs uppercase tracking-wider text-white/45">In review</p>
          <p className="mt-2 text-3xl font-black">{ownVideos.filter((video) => video.status === "pending").length}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <p className="text-xs uppercase tracking-wider text-white/45">Followers</p>
          <p className="mt-2 text-3xl font-black">{followers ?? "—"}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-100/70">
          Creator monetization
        </p>
        <h2 className="mt-2 text-lg font-bold text-white">Not enabled</h2>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Set up a Stripe Connect account profile. This does not calculate
          earnings or enable transfers or payouts.
        </p>
        <Link
          className="mt-4 inline-flex text-sm font-semibold text-emerald-200 hover:text-emerald-100"
          href="/creator/monetization"
        >
          Stripe account setup →
        </Link>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <form
          className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-7"
          onSubmit={submitVideo}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Creator studio</p>
            <h2 className="mt-2 text-2xl font-black">Publish a football video</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Upload MP4, MOV, WebM, or M4V videos up to 100 MB and 10 minutes. Videos are private until approved.
            </p>
          </div>
          <label className="block space-y-2 text-sm font-medium text-white/75">
            Video title
            <input
              className="w-full rounded-xl border border-white/10 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
              maxLength={120}
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-white/75">
            Description
            <textarea
              className="min-h-24 w-full rounded-xl border border-white/10 bg-[#07110e] px-4 py-3 text-white outline-none focus:border-emerald-300/60"
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium text-white/75">
            Video file
            <input
              accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
              className="block w-full text-sm text-white/65 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-300 file:px-4 file:py-2 file:font-bold file:text-emerald-950"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
              type="file"
            />
          </label>
          <label className="flex items-start gap-3 text-sm leading-6 text-white/60">
            <input
              checked={rightsConfirmed}
              className="mt-1 accent-emerald-300"
              onChange={(event) => setRightsConfirmed(event.target.checked)}
              required
              type="checkbox"
            />
            I own this video or have permission to publish it, and it follows the community rules.
          </label>
          <button
            className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-200 disabled:opacity-50"
            disabled={uploading}
            type="submit"
          >
            {uploading ? "Uploading…" : "Upload for review"}
          </button>
        </form>

        <aside className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Your channel</p>
          <h2 className="mt-3 text-2xl font-black">{profile?.displayName ?? profile?.username ?? "Creator"}</h2>
          <p className="mt-2 text-sm text-white/50">@{profile?.username ?? "—"}</p>
          <p className="mt-5 text-sm leading-6 text-white/55">
            Videos are screened before publishing. Only share original work or footage you have permission to use.
          </p>
          {profile ? (
            <Link className="mt-5 inline-flex text-sm font-semibold text-emerald-200 hover:text-emerald-100" href={`/users/${encodeURIComponent(profile.username)}`}>
              View public profile →
            </Link>
          ) : null}
          {isAdmin ? (
            <Link className="mt-3 block text-sm font-semibold text-emerald-200 hover:text-emerald-100" href="/admin">
              Open admin dashboard →
            </Link>
          ) : null}
        </aside>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Your content</p>
            <h2 className="mt-2 text-2xl font-black">My videos</h2>
          </div>
          <button className="text-sm text-white/50 hover:text-white" onClick={() => void loadDashboard()} type="button">
            Refresh
          </button>
        </div>
        {ownVideos.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {ownVideos.map((video) => (
              <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-4" key={video.id}>
                <video className="aspect-video w-full rounded-xl bg-black object-cover" controls playsInline poster={video.thumbnailUrl} preload="metadata">
                  <source src={video.playbackUrl} />
                </video>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{video.title}</h3>
                    <p className="mt-1 text-xs text-white/45">{statusLabel(video.status)}</p>
                  </div>
                  {video.status === "approved" ? (
                    <Link className="text-xs text-emerald-200 hover:text-emerald-100" href="/videos">View</Link>
                  ) : null}
                </div>
                {video.moderationNote ? (
                  <p className="mt-3 text-sm text-amber-100/75">{video.moderationNote}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-white/10 p-6 text-sm text-white/45">You have not uploaded any videos yet.</p>
        )}
      </section>

      {isAdmin ? (
        <section className="space-y-6 border-t border-white/10 pt-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Administrator</p>
            <h2 className="mt-2 text-2xl font-black">Moderation queue</h2>
          </div>
          {pendingVideos.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingVideos.map((video) => (
                <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5" key={video.id}>
                  <video className="aspect-video w-full rounded-xl bg-black" controls playsInline preload="metadata">
                    <source src={video.playbackUrl} />
                  </video>
                  <h3 className="mt-4 font-bold">{video.title}</h3>
                  <p className="mt-1 text-xs text-white/45">By @{video.creator?.username ?? "unknown"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="rounded-full bg-emerald-300 px-4 py-2 text-xs font-bold text-emerald-950 disabled:opacity-50" onClick={() => void moderateVideo(video.id, "approved")} type="button">
                      Approve
                    </button>
                    <input
                      aria-label={`Rejection reason for ${video.title}`}
                      className="min-w-0 flex-1 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white"
                      onChange={(event) => setModerationNote(event.target.value)}
                      placeholder="Reason required to reject"
                      value={moderationNote}
                    />
                    <button className="rounded-full border border-rose-300/30 px-4 py-2 text-xs font-semibold text-rose-100" onClick={() => void moderateVideo(video.id, "rejected")} type="button">
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/45">No videos are waiting for review.</p>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Open reports</h3>
            {reports.length ? reports.map((report) => (
              <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between" key={report._id}>
                <div>
                  <p className="font-semibold">{report.category} · {report.videoId?.title ?? "Video removed"}</p>
                  {report.videoId?.playbackUrl ? (
                    <video
                      className="mt-3 max-h-64 w-full rounded-xl bg-black"
                      controls
                      preload="metadata"
                      src={report.videoId.playbackUrl}
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : null}
                  <p className="mt-1 text-sm text-white/50">{report.details || "No additional details."}</p>
                  <p className="mt-1 text-xs text-white/35">Reported by @{report.reporterId?.username ?? "unknown"}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/70" onClick={() => void resolveReport(report._id, "dismissed")} type="button">Dismiss</button>
                  <button className="rounded-full bg-emerald-300 px-4 py-2 text-xs font-bold text-emerald-950" onClick={() => void resolveReport(report._id, "resolved")} type="button">Resolve</button>
                </div>
              </article>
            )) : <p className="text-sm text-white/45">No open reports.</p>}
          </div>
        </section>
      ) : null}
    </div>
  );
}
