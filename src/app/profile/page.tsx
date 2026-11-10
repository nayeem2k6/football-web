import type { Metadata } from "next";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const metadata: Metadata = {
  title: "My Profile | Football+",
  description: "Manage your Football+ profile.",
};

export default function ProfilePage() {
  return (
    <main className="space-y-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
        Football+ account
      </p>
      <ProfileEditor />
    </main>
  );
}
