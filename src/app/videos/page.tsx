import type { Metadata } from "next";
import Link from "next/link";
import { VideoLibrary } from "@/components/videos/video-library";
import { getPublicVideos } from "@/lib/video-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Football Videos | Football+",
  description: "Watch moderated, creator-led football videos on Football+.",
};

export default async function VideosPage() {
  const result = await getPublicVideos();

  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
            Creator video
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Football belongs to the fans.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
            Watch community football videos, published after moderation. Signed-in
            members can submit videos for review.
          </p>
        </div>
        <Link
          className="w-fit rounded-full bg-emerald-300 px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-200"
          href="/creator"
        >
          Open creator studio
        </Link>
      </section>

      {result.ok ? (
        <VideoLibrary videos={result.videos} />
      ) : (
        <section
          aria-live="polite"
          className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-6"
          role="status"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
            Videos unavailable
          </p>
          <p className="mt-3 text-sm leading-6 text-white/65">{result.message}</p>
        </section>
      )}
    </main>
  );
}
