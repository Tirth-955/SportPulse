import { Match, Commentary } from "../types";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  async getMatches(): Promise<Match[]> {
    const res = await fetch("/api/v1/matches");
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || "Failed to fetch matches");
    }

    return json.data || [];
  },

  async createMatch(matchData: any): Promise<void> {
    const res = await fetch("/api/v1/matches", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(matchData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create match");
    }
  },

  async getMatch(id: string): Promise<Match> {
    const res = await fetch(`/api/v1/matches/${id}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || "Failed to fetch match");
    }

    return json.data;
  },

  async getCommentary(id: string): Promise<Commentary[]> {
    const res = await fetch(`/api/v1/matches/${id}/commentary`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || "Failed to fetch commentary");
    }

    return json.data || [];
  },

  async postCommentary(
    id: string,
    data: { message: string; minute: number; period?: string; eventType?: string; actor?: string; team?: string }
  ): Promise<void> {
    const res = await fetch(`/api/v1/matches/${id}/commentary`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to post commentary");
    }
  },

  async updateScore(id: string, homeScore: number, awayScore: number): Promise<void> {
    const res = await fetch(`/api/v1/matches/${id}/score`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ homeScore, awayScore }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to update score");
    }
  },
};
