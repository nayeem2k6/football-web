import { apiBaseUrl } from "./api-base-url";

export interface Video {
  id: string;
  title: string;
  description: string;
  playbackUrl: string;
  thumbnailUrl: string;
  duration: number;
  status: "pending" | "approved" | "rejected";
  moderationNote: string | null;
  createdAt: string;
  creator: { displayName: string | null; username: string } | null;
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
  return "Videos could not be loaded right now.";
}

export async function getPublicVideos(): Promise<
  | { ok: true; videos: Video[] }
  | { ok: false; message: string }
> {
  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/+$/, "")}/videos`,
      { cache: "no-store", headers: { accept: "application/json" } },
    );
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) return { ok: false, message: getErrorMessage(body) };
    if (
      typeof body !== "object" ||
      body === null ||
      !("videos" in body) ||
      !Array.isArray(body.videos)
    ) {
      throw new Error("The video service returned an invalid response.");
    }
    return { ok: true, videos: body.videos as Video[] };
  } catch (error) {
    console.error("Could not load public videos", error);
    return {
      ok: false,
      message: "The video service could not be reached. Please try again later.",
    };
  }
}

export async function getCreatorVideos(username: string): Promise<
  | { ok: true; videos: Video[] }
  | { ok: false; message: string }
> {
  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/+$/, "")}/videos/users/${encodeURIComponent(username)}`,
      { cache: "no-store", headers: { accept: "application/json" } },
    );
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) return { ok: false, message: getErrorMessage(body) };
    if (
      typeof body !== "object" ||
      body === null ||
      !("videos" in body) ||
      !Array.isArray(body.videos)
    ) {
      throw new Error("The video service returned an invalid response.");
    }
    return { ok: true, videos: body.videos as Video[] };
  } catch (error) {
    console.error("Could not load creator videos", error);
    return {
      ok: false,
      message: "The creator videos could not be loaded. Please try again later.",
    };
  }
}
