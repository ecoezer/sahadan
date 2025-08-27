export interface Match {
  id: number;
  time: string;
  homeTeam: string;
  awayTeam: string;
  odds: {
    home: string;
    draw: string;
    away: string;
  };
}

export interface ApiResponse {
  matches: Match[];
  timestamp: string;
}