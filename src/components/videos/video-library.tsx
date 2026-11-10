import Link from "next/link";
import type { Video } from "@/lib/video-api";
import { SocialEngagement } from "@/components/social/social-engagement";
import { VideoReportForm } from "./video-report-form";

export function VideoLibrary({ videos }: { videos: Video[] }) {
  if (videos.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-8">
        <h2 className="text-xl font-bold">No videos published yet</h2>
        <p className="mt-2 text-sm leading-6 text-white/50">
          Approved creator videos will appear here after moderation.
        </p>
        <Link className="mt-5 inline-flex text-sm font-semibold text-emerald-200 hover:text-emerald-100" href="/creator">
          Open creator hub →
        </Link>
      </section>
    );
  }

  return (
    <section aria-label="Published football videos" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]" key={video.id}>
          <video
            className="aspect-video w-full bg-black object-cover"
            controls
            playsInline
            poster={video.thumbnailUrl}
            preload="metadata"
          >
            <source src={video.playbackUrl} />
            Your browser does not support video playback.
          </video>
          <div className="p-5">
            <h2 className="text-lg font-bold leading-snug">{video.title}</h2>
            {video.description ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/55">{video.description}</p>
            ) : null}
            <p className="mt-4 text-xs text-white/40">
              By{" "}
              {video.creator ? (
                <Link
                  className="text-emerald-200 hover:text-emerald-100"
                  href={`/users/${encodeURIComponent(video.creator.username)}`}
                >
                  {video.creator.displayName ?? video.creator.username}
                </Link>
              ) : (
                "Football+ creator"
              )}
              {" · "}
              {new Intl.DateTimeFormat("en", {
                dateStyle: "medium",
                timeZone: "UTC",
              }).format(new Date(video.createdAt))}
            </p>
            <VideoReportForm videoId={video.id} />
            <SocialEngagement contentId={video.id} contentType="video" />
          </div>
        </article>
      ))}
    </section>
  );
}
