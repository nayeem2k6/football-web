"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAccount } from "@/components/auth/account-provider";
import { accountRequest } from "@/lib/account-api";
import { apiBaseUrl } from "@/lib/api-base-url";

type ContentType = "video" | "article";

interface SocialComment {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string | null;
  } | null;
}

interface CommentPage {
  comments: SocialComment[];
  nextCursor: string | null;
}

export function SocialEngagement({
  contentType,
  contentId,
}: {
  contentType: ContentType;
  contentId: string;
}) {
  const { user } = useAccount();
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadEngagement = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const base = `${apiBaseUrl.replace(/\/+$/, "")}/social/${contentType}/${encodeURIComponent(contentId)}`;
      const [countsResponse, commentsResponse] = await Promise.all([
        fetch(base, { cache: "no-store", headers: { accept: "application/json" } }),
        fetch(`${base}/comments?limit=10`, {
          cache: "no-store",
          headers: { accept: "application/json" },
        }),
      ]);
      if (!countsResponse.ok || !commentsResponse.ok) {
        throw new Error("Reactions and comments could not be loaded.");
      }
      const counts: unknown = await countsResponse.json();
      const commentPage: unknown = await commentsResponse.json();
      if (
        typeof counts !== "object" ||
        counts === null ||
        !("likeCount" in counts) ||
        typeof counts.likeCount !== "number" ||
        !("commentCount" in counts) ||
        typeof counts.commentCount !== "number" ||
        typeof commentPage !== "object" ||
        commentPage === null ||
        !("comments" in commentPage) ||
        !Array.isArray(commentPage.comments) ||
        !("nextCursor" in commentPage) ||
        (commentPage.nextCursor !== null &&
          typeof commentPage.nextCursor !== "string")
      ) {
        throw new Error("The social service returned an invalid response.");
      }
      setLikeCount(counts.likeCount);
      setCommentCount(counts.commentCount);
      setComments(commentPage.comments as SocialComment[]);
      setNextCursor(commentPage.nextCursor);
      if (user) {
        const [likeState, profile] = await Promise.all([
          accountRequest<{ liked: boolean }>(
            `/social/${contentType}/${encodeURIComponent(contentId)}/like`,
            user,
          ),
          accountRequest<{ user: { id: string } }>("/me", user),
        ]);
        setLiked(likeState.liked);
        setCurrentUserId(profile.user.id);
      } else {
        setLiked(false);
        setCurrentUserId(null);
      }
    } catch (error) {
      console.error("Could not load content engagement", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Reactions and comments could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [contentId, contentType, user]);

  useEffect(() => {
    void loadEngagement();
  }, [loadEngagement]);

  async function toggleLike() {
    if (!user || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await accountRequest(
        `/social/${contentType}/${encodeURIComponent(contentId)}/like`,
        user,
        { method: liked ? "DELETE" : "PUT" },
      );
      setLiked(!liked);
      setLikeCount((count) => count + (liked ? -1 : 1));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your reaction could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await accountRequest<{ comment: SocialComment }>(
        `/social/${contentType}/${encodeURIComponent(contentId)}/comments`,
        user,
        { method: "POST", body: JSON.stringify({ body: commentBody }) },
      );
      setComments((current) => [result.comment, ...current]);
      setCommentCount((count) => count + 1);
      setCommentBody("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your comment could not be posted.");
    } finally {
      setBusy(false);
    }
  }

  async function loadMoreComments() {
    if (!nextCursor || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const query = new URLSearchParams({ limit: "10", cursor: nextCursor });
      const response = await fetch(
        `${apiBaseUrl.replace(/\/+$/, "")}/social/${contentType}/${encodeURIComponent(contentId)}/comments?${query}`,
        { cache: "no-store", headers: { accept: "application/json" } },
      );
      const body: unknown = await response.json();
      if (!response.ok) {
        throw new Error("More comments could not be loaded.");
      }
      if (
        typeof body !== "object" ||
        body === null ||
        !("comments" in body) ||
        !Array.isArray(body.comments) ||
        !("nextCursor" in body) ||
        (body.nextCursor !== null && typeof body.nextCursor !== "string")
      ) {
        throw new Error("The social service returned an invalid response.");
      }
      setComments((current) => [...current, ...(body.comments as SocialComment[])]);
      setNextCursor(body.nextCursor);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "More comments could not be loaded.");
    } finally {
      setBusy(false);
    }
  }

  async function removeComment(commentId: string) {
    if (!user || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await accountRequest(`/social/comments/${encodeURIComponent(commentId)}`, user, {
        method: "DELETE",
      });
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      setCommentCount((count) => Math.max(0, count - 1));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The comment could not be removed.");
    } finally {
      setBusy(false);
    }
  }

  async function reportComment(commentId: string) {
    if (!user || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await accountRequest(
        `/social/comments/${encodeURIComponent(commentId)}/reports`,
        user,
        {
          method: "POST",
          body: JSON.stringify({ reason: "other", details: "Reported for moderator review." }),
        },
      );
      setReportingCommentId(null);
      setMessage("Comment reported for moderator review.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The report could not be submitted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Reactions and comments" className="mt-4 border-t border-white/10 pt-4">
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <button
            aria-pressed={liked}
            className="font-semibold text-emerald-200 hover:text-emerald-100 disabled:opacity-50"
            disabled={busy || loading}
            onClick={toggleLike}
            type="button"
          >
            {liked ? "♥ Liked" : "♡ Like"} · {likeCount}
          </button>
        ) : (
          <Link className="font-semibold text-emerald-200 hover:text-emerald-100" href="/login">
            Sign in to like · {likeCount}
          </Link>
        )}
        <span className="text-white/45">{commentCount} comments</span>
      </div>

      {user ? (
        <form className="mt-4 flex gap-2" onSubmit={submitComment}>
          <label className="sr-only" htmlFor={`comment-${contentType}-${contentId}`}>
            Write a comment
          </label>
          <input
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder:text-white/35"
            id={`comment-${contentType}-${contentId}`}
            maxLength={1000}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder="Add a comment…"
            value={commentBody}
          />
          <button
            className="rounded-full bg-emerald-300 px-4 py-2 text-xs font-bold text-emerald-950 disabled:opacity-50"
            disabled={busy || !commentBody.trim()}
            type="submit"
          >
            Post
          </button>
        </form>
      ) : (
        <p className="mt-3 text-xs text-white/45">
          <Link className="text-emerald-200 underline underline-offset-4" href="/login">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      {message ? (
        <p aria-live="polite" className="mt-3 text-xs text-rose-200" role="status">
          {message}
        </p>
      ) : null}
      <ul className="mt-4 space-y-3">
        {comments.map((comment) => (
          <li className="rounded-xl bg-white/[0.03] px-3 py-2.5" key={comment.id}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold text-emerald-100">
                {comment.author?.displayName ?? comment.author?.username ?? "Former user"}
                {comment.author ? (
                  <Link
                    className="ml-2 font-normal text-white/35 hover:text-white/60"
                    href={`/users/${encodeURIComponent(comment.author.username)}`}
                  >
                    @{comment.author.username}
                  </Link>
                ) : null}
              </p>
              {user && comment.author?.id === currentUserId ? (
                <button
                  className="shrink-0 text-[11px] text-white/35 hover:text-rose-200 disabled:opacity-50"
                  disabled={busy}
                  onClick={() => void removeComment(comment.id)}
                  type="button"
                >
                  Remove
                </button>
              ) : user ? (
                <button
                  className="shrink-0 text-[11px] text-white/35 hover:text-amber-100 disabled:opacity-50"
                  disabled={busy || reportingCommentId === comment.id}
                  onClick={() =>
                    setReportingCommentId((current) =>
                      current === comment.id ? null : comment.id,
                    )
                  }
                  type="button"
                >
                  {reportingCommentId === comment.id ? "Cancel report" : "Report"}
                </button>
              ) : null}
            </div>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/70">
              {comment.body}
            </p>
            {reportingCommentId === comment.id ? (
              <button
                className="mt-2 text-[11px] font-semibold text-amber-100 hover:text-amber-50 disabled:opacity-50"
                disabled={busy}
                onClick={() => void reportComment(comment.id)}
                type="button"
              >
                Send report to moderators
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {nextCursor ? (
        <button
          className="mt-3 text-xs font-semibold text-white/50 hover:text-white/80 disabled:opacity-50"
          disabled={busy}
          onClick={() => void loadMoreComments()}
          type="button"
        >
          Load older comments
        </button>
      ) : null}
    </section>
  );
}
