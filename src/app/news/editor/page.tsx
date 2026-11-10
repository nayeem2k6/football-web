import type { Metadata } from "next";
import { NewsEditor } from "@/components/news/news-editor";

export const metadata: Metadata = {
  title: "Editorial Desk | Football+",
  description: "Create and manage Football+ editorial stories.",
};

export default function NewsEditorPage() {
  return (
    <main className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Football+ News
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Editorial desk
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/55">
          Write, save drafts, and publish attributed football stories.
        </p>
      </div>
      <NewsEditor />
    </main>
  );
}
