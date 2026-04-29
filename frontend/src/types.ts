export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  startTime: string;
  endTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
}

export interface Commentary {
  id: string | number;
  message: string;
  minute: number;
  period?: string;
  eventType?: string;
  actor?: string;
  team?: string;
  createdAt?: string;
  matchId?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
