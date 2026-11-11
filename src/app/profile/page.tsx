import type { Metadata } from "next";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const metadata: Metadata = {
  title: "My Profile | Football+",
  description: "Manage your Football+ profile.",
};

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
      <header className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(115deg,rgba(190,242,100,0.09),rgba(255,255,255,0.025)_46%,rgba(255,255,255,0.01))] px-6 py-7 sm:px-9 sm:py-9">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-lime-300/[0.08] blur-3xl"
        />
        <div className="relative">
          <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-lime-200 sm:text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-lime-300" />
            Football+ account
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.045em] text-white sm:text-4xl">
            Your profile<span className="text-lime-300">.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
            Make your place in the football community feel like yours.
          </p>
        </div>
      </header>
      <ProfileEditor />
    </main>
  );
}
