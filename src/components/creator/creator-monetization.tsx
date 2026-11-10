"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "@/components/auth/account-provider";
import { accountRequest } from "@/lib/account-api";

type OnboardingStatus = "not_started" | "in_progress" | "complete";

interface MonetizationStatus {
  onboardingStatus: OnboardingStatus;
  earningsEnabled: false;
  payoutsEnabled: false;
}

interface OnboardingResponse extends MonetizationStatus {
  onboardingUrl: string | null;
}

export function CreatorMonetization() {
  const { user, loading: authLoading, configured } = useAccount();
  const [status, setStatus] = useState<MonetizationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadStatus = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      setStatus(await accountRequest<MonetizationStatus>("/creator/monetization", user));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Stripe account status could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) void loadStatus();
  }, [authLoading, loadStatus]);

  async function startOnboarding() {
    if (!user || busy) return;
    setBusy(true);
    setErrorMessage("");
    try {
      const result = await accountRequest<OnboardingResponse>(
        "/creator/monetization/connect",
        user,
        { method: "POST" },
      );
      if (result.onboardingUrl) {
        window.location.assign(result.onboardingUrl);
        return;
      }
      setStatus({
        onboardingStatus: result.onboardingStatus,
        earningsEnabled: false,
        payoutsEnabled: false,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Stripe onboarding could not be started.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || loading) {
    return <p className="text-sm text-white/55">Loading Stripe Connect status…</p>;
  }
  if (!configured) {
    return (
      <p className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5 text-sm text-amber-100/80">
        Sign-in is not configured. Configure Firebase before managing creator account setup.
      </p>
    );
  }
  if (!user) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <p className="text-sm text-white/65">Sign in to manage your Stripe Connect account setup.</p>
        <Link
          className="mt-4 inline-flex rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-bold text-emerald-950"
          href="/login"
        >
          Sign in
        </Link>
      </section>
    );
  }

  const onboardingStatus = status?.onboardingStatus ?? "not_started";
  const statusLabel =
    onboardingStatus === "complete"
      ? "Stripe account details submitted"
      : onboardingStatus === "in_progress"
        ? "Stripe onboarding in progress"
        : "Stripe account not connected";

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      {errorMessage ? (
        <p aria-live="polite" className="rounded-xl bg-rose-400/10 p-4 text-sm text-rose-200" role="status">
          {errorMessage}
        </p>
      ) : null}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
          Stripe Connect Express · US platform
        </p>
        <h2 className="mt-2 text-2xl font-black">{statusLabel}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
          Stripe collects account details through its hosted onboarding flow.
          Football+ does not receive or store your bank credentials.
        </p>
      </div>
      {onboardingStatus !== "complete" ? (
        <button
          className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-bold text-emerald-950 disabled:opacity-50"
          disabled={busy}
          onClick={() => void startOnboarding()}
          type="button"
        >
          {busy
            ? "Opening Stripe…"
            : onboardingStatus === "in_progress"
              ? "Continue Stripe setup"
              : "Start Stripe setup"}
        </button>
      ) : null}
      <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
        <p className="text-sm font-semibold text-amber-100">Earnings and payouts are not enabled.</p>
        <p className="mt-1 text-xs leading-5 text-white/50">
          No creator revenue is calculated or transferred. Stripe account setup
          alone does not mean you have earned money or can receive a payout.
        </p>
      </div>
      <button
        className="text-xs font-semibold text-white/45 underline underline-offset-4 hover:text-white/75"
        onClick={() => void loadStatus()}
        type="button"
      >
        Refresh account status
      </button>
    </section>
  );
}
