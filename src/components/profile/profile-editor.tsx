"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAccount } from "@/components/auth/account-provider";
import { accountRequest, type Profile } from "@/lib/account-api";

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : "The profile request failed.";
}

export function ProfileEditor() {
  const router = useRouter();
  const { user, loading: authLoading, signOutUser } = useAccount();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;
    accountRequest<{ user: Profile }>("/me", user)
      .then(({ user: currentProfile }) => {
        if (!active) return;
        setProfile(currentProfile);
        setUsername(currentProfile.username);
        setDisplayName(currentProfile.displayName ?? "");
        setBio(currentProfile.bio ?? "");
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(messageFromError(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setErrorMessage("");
    setMessage("");
    try {
      const { user: updatedProfile } = await accountRequest<{ user: Profile }>(
        "/me",
        user,
        {
          method: "PATCH",
          body: JSON.stringify({ username, displayName, bio }),
        },
      );
      setProfile(updatedProfile);
      setUsername(updatedProfile.username);
      setMessage("Profile saved.");
      router.refresh();
    } catch (error) {
      setErrorMessage(messageFromError(error));
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div aria-label="Loading profile" className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="h-72 animate-pulse rounded-3xl border border-white/[0.08] bg-white/[0.025]" />
        <div className="h-[34rem] animate-pulse rounded-3xl border border-white/[0.08] bg-white/[0.025]" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="relative isolate overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0c1913] px-6 py-10 text-center sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(190,242,100,0.11),transparent_58%)]"
        />
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-lime-200/20 bg-lime-200/[0.07] text-2xl text-lime-200">
          ◉
        </span>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-lime-200">
          Your football identity
        </p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Sign in to your profile
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/50">
          Set up your profile, share your football perspective and make this
          community yours.
        </p>
        <Link
          className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-bold text-[#132010] shadow-[0_8px_30px_rgba(190,242,100,0.12)] transition hover:-translate-y-0.5 hover:bg-lime-200"
          href="/login"
        >
          Sign in to continue <span aria-hidden="true">↗</span>
        </Link>
      </section>
    );
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-6">
      <section className="overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0b1712] shadow-[0_20px_70px_rgba(0,0,0,0.16)]">
        <div className="relative h-32 overflow-hidden bg-[linear-gradient(120deg,#183923,#10271b_52%,#0b1712)] sm:h-40">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:linear-gradient(90deg,black,transparent)]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-10 -top-20 h-52 w-52 rounded-full bg-lime-300/10 blur-3xl"
          />
          <span className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
            Fan profile
          </span>
        </div>
        <div className="px-5 pb-6 sm:px-7 sm:pb-7">
          <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-[#0b1712] bg-[linear-gradient(145deg,#d9f99d,#84cc16)] text-3xl font-black text-[#142012] shadow-[0_8px_30px_rgba(0,0,0,0.3)] sm:-mt-12 sm:h-24 sm:w-24 sm:text-4xl">
            {(profile?.displayName || user.displayName || profile?.username || "F")
              .slice(0, 1)
              .toUpperCase()}
          </div>
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-lime-200/80">
            Your account
          </p>
          <h2 className="mt-2 break-words text-2xl font-black tracking-tight text-white sm:text-3xl">
            {profile?.displayName || user.displayName || "Football fan"}
          </h2>
          <p className="mt-1 break-all text-sm text-white/45">{user.email}</p>
          <dl className="mt-6 space-y-3 border-t border-white/[0.08] pt-5">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-xs text-white/40">Username</dt>
              <dd className="truncate text-xs font-semibold text-white/75">
                {profile ? `@${profile.username}` : "Loading"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-xs text-white/40">Member since</dt>
              <dd className="text-xs font-semibold text-white/75">
                {profile?.createdAt
                  ? new Intl.DateTimeFormat("en", {
                      month: "long",
                      year: "numeric",
                    }).format(new Date(profile.createdAt))
                  : "Football+"}
              </dd>
            </div>
          </dl>
          {profile ? (
            <Link
              className="mt-6 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-lime-200/20 bg-lime-200/[0.05] px-4 py-2.5 text-sm font-semibold text-lime-100 transition hover:border-lime-200/40 hover:bg-lime-200/[0.09]"
              href={`/users/${encodeURIComponent(profile.username)}`}
            >
              View public profile <span aria-hidden="true">↗</span>
            </Link>
          ) : null}
          <button
            className="mt-3 min-h-10 w-full rounded-xl px-4 py-2 text-sm font-semibold text-white/45 transition hover:bg-white/[0.04] hover:text-white/80"
            onClick={async () => {
              await signOutUser();
              router.replace("/");
              router.refresh();
            }}
            type="button"
          >
            Sign out
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/[0.09] bg-[linear-gradient(145deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.12)] sm:p-8">
        <div className="flex items-start gap-4 border-b border-white/[0.08] pb-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime-200/15 bg-lime-200/[0.06] text-lg text-lime-200">
            ✎
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lime-200/80">
              Profile settings
            </p>
            <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
              Edit your profile
            </h2>
            <p className="mt-1 text-xs leading-5 text-white/45 sm:text-sm">
              Your username is used in your public profile address.
            </p>
          </div>
        </div>
        <form className="mt-6 space-y-5" onSubmit={saveProfile}>
          <div>
            <label className="mb-2 block text-xs font-semibold text-white/70" htmlFor="username">
              Username
            </label>
            <div className="flex min-h-12 items-center rounded-xl border border-white/[0.1] bg-[#07110e]/70 px-4 transition focus-within:border-lime-200/45 focus-within:ring-4 focus-within:ring-lime-200/[0.06]">
              <span className="text-sm font-semibold text-lime-200/60">@</span>
              <input
                autoComplete="username"
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-white/25"
                id="username"
                maxLength={30}
                minLength={3}
                onChange={(event) => setUsername(event.target.value.toLowerCase())}
                pattern="[a-zA-Z0-9_]+"
                required
                value={username}
              />
            </div>
            <p className="mt-1.5 text-xs text-white/35">
              3–30 letters, numbers, or underscores.
            </p>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold text-white/70" htmlFor="display-name">
              Display name
            </label>
            <input
              className="min-h-12 w-full rounded-xl border border-white/[0.1] bg-[#07110e]/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-lime-200/45 focus:ring-4 focus:ring-lime-200/[0.06]"
              id="display-name"
              maxLength={100}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="How should we call you?"
              required
              value={displayName}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="text-xs font-semibold text-white/70" htmlFor="bio">
              Bio
              </label>
              <span className="text-[10px] text-white/35">Optional · up to 280 characters</span>
            </div>
            <textarea
              className="min-h-32 w-full resize-y rounded-xl border border-white/[0.1] bg-[#07110e]/70 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-lime-200/45 focus:ring-4 focus:ring-lime-200/[0.06]"
              id="bio"
              maxLength={280}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Tell the football community about yourself..."
              value={bio}
            />
            <p className="mt-1.5 text-right text-[11px] tabular-nums text-white/35">{bio.length}/280</p>
          </div>
          {errorMessage ? (
            <p aria-live="polite" className="rounded-xl border border-rose-300/15 bg-rose-400/[0.08] p-3 text-sm text-rose-200">
              {errorMessage}
            </p>
          ) : null}
          {message ? (
            <p aria-live="polite" className="rounded-xl border border-lime-200/15 bg-lime-200/[0.07] p-3 text-sm text-lime-100">
              {message}
            </p>
          ) : null}
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-6 py-3 text-sm font-bold text-[#132010] shadow-[0_8px_28px_rgba(190,242,100,0.1)] transition hover:-translate-y-0.5 hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving…" : "Save changes"}
            {!saving ? <span aria-hidden="true">→</span> : null}
          </button>
        </form>
      </section>
    </div>
  );
}
