import type { Metadata } from "next";
import { CreatorHub } from "@/components/videos/creator-hub";

export const metadata: Metadata = {
  title: "Creator Hub | Football+",
  description: "Tools and insights for Football+ creators.",
};

export default function CreatorPage() {
  return (
    <main className="space-y-8">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Creator hub
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          Build your football community.
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-white/55">
          Publish football videos, track your channel, and manage content review.
        </p>
      </section>
      <CreatorHub />
    </main>
  );
}
