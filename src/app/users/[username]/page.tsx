import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/profile/follow-button";
import { VideoLibrary } from "@/components/videos/video-library";
import { getPublicProfile } from "@/lib/account-api";
import { getCreatorVideos } from "@/lib/video-api";

export const dynamic = "force-dynamic";
type PageParams = Promise<{ username: string }>;

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const { username } = await params;
  const result = await getPublicProfile(username);
  return {
    title: result.ok
      ? `${result.value.user.displayName ?? result.value.user.username} | Football+`
      : "Football+ Profile",
    description: result.ok
      ? result.value.user.bio || `Follow ${result.value.user.username} on Football+.`
      : "Football+ community profile.",
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: PageParams;
}) {
  const { username } = await params;
  const result = await getPublicProfile(username);
  if (!result.ok && result.notFound) notFound();

  if (!result.ok) {
    return (
      <main className="mx-auto max-w-3xl rounded-2xl border border-amber-200/20 bg-amber-100/[0.04] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
          Profile unavailable
        </p>
        <h1 className="mt-3 text-2xl font-bold">We couldn&apos;t load this profile</h1>
        <p className="mt-2 text-sm leading-6 text-white/55">{result.message}</p>
      </main>
    );
  }

  const { user, counts } = result.value;
  const creatorVideos = await getCreatorVideos(user.username);
  return (
    <main className="mx-auto max-w-4xl">
      <Link
        className="text-sm text-white/45 transition hover:text-white/80"
        href="/"
      >
        ← Back to Football+
      </Link>
      <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="h-28 bg-gradient-to-r from-emerald-950 via-emerald-900/70 to-[#07110e] sm:h-40" />
        <div className="px-5 pb-7 sm:px-9 sm:pb-10">
          <div className="-mt-10 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-end gap-4">
              {user.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-2xl border-4 border-[#0b1712] bg-[#10231a] object-cover sm:h-24 sm:w-24"
                  height={96}
                  src={user.photoUrl}
                  width={96}
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-[#0b1712] bg-emerald-300 text-2xl font-black text-emerald-950 sm:h-24 sm:w-24">
                  {(user.displayName ?? user.username).slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 pb-1">
                <h1 className="break-words text-2xl font-black sm:text-3xl">
                  {user.displayName ?? user.username}
                </h1>
                <p className="mt-1 break-all text-sm text-white/45">@{user.username}</p>
              </div>
            </div>
            <FollowButton userId={user.id} initialFollowing={false} />
          </div>
          {user.bio ? (
            <p className="mt-6 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-white/70">
              {user.bio}
            </p>
          ) : (
            <p className="mt-6 text-sm text-white/40">No bio yet.</p>
          )}
          <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5">
            <div className="flex items-baseline gap-2">
              <dt className="order-2 text-sm text-white/45">Followers</dt>
              <dd className="text-base font-bold text-white">{counts.followers}</dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="order-2 text-sm text-white/45">Following</dt>
              <dd className="text-base font-bold text-white">{counts.following}</dd>
            </div>
          </dl>
        </div>
      </section>
      <section className="mt-8 space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Creator channel
          </p>
          <h2 className="mt-2 text-2xl font-black">Published videos</h2>
        </div>
        {creatorVideos.ok ? (
          <VideoLibrary videos={creatorVideos.videos} />
        ) : (
          <p aria-live="polite" className="rounded-2xl border border-amber-300/20 p-5 text-sm text-amber-100/75">
            {creatorVideos.message}
          </p>
        )}
      </section>
    </main>
  );
}
