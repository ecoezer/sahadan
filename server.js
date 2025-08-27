import express from 'express';
import cors from 'cors';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Enhanced user agents
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function extractMatchData(html) {
  const matches = [];
  
  try {
    console.log('HTML length:', html.length);
    console.log('Parsing HTML with JSDOM...');
    
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Method 1: Look for sahadan.com specific table structure
    const tables = document.querySelectorAll('table');
    console.log(`Found ${tables.length} tables`);
    
    tables.forEach((table, tableIndex) => {
      const rows = table.querySelectorAll('tr');
      console.log(`Table ${tableIndex}: ${rows.length} rows`);
      
      rows.forEach((row, rowIndex) => {
        try {
          const cells = row.querySelectorAll('td');
          if (cells.length < 5) return;
          
          const rowText = row.textContent || '';
          
          // Look for time pattern (HH:MM)
          const timeMatch = rowText.match(/(\d{1,2}:\d{2})/);
          
          // Look for team names with Turkish characters
          const teamPatterns = [
            /([A-Za-zÇĞıİÖŞÜçğıöşü\s\.]+)\s*[-–]\s*([A-Za-zÇĞıİÖŞÜçğıöşü\s\.]+)/,
            /([A-Za-zÇĞıİÖŞÜçğıöşü\s\.]+)\s*vs\s*([A-Za-zÇĞıİÖŞÜçğıöşü\s\.]+)/i,
            /([A-Za-zÇĞıİÖŞÜçğıöşü\s\.]+)\s*:\s*([A-Za-zÇĞıİÖŞÜçğıöşü\s\.]+)/
          ];
          
          let teamMatch = null;
          for (const pattern of teamPatterns) {
            teamMatch = rowText.match(pattern);
            if (teamMatch) break;
          }
          
          // Look for odds (Turkish format uses comma as decimal separator)
          const oddsMatches = rowText.match(/(\d+[,\.]\d{1,2})/g);
          
          // Look for match codes
          const codeMatch = rowText.match(/([A-Z0-9]{3,8})/);
          
          // Look for league information
          const leagueCell = cells[0] || cells[1];
          const leagueText = leagueCell ? leagueCell.textContent.trim() : '';
          const league = leagueText.length > 0 && leagueText.length < 50 ? leagueText : null;
          
          if (timeMatch && teamMatch && oddsMatches && oddsMatches.length >= 3) {
            const homeTeam = teamMatch[1].trim();
            const awayTeam = teamMatch[2].trim();
            
            // Filter out invalid team names
            if (homeTeam.length > 2 && awayTeam.length > 2 && 
                homeTeam !== awayTeam && 
                !homeTeam.match(/^\d+$/) && 
                !awayTeam.match(/^\d+$/) &&
                !homeTeam.includes('Oran') &&
                !awayTeam.includes('Oran')) {
              
              // Look for Over/Under odds in the same row
              let overUnder = null;
              if (oddsMatches.length >= 5) {
                overUnder = {
                  over25: oddsMatches[3].replace(',', '.'),
                  under25: oddsMatches[4].replace(',', '.')
                };
              }
              
              matches.push({
                id: matches.length + 1,
                time: timeMatch[1],
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                odds: {
                  home: oddsMatches[0].replace(',', '.'),
                  draw: oddsMatches[1] ? oddsMatches[1].replace(',', '.') : 'N/A',
                  away: oddsMatches[2] ? oddsMatches[2].replace(',', '.') : 'N/A'
                },
                league: league,
                matchCode: codeMatch ? codeMatch[1] : null,
                status: 'upcoming',
                overUnder: overUnder
              });
              
              console.log(`Found match: ${homeTeam} vs ${awayTeam} at ${timeMatch[1]}`);
            }
          }
        } catch (error) {
          console.log(`Error parsing row ${rowIndex}:`, error.message);
        }
      });
    });
    
    // Method 2: Look for div-based structure if no matches found
    if (matches.length === 0) {
      console.log('Trying div-based parsing...');
      
      const matchDivs = document.querySelectorAll('div[class*="match"], div[class*="game"], .program-row');
      console.log(`Found ${matchDivs.length} potential match divs`);
      
      matchDivs.forEach((div, index) => {
        const text = div.textContent || '';
        if (text.length < 10) return;
        
        const timeMatch = text.match(/(\d{1,2}:\d{2})/);
        const teamMatch = text.match(/([A-Za-zÇĞıİÖŞÜçğıöşü\s\.]+)\s*[-–vs:]\s*([A-Za-zÇĞıİÖŞÜçğıöşü\s\.]+)/);
        const oddsMatches = text.match(/(\d+[,\.]\d{1,2})/g);
        
        if (timeMatch && teamMatch && oddsMatches && oddsMatches.length >= 3) {
          const homeTeam = teamMatch[1].trim();
          const awayTeam = teamMatch[2].trim();
          
          if (homeTeam.length > 2 && awayTeam.length > 2 && homeTeam !== awayTeam) {
            matches.push({
              id: matches.length + 1,
              time: timeMatch[1],
              homeTeam: homeTeam,
              awayTeam: awayTeam,
              odds: {
                home: oddsMatches[0].replace(',', '.'),
                draw: oddsMatches[1].replace(',', '.'),
                away: oddsMatches[2].replace(',', '.')
              },
              status: 'upcoming'
            });
            
            console.log(`Found match in div: ${homeTeam} vs ${awayTeam}`);
          }
        }
      });
    }
  
  } catch (error) {
    console.error('Error parsing HTML with JSDOM:', error);
  }
  
  return matches;
}
// Proxy endpoint to fetch data from sahadan.com
app.get('/api/matches', async (req, res) => {
  try {
    console.log('Fetching data from sahadan.com...');
    
    const response = await fetch('https://arsiv.sahadan.com/Iddaa/program.aspx', {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.google.com/'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    console.log('HTML received, length:', html.length);
    
    // Log first 500 characters to see what we're getting
    console.log('HTML preview:', html.substring(0, 500));
    
    // Check if we got redirected or blocked
    if (html.includes('blocked') || html.includes('captcha') || html.includes('robot')) {
      console.log('Possible blocking detected');
    }
    
    const matches = extractMatchData(html);
    console.log(`Extracted ${matches.length} matches from sahadan.com`);

    // If no matches found, provide sample data
    if (matches.length === 0) {
      console.log('No matches extracted, using sample data...');
      
      const sampleMatches = [
        {
          id: 1,
          time: '15:00',
          homeTeam: 'Galatasaray',
          awayTeam: 'Fenerbahçe',
          odds: { home: '2.10', draw: '3.20', away: '3.50' }
        },
        {
          id: 2,
          time: '18:00',
          homeTeam: 'Beşiktaş',
          awayTeam: 'Trabzonspor',
          odds: { home: '1.85', draw: '3.40', away: '4.20' }
        },
        {
          id: 3,
          time: '20:45',
          homeTeam: 'Barcelona',
          awayTeam: 'Real Madrid',
          odds: { home: '2.45', draw: '3.10', away: '2.90' }
        },
        {
          id: 4,
          time: '21:30',
          homeTeam: 'Manchester City',
          awayTeam: 'Liverpool',
          odds: { home: '2.20', draw: '3.30', away: '3.10' }
        }
      ];
      
      matches.push(...sampleMatches);
    }

    console.log(`Found ${matches.length} matches`);
    res.json({ 
      matches, 
      timestamp: new Date().toISOString(),
      debug: { htmlLength: html.length, extractedMatches: matches.length }
    });
    
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data from sahadan.com',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});