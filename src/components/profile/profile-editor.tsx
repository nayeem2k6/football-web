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
    return <p className="text-sm text-white/55">Loading your account…</p>;
  }

  if (!user) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Sign in to your profile</h1>
        <p className="mt-2 text-sm text-white/55">
          You need an account to edit your Football+ profile.
        </p>
        <Link
          className="mt-5 inline-flex rounded-full bg-emerald-300 px-5 py-3 text-sm font-bold text-emerald-950"
          href="/login"
        >
          Sign in
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
          Your account
        </p>
        <h1 className="mt-3 break-words text-3xl font-black tracking-tight sm:text-4xl">
          {profile?.displayName || user.displayName || "Football fan"}
        </h1>
        <p className="mt-2 break-all text-sm text-white/50">{user.email}</p>
        {profile ? (
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-emerald-200 hover:text-emerald-100"
            href={`/users/${encodeURIComponent(profile.username)}`}
          >
            View public profile →
          </Link>
        ) : null}
        <button
          className="mt-8 block rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.05]"
          onClick={async () => {
            await signOutUser();
            router.replace("/");
            router.refresh();
          }}
          type="button"
        >
          Sign out
        </button>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h2 className="text-xl font-bold">Edit profile</h2>
        <p className="mt-2 text-sm leading-6 text-white/50">
          Your username is used in your public profile address.
        </p>
        <form className="mt-6 space-y-5" onSubmit={saveProfile}>
          <div>
            <label className="mb-2 block text-sm font-medium text-white/75" htmlFor="username">
              Username
            </label>
            <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-4 focus-within:border-emerald-300/50">
              <span className="text-sm text-white/35">@</span>
              <input
                autoComplete="username"
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none"
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
            <label className="mb-2 block text-sm font-medium text-white/75" htmlFor="display-name">
              Display name
            </label>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50"
              id="display-name"
              maxLength={100}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              value={displayName}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white/75" htmlFor="bio">
              Bio
            </label>
            <textarea
              className="min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/50"
              id="bio"
              maxLength={280}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Tell the football community about yourself"
              value={bio}
            />
            <p className="mt-1 text-right text-xs text-white/35">{bio.length}/280</p>
          </div>
          {errorMessage ? (
            <p aria-live="polite" className="rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">
              {errorMessage}
            </p>
          ) : null}
          {message ? (
            <p aria-live="polite" className="rounded-xl bg-emerald-300/10 p-3 text-sm text-emerald-100">
              {message}
            </p>
          ) : null}
          <button
            className="w-full rounded-xl bg-emerald-300 px-5 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-200 disabled:opacity-50 sm:w-auto"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>
    </div>
  );
}
