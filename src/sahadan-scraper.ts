export interface SahadanMatch {
  id: string;
  date: string;
  time: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  odds: {
    home: number;
    draw: number;
    away: number;
    over25: number;
    under25: number;
    gg: number; // Both teams to score
    ng: number; // No goal
  };
  code: string; // Iddaa code
}

export class SahadanScraper {
  private baseUrl = 'https://arsiv.sahadan.com/Iddaa/program.aspx';
  
  // Mock data that represents what you'd get from the actual site
  private mockData: SahadanMatch[] = [
    {
      id: '1',
      date: '2025-01-27',
      time: '20:00',
      league: 'Süper Lig',
      homeTeam: 'Galatasaray',
      awayTeam: 'Fenerbahçe',
      odds: {
        home: 2.10,
        draw: 3.20,
        away: 3.80,
        over25: 1.85,
        under25: 1.95,
        gg: 1.75,
        ng: 2.05
      },
      code: 'MBS'
    },
    {
      id: '2',
      date: '2025-01-27',
      time: '17:30',
      league: 'Süper Lig',
      homeTeam: 'Beşiktaş',
      awayTeam: 'Trabzonspor',
      odds: {
        home: 1.90,
        draw: 3.10,
        away: 4.20,
        over25: 1.80,
        under25: 2.00,
        gg: 1.70,
        ng: 2.10
      },
      code: 'MBT'
    },
    {
      id: '3',
      date: '2025-01-27',
      time: '15:00',
      league: '1. Lig',
      homeTeam: 'Ankaragücü',
      awayTeam: 'Samsunspor',
      odds: {
        home: 2.50,
        draw: 2.90,
        away: 2.80,
        over25: 1.90,
        under25: 1.90,
        gg: 1.85,
        ng: 1.95
      },
      code: 'MBU'
    }
  ];

  async fetchMatches(): Promise<SahadanMatch[]> {
    // In a real implementation, you would:
    // 1. Use a backend server to avoid CORS
    // 2. Make HTTP request to the Sahadan page
    // 3. Parse the HTML to extract match data
    // 4. Return structured data
    
    console.log('🔍 Fetching data from Sahadan...');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('✅ Data extracted successfully');
    return this.mockData;
  }

  // This shows the structure you'd use for real scraping
  parseMatchRow(htmlRow: string): SahadanMatch | null {
    // Example parsing logic (you'd implement this for real HTML)
    try {
      // Extract data from HTML table row
      // const cells = htmlRow.querySelectorAll('td');
      // const homeTeam = cells[3]?.textContent?.trim();
      // const awayTeam = cells[4]?.textContent?.trim();
      // etc...
      
      return null; // Placeholder
    } catch (error) {
      console.error('Error parsing match row:', error);
      return null;
    }
  }

  // Filter matches by criteria
  filterMatches(matches: SahadanMatch[], filters: {
    league?: string;
    minHomeOdds?: number;
    maxHomeOdds?: number;
    date?: string;
  }): SahadanMatch[] {
    return matches.filter(match => {
      if (filters.league && !match.league.toLowerCase().includes(filters.league.toLowerCase())) {
        return false;
      }
      if (filters.minHomeOdds && match.odds.home < filters.minHomeOdds) {
        return false;
      }
      if (filters.maxHomeOdds && match.odds.home > filters.maxHomeOdds) {
        return false;
      }
      if (filters.date && match.date !== filters.date) {
        return false;
      }
      return true;
    });
  }

  // Export data to different formats
  exportToJSON(matches: SahadanMatch[]): string {
    return JSON.stringify(matches, null, 2);
  }

  exportToCSV(matches: SahadanMatch[]): string {
    const headers = [
      'Date', 'Time', 'League', 'Home Team', 'Away Team', 'Code',
      'Home Odds', 'Draw Odds', 'Away Odds', 'Over 2.5', 'Under 2.5', 'GG', 'NG'
    ];
    
    const rows = matches.map(match => [
      match.date,
      match.time,
      match.league,
      match.homeTeam,
      match.awayTeam,
      match.code,
      match.odds.home,
      match.odds.draw,
      match.odds.away,
      match.odds.over25,
      match.odds.under25,
      match.odds.gg,
      match.odds.ng
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}