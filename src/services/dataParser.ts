import { Match } from '../types/match';

export class DataParser {
  static parseMatchData(html: string): Match[] {
    // This will be used by both server and client-side parsing if needed
    const matches: Match[] = [];
    
    // Enhanced parsing logic for sahadan.com structure
    try {
      // Look for common sahadan patterns
      const timePattern = /(\d{1,2}:\d{2})/g;
      const teamPattern = /([A-Za-zÇĞıİÖŞÜçğıöşü\s]+)\s*[-vs]\s*([A-Za-zÇĞıİÖŞÜçğıöşü\s]+)/g;
      const oddsPattern = /(\d+[\.,]\d{2})/g;
      
      // Extract structured data from HTML
      const lines = html.split('\n');
      let currentMatch: Partial<Match> = {};
      let matchId = 1;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines and HTML tags
        if (!trimmedLine || trimmedLine.startsWith('<') || trimmedLine.startsWith('//')) {
          continue;
        }
        
        // Look for time patterns
        const timeMatch = trimmedLine.match(timePattern);
        if (timeMatch && !currentMatch.time) {
          currentMatch.time = timeMatch[0];
        }
        
        // Look for team patterns
        const teamMatch = trimmedLine.match(teamPattern);
        if (teamMatch && !currentMatch.homeTeam) {
          const teams = teamMatch[0].split(/[-vs]/);
          if (teams.length === 2) {
            currentMatch.homeTeam = teams[0].trim();
            currentMatch.awayTeam = teams[1].trim();
          }
        }
        
        // Look for odds patterns
        const oddsMatches = trimmedLine.match(oddsPattern);
        if (oddsMatches && oddsMatches.length >= 3 && currentMatch.homeTeam && !currentMatch.odds) {
          currentMatch.odds = {
            home: oddsMatches[0].replace(',', '.'),
            draw: oddsMatches[1].replace(',', '.'),
            away: oddsMatches[2].replace(',', '.')
          };
        }
        
        // If we have a complete match, add it to the array
        if (currentMatch.time && currentMatch.homeTeam && currentMatch.awayTeam && currentMatch.odds) {
          matches.push({
            id: matchId++,
            time: currentMatch.time,
            homeTeam: currentMatch.homeTeam,
            awayTeam: currentMatch.awayTeam,
            odds: currentMatch.odds
          });
          
          // Reset for next match
          currentMatch = {};
        }
      }
    } catch (error) {
      console.error('Error parsing match data:', error);
    }
    
    return matches;
  }
  
  static validateMatch(match: Partial<Match>): match is Match {
    return !!(
      match.id &&
      match.time &&
      match.homeTeam &&
      match.awayTeam &&
      match.odds &&
      match.odds.home &&
      match.odds.draw &&
      match.odds.away
    );
  }
}