import type { User } from "firebase/auth";
import { apiBaseUrl } from "./api-base-url";

export interface Profile {
  id: string;
  username: string;
  email?: string | null;
  emailVerified?: boolean;
  displayName: string | null;
  photoUrl: string | null;
  bio: string;
  role?: "user" | "admin";
  status?: "active" | "suspended";
  createdAt: string;
}

export interface PublicProfileResponse {
  user: Profile;
  counts: { followers: number; following: number };
}

function getErrorMessage(body: unknown): string {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "object" &&
    body.error !== null &&
    "message" in body.error &&
    typeof body.error.message === "string"
  ) {
    return body.error.message;
  }
  return "The request could not be completed.";
}

export async function accountRequest<T>(
  path: string,
  user: User,
  init: RequestInit = {},
): Promise<T> {
  const token = await user.getIdToken();
  const response = await fetch(`${apiBaseUrl.replace(/\/+$/, "")}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init.body &&
      !(typeof FormData !== "undefined" && init.body instanceof FormData)
        ? { "content-type": "application/json" }
        : {}),
      ...init.headers,
      authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getErrorMessage(body));
  return body as T;
}

export async function getPublicProfile(
  username: string,
): Promise<
  | { ok: true; value: PublicProfileResponse }
  | { ok: false; notFound: boolean; message: string }
> {
  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/+$/, "")}/users/${encodeURIComponent(username)}`,
      { cache: "no-store", headers: { accept: "application/json" } },
    );
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      return {
        ok: false,
        notFound: response.status === 404,
        message: getErrorMessage(body),
      };
    }
    return { ok: true, value: body as PublicProfileResponse };
  } catch (error) {
    console.error("Could not load public profile", error);
    return {
      ok: false,
      notFound: false,
      message: "The profile service could not be reached. Try again later.",
    };
  }
}
