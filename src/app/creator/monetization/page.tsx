import type { Metadata } from "next";
import Link from "next/link";
import { CreatorMonetization } from "@/components/creator/creator-monetization";

export const metadata: Metadata = {
  title: "Creator Account Setup | Football+",
  description: "Manage Stripe Connect Express onboarding for a Football+ creator account.",
};

export default function CreatorMonetizationPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-8">
      <Link className="text-sm font-semibold text-emerald-200 hover:text-emerald-100" href="/creator">
        ← Creator hub
      </Link>
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Creator account
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Stripe setup
        </h1>
        <p className="mt-4 leading-7 text-white/55">
          This is account onboarding only. Creator earnings, transfers, and
          payouts remain disabled until a verified revenue source and payout
          policy are implemented.
        </p>
      </section>
      <CreatorMonetization />
    </main>
  );
}
