"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAccount } from "./account-provider";

function friendlyAuthError(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "The email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account already uses this email. Try signing in instead.";
    case "auth/weak-password":
      return "Choose a stronger password with at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it finished.";
    case "auth/unauthorized-domain":
      return "This site is not authorized for sign-in in Firebase settings.";
    default:
      return error instanceof Error
        ? error.message
        : "Sign-in could not be completed. Please try again.";
  }
}

export function SignInForm() {
  const router = useRouter();
  const { configured, createAccount, signInWithEmail, signInWithGoogle } =
    useAccount();
  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSubmitting(true);
    try {
      if (mode === "register") await createAccount(email, password);
      else await signInWithEmail(email, password);
      router.push("/profile");
      router.refresh();
    } catch (error) {
      setErrorMessage(friendlyAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function googleSignIn() {
    setErrorMessage("");
    setSubmitting(true);
    try {
      await signInWithGoogle();
      router.push("/profile");
      router.refresh();
    } catch (error) {
      setErrorMessage(friendlyAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-white">
        {mode === "sign-in" ? "Welcome back" : "Create your account"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-white/50">
        {configured
          ? "Your sign-in is secured by Firebase Authentication."
          : "Firebase sign-in is not configured in the web environment yet."}
      </p>

      <button
        className="mt-6 w-full rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!configured || submitting}
        onClick={googleSignIn}
        type="button"
      >
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-white/35">
        <span className="h-px flex-1 bg-white/10" />
        or use email
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form className="space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/75" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-emerald-300/60"
            disabled={!configured || submitting}
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/75" htmlFor="password">
            Password
          </label>
          <input
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-emerald-300/60"
            disabled={!configured || submitting}
            id="password"
            minLength={6}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>

        {errorMessage ? (
          <p aria-live="polite" className="rounded-lg bg-rose-400/10 p-3 text-sm text-rose-200">
            {errorMessage}
          </p>
        ) : null}
        {!configured ? (
          <p className="text-xs leading-5 text-amber-100/70">
            Configure the public Firebase Web app values and allowed domains
            before enabling sign-in.
          </p>
        ) : null}

        <button
          className="w-full rounded-xl bg-emerald-300 px-4 py-3 text-sm font-bold text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!configured || submitting}
          type="submit"
        >
          {submitting
            ? "Please wait…"
            : mode === "sign-in"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        {mode === "sign-in" ? "New to Football+?" : "Already have an account?"}{" "}
        <button
          className="font-semibold text-emerald-200 hover:text-emerald-100"
          disabled={submitting}
          onClick={() =>
            setMode((current) =>
              current === "sign-in" ? "register" : "sign-in",
            )
          }
          type="button"
        >
          {mode === "sign-in" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </section>
  );
}
