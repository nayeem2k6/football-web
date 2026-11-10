import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminOperations } from "@/components/admin/admin-operations";
import { AdminVideoModeration } from "@/components/admin/admin-video-moderation";
import { NewsEditor } from "@/components/news/news-editor";

export const metadata: Metadata = {
  title: "Admin Dashboard | Football+",
  description: "Moderation and editorial tools for Football+ administrators.",
};

export default function AdminPage() {
  return (
    <main className="space-y-8">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Football+ administration
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Admin dashboard
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/55">
          Manage accounts, community reports, creator videos and Football+ stories in one place. Every operation is verified by the API.
        </p>
      </section>
      <AdminDashboard />
      <section className="scroll-mt-24 space-y-4" id="admin-users">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Accounts & community</p>
          <h2 className="mt-2 text-2xl font-black">User access and comment reports</h2>
        </div>
        <AdminOperations />
      </section>
      <section className="scroll-mt-24 space-y-4" id="admin-videos">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Creator moderation</p>
          <h2 className="mt-2 text-2xl font-black">Video review and reports</h2>
        </div>
        <AdminVideoModeration />
      </section>
      <section className="scroll-mt-24 space-y-4" id="admin-news">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Editorial</p>
          <h2 className="mt-2 text-2xl font-black">News and transfer stories</h2>
        </div>
        <NewsEditor />
      </section>
    </main>
  );
}
