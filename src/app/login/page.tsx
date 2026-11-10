import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in | Football+",
  description: "Sign in to your Football+ account.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-[65vh] max-w-5xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
          Your football identity
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
          Join the conversation.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-white/55">
          Sign in to set up your profile and follow the people who make football
          yours.
        </p>
      </section>
      <SignInForm />
    </main>
  );
}
