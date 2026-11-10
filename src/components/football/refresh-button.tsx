"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        startTransition(() => router.refresh());
      }
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [router]);

  return (
    <button
      aria-label="Refresh football data"
      className="rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:border-emerald-300/40 hover:text-white disabled:opacity-50"
      disabled={isPending}
      onClick={() => startTransition(() => router.refresh())}
      type="button"
    >
      {isPending ? "Refreshing…" : "Refresh"}
    </button>
  );
}
