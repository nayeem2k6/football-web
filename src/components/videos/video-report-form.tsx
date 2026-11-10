"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAccount } from "@/components/auth/account-provider";
import { accountRequest } from "@/lib/account-api";

export function VideoReportForm({ videoId }: { videoId: string }) {
  const { user } = useAccount();
  const [category, setCategory] = useState("inappropriate");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setMessage("");
    try {
      await accountRequest(`/videos/${encodeURIComponent(videoId)}/reports`, user, {
        method: "POST",
        body: JSON.stringify({ category, details }),
      });
      setSubmitted(true);
      setMessage("Report sent. Our moderation team will review it.");
      setDetails("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The report could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <Link className="text-xs text-white/45 underline underline-offset-4 hover:text-white/75" href="/login">
        Sign in to report
      </Link>
    );
  }

  return (
    <details className="mt-4 border-t border-white/10 pt-3">
      <summary className="cursor-pointer text-xs text-white/45 hover:text-white/75">
        Report this video
      </summary>
      <form className="mt-3 space-y-3" onSubmit={submitReport}>
        <label className="block text-xs text-white/60">
          Reason
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#07110e] px-3 py-2 text-sm text-white"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            <option value="inappropriate">Inappropriate content</option>
            <option value="copyright">Copyright concern</option>
            <option value="spam">Spam or misleading</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block text-xs text-white/60">
          Details (optional)
          <textarea
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#07110e] px-3 py-2 text-sm text-white"
            maxLength={500}
            onChange={(event) => setDetails(event.target.value)}
            value={details}
          />
        </label>
        <button
          className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 disabled:opacity-50"
          disabled={busy || submitted}
          type="submit"
        >
          {busy ? "Sending…" : submitted ? "Report submitted" : "Submit report"}
        </button>
        {message ? <p aria-live="polite" className="text-xs text-emerald-100">{message}</p> : null}
      </form>
    </details>
  );
}
