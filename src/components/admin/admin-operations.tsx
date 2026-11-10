"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "@/components/auth/account-provider";
import { accountRequest } from "@/lib/account-api";

interface AdminUser {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  role: "user" | "admin";
  status: "active" | "suspended";
}

interface CommentReport {
  _id: string;
  reason: string;
  details: string;
  reporterId: { username: string } | null;
  commentId: {
    body: string;
    deletedAt: string | null;
    authorId: { username: string } | null;
  } | null;
}

interface AuditLog {
  _id: string;
  action: string;
  targetType: string;
  createdAt: string;
  actorId: { username: string } | null;
}

export function AdminOperations() {
  const { user, loading } = useAccount();
  const [authorized, setAuthorized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reports, setReports] = useState<CommentReport[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [busy, setBusy] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async () => {
    if (!user || !authorized) return;
    setErrorMessage("");
    try {
      const [userData, reportData, auditData] = await Promise.all([
        accountRequest<{ users: AdminUser[] }>("/admin/users?limit=50", user),
        accountRequest<{ reports: CommentReport[] }>(
          "/admin/social/reports?limit=50",
          user,
        ),
        accountRequest<{ logs: AuditLog[] }>("/admin/audit-logs?limit=20", user),
      ]);
      setUsers(userData.users);
      setReports(reportData.reports);
      setLogs(auditData.logs);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Admin data could not be loaded.",
      );
    }
  }, [authorized, user]);

  useEffect(() => {
    if (loading || !user) return;
    let active = true;
    void accountRequest<{ user: { id: string; role?: string } }>("/me", user)
      .then(({ user: profile }) => {
        if (active && profile.role === "admin") {
          setCurrentUserId(profile.id);
          setAuthorized(true);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Admin access could not be verified.",
        );
      });
    return () => {
      active = false;
    };
  }, [loading, user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function updateUser(
    targetId: string,
    patch: Partial<Pick<AdminUser, "role" | "status">>,
  ) {
    if (!user || busy) return;
    setBusy(targetId);
    setErrorMessage("");
    try {
      const result = await accountRequest<{ user: AdminUser }>(
        `/admin/users/${encodeURIComponent(targetId)}`,
        user,
        { method: "PATCH", body: JSON.stringify(patch) },
      );
      setUsers((current) =>
        current.map((entry) => (entry.id === result.user.id ? result.user : entry)),
      );
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "User access could not be updated.");
    } finally {
      setBusy("");
    }
  }

  async function resolveReport(
    reportId: string,
    status: "resolved" | "dismissed",
    removeComment: boolean,
  ) {
    if (!user || busy) return;
    setBusy(reportId);
    setErrorMessage("");
    try {
      await accountRequest(
        `/admin/social/reports/${encodeURIComponent(reportId)}`,
        user,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            removeComment,
            moderatorNote: removeComment ? "Comment removed after review." : "",
          }),
        },
      );
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "The report could not be resolved.");
    } finally {
      setBusy("");
    }
  }

  if (loading || !authorized) {
    return errorMessage ? (
      <p aria-live="polite" className="text-sm text-rose-200" role="status">
        {errorMessage}
      </p>
    ) : null;
  }

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <p aria-live="polite" className="rounded-xl bg-rose-400/10 p-4 text-sm text-rose-200" role="status">
          {errorMessage}
        </p>
      ) : null}
      <button
        className="text-sm font-semibold text-emerald-200 hover:text-emerald-100 disabled:opacity-50"
        disabled={Boolean(busy)}
        onClick={() => void loadData()}
        type="button"
      >
        Refresh admin queues
      </button>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Account access</p>
          <h2 className="mt-2 text-2xl font-black">Users and roles</h2>
        </div>
        {users.length ? (
          <ul className="divide-y divide-white/10">
            {users.map((entry) => (
              <li className="flex flex-wrap items-center justify-between gap-3 py-3" key={entry.id}>
                <div>
                  <p className="font-semibold">{entry.displayName ?? entry.username}</p>
                  <p className="text-xs text-white/45">
                    @{entry.username} · {entry.email ?? "No email"} · {entry.role} · {entry.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 disabled:opacity-40"
                    disabled={Boolean(busy) || entry.id === currentUserId}
                    onClick={() =>
                      void updateUser(entry.id, {
                        status: entry.status === "active" ? "suspended" : "active",
                      })
                    }
                    type="button"
                  >
                    {entry.status === "active" ? "Suspend" : "Reactivate"}
                  </button>
                  <button
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 disabled:opacity-40"
                    disabled={Boolean(busy) || entry.id === currentUserId}
                    onClick={() =>
                      void updateUser(entry.id, {
                        role: entry.role === "admin" ? "user" : "admin",
                      })
                    }
                    type="button"
                  >
                    {entry.role === "admin" ? "Remove admin" : "Make admin"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/45">No user records were returned.</p>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">Social moderation</p>
          <h2 className="mt-2 text-2xl font-black">Reported comments</h2>
        </div>
        {reports.length ? (
          <ul className="space-y-3">
            {reports.map((report) => (
              <li className="rounded-xl border border-white/10 p-4" key={report._id}>
                <p className="text-xs text-white/45">
                  {report.reason} · reported by @{report.reporterId?.username ?? "unknown"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-white/80">
                  {report.commentId?.body ?? "[Comment no longer available]"}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Author: @{report.commentId?.authorId?.username ?? "unknown"}
                  {report.details ? ` · ${report.details}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-full bg-rose-300 px-3 py-1.5 text-xs font-bold text-rose-950 disabled:opacity-50"
                    disabled={Boolean(busy) || Boolean(report.commentId?.deletedAt)}
                    onClick={() => void resolveReport(report._id, "resolved", true)}
                    type="button"
                  >
                    Remove comment & resolve
                  </button>
                  <button
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 disabled:opacity-50"
                    disabled={Boolean(busy)}
                    onClick={() => void resolveReport(report._id, "dismissed", false)}
                    type="button"
                  >
                    Dismiss report
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/45">No open comment reports.</p>
        )}
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.025] p-6" id="admin-audit">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Audit trail</p>
          <h2 className="mt-2 text-2xl font-black">Recent administrator actions</h2>
        </div>
        {logs.length ? (
          <ul className="space-y-2">
            {logs.map((log) => (
              <li className="text-sm text-white/65" key={log._id}>
                {log.action} · {log.targetType} · by @{log.actorId?.username ?? "unknown"} ·{" "}
                {new Date(log.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-white/45">No administrator actions recorded yet.</p>
        )}
      </section>
    </div>
  );
}
