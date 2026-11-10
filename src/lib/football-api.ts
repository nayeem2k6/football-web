import type {
  FootballFixture,
  FootballResponse,
  FootballPlayerProfile,
  FootballStanding,
  FootballTeamProfile,
  FootballTeamSquad,
} from "./football-types";
import { apiBaseUrl } from "./api-base-url";

type FootballResult<T> =
  | { ok: true; value: FootballResponse<T> }
  | { ok: false; message: string };

async function requestFootball<T>(path: string): Promise<FootballResult<T>> {
  try {
    const response = await fetch(`${apiBaseUrl.replace(/\/+$/, "")}${path}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      const errorMessage =
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "object" &&
        body.error !== null &&
        "code" in body.error &&
        typeof body.error.code === "string"
          ? body.error.code
          : null;

      if (errorMessage === "SERVICE_UNAVAILABLE") {
        return {
          ok: false,
          message: "Football data is not configured or is temporarily unavailable.",
        };
      }
      if (errorMessage?.startsWith("FOOTBALL_PROVIDER")) {
        return {
          ok: false,
          message: "The football data provider is temporarily unavailable.",
        };
      }
      if (response.status === 400) {
        return { ok: false, message: "The requested football data is invalid." };
      }

      console.error("Football API request failed", {
        path,
        status: response.status,
        code: errorMessage,
      });
      return {
        ok: false,
        message: "Football data could not be loaded right now.",
      };
    }

    const value: FootballResponse<T> = await response.json();
    return { ok: true, value };
  } catch (error) {
    console.error("Could not reach the Football Platform API", error);
    return {
      ok: false,
      message: "The football service could not be reached. Please try again later.",
    };
  }
}

export function getLiveFixtures() {
  return requestFootball<FootballFixture[]>("/football/live");
}

export function getFixturesByDate(date: string) {
  return requestFootball<FootballFixture[]>(
    `/football/fixtures?date=${encodeURIComponent(date)}`,
  );
}

export function getStandings(leagueId: number, season: number) {
  return requestFootball<FootballStanding[]>(
    `/football/leagues/${leagueId}/standings?season=${season}`,
  );
}

export function getTeamsByLeague(leagueId: number, season: number) {
  const query = new URLSearchParams({
    leagueId: String(leagueId),
    season: String(season),
  });
  return requestFootball<FootballTeamProfile[]>(`/football/teams?${query}`);
}

export function getTeam(teamId: number) {
  return requestFootball<FootballTeamProfile | null>(`/football/teams/${teamId}`);
}

export function getTeamSquad(teamId: number) {
  return requestFootball<FootballTeamSquad | null>(
    `/football/teams/${teamId}/squad`,
  );
}

export function getPlayer(playerId: number, season: number) {
  return requestFootball<FootballPlayerProfile | null>(
    `/football/players/${playerId}?season=${season}`,
  );
}
