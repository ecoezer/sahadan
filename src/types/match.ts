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
  league?: string;
  matchCode?: string;
  status?: 'upcoming' | 'live' | 'finished';
  score?: string;
  overUnder?: {
    over25: string;
    under25: string;
  };
}

export interface ApiResponse {
  matches: Match[];
  timestamp: string;
  source: string;
  totalMatches: number;
  debug?: {
    htmlLength?: number;
    extractedMatches?: number;
    sampleData?: boolean;
    parser?: string;
    fallbackData?: boolean;
    originalError?: string;
  };
  error?: string;
}