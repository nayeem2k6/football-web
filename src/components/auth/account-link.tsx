"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "./account-provider";
import { accountRequest } from "@/lib/account-api";

export function AccountLink() {
  const { user, loading } = useAccount();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (loading || !user) {
      setIsAdmin(false);
      return;
    }

    let active = true;
    void accountRequest<{ user: { role?: string } }>("/me", user)
      .then(({ user: profile }) => {
        if (active) setIsAdmin(profile.role === "admin");
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error("Could not verify administrator navigation access", error);
        setIsAdmin(false);
      });

    return () => {
      active = false;
    };
  }, [loading, user]);

  if (loading) {
    return (
      <span className="hidden h-10 w-24 animate-pulse rounded-full bg-white/[0.06] sm:block" />
    );
  }

  if (!user) {
    return (
      <Link
        className="whitespace-nowrap rounded-full border border-emerald-300/30 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-300/10"
        href="/login"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isAdmin ? (
        <Link
          className="whitespace-nowrap rounded-full border border-lime-200/30 px-4 py-2 text-sm font-semibold text-lime-100 transition hover:bg-lime-200/10"
          href="/admin"
        >
          Admin
        </Link>
      ) : null}
      <Link
        className="whitespace-nowrap rounded-full border border-emerald-300/30 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-300/10"
        href="/profile"
      >
        My profile
      </Link>
    </div>
  );
}
