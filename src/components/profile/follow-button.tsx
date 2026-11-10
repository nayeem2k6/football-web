"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "@/components/auth/account-provider";
import { accountRequest } from "@/lib/account-api";

export function FollowButton({
  userId,
  initialFollowing,
}: {
  userId: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const { user } = useAccount();
  const [following, setFollowing] = useState(initialFollowing);
  const [isSelf, setIsSelf] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!user) {
      setFollowing(false);
      setIsSelf(false);
      return;
    }

    setIsSelf(null);
    let active = true;
    accountRequest<{ following: boolean; isSelf: boolean }>(
      `/users/${encodeURIComponent(userId)}/follow`,
      user,
    )
      .then(({ following: currentFollowing, isSelf: currentUserIsTarget }) => {
        if (active) {
          setFollowing(currentFollowing);
          setIsSelf(currentUserIsTarget);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setIsSelf(false);
          setErrorMessage(
            error instanceof Error ? error.message : "Could not load follow status.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [user, userId]);

  async function toggleFollow() {
    if (!user) {
      router.push("/login");
      return;
    }

    setBusy(true);
    setErrorMessage("");
    const nextFollowing = !following;
    setFollowing(nextFollowing);
    try {
      await accountRequest(
        `/users/${encodeURIComponent(userId)}/follow`,
        user,
        { method: nextFollowing ? "PUT" : "DELETE" },
      );
      router.refresh();
    } catch (error) {
      setFollowing(!nextFollowing);
      setErrorMessage(
        error instanceof Error ? error.message : "Could not update follow status.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (isSelf === true || (user && isSelf === null)) return null;

  return (
    <div>
      <button
        className={`rounded-full px-5 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
          following
            ? "border border-white/15 text-white/75 hover:border-rose-300/40 hover:text-rose-100"
            : "bg-emerald-300 text-emerald-950 hover:bg-emerald-200"
        }`}
        disabled={busy}
        onClick={toggleFollow}
        type="button"
      >
        {busy ? "Updating…" : following ? "Following" : "Follow"}
      </button>
      {errorMessage ? (
        <p aria-live="polite" className="mt-2 text-xs text-rose-200">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
