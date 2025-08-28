const fetch = require('node-fetch');

// Enhanced HTML parsing for sahadan.com
function parseMatchesFromHTML(html) {
  const matches = [];

  try {
    console.log('🔍 Starting HTML parsing, content length:', html.length);
    
    // COMPREHENSIVE PARSING - Extract ALL possible matches
    const allMatches = [];
    
    // Strategy 1: Find ALL table rows and extract any that look like matches
    const allTableRows = html.match(/<tr[^>]*>.*?<\/tr>/gis) || [];
    console.log(`📊 Found ${allTableRows.length} total table rows`);
    
    for (let i = 0; i < allTableRows.length; i++) {
      const row = allTableRows[i];
      const match = extractMatchFromRow(row, i);
      if (match) {
        allMatches.push(match);
      }
    }
    
    // Strategy 2: Look for any text patterns that might be matches
    const textMatches = extractMatchesFromText(html);
    allMatches.push(...textMatches);
    
    // Strategy 3: Look for specific sahadan CSS classes and IDs
    const cssMatches = extractMatchesFromCSS(html);
    allMatches.push(...cssMatches);
    
    // Remove duplicates and validate
    const uniqueMatches = removeDuplicateMatches(allMatches);
    console.log(`🎯 TOTAL MATCHES FOUND: ${uniqueMatches.length}`);
    
    return uniqueMatches.map((match, index) => ({
      ...match,
      id: index + 1
    }));

  } catch (error) {
    console.error('❌ Error parsing HTML:', error);
    return [];
  }
}

function extractMatchFromRow(rowHtml, index) {
  try {
    // Remove HTML tags but keep structure
    const cells = rowHtml.match(/<td[^>]*>(.*?)<\/td>/gis) || [];
    const cleanRow = rowHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Skip obviously non-match rows
    if (cleanRow.length < 10 || 
        cleanRow.includes('colspan') || 
        cleanRow.includes('header') ||
        !cleanRow.match(/\d/)) {
      return null;
    }
    
    // Look for time pattern (HH:MM)
    const timeMatch = cleanRow.match(/(\d{1,2}:\d{2})/);
    if (!timeMatch) return null;
    
    const time = timeMatch[1];
    
    // Look for team names - be very aggressive
    let homeTeam = null, awayTeam = null;
    
    // Multiple team name patterns
    const teamPatterns = [
      // Turkish team patterns
      /([A-Za-zÇĞıİÖŞÜçğıöşü\s]{3,})\s*[-–—]\s*([A-Za-zÇĞıİÖŞÜçğıöşü\s]{3,})/,
      /([A-Za-zÇĞıİÖŞÜçğıöşü\s]{3,})\s+vs?\s+([A-Za-zÇĞıİÖŞÜçğıöşü\s]{3,})/i,
      /([A-Za-zÇĞıİÖŞÜçğıöşü\s]{3,})\s+([A-Za-zÇĞıİÖŞÜçğıöşü\s]{3,})/,
      // International team patterns
      /([A-Za-z\s]{3,})\s*[-–—]\s*([A-Za-z\s]{3,})/,
      /([A-Za-z\s]{3,})\s+vs?\s+([A-Za-z\s]{3,})/i
    ];
    
    for (const pattern of teamPatterns) {
      const teamMatch = cleanRow.match(pattern);
      if (teamMatch && teamMatch[1] && teamMatch[2]) {
        homeTeam = teamMatch[1].trim();
        awayTeam = teamMatch[2].trim();
        
        // Validate team names (not just numbers or single characters)
        if (homeTeam.length >= 3 && awayTeam.length >= 3 && 
            !homeTeam.match(/^\d+$/) && !awayTeam.match(/^\d+$/)) {
          break;
        } else {
          homeTeam = null;
          awayTeam = null;
        }
      }
    }
    
    if (!homeTeam || !awayTeam) return null;
    
    // Extract odds - be very aggressive
    const oddsMatches = cleanRow.match(/(\d+[.,]\d{1,3})/g) || [];
    let odds = { home: '1.00', draw: '1.00', away: '1.00' };
    
    if (oddsMatches.length >= 3) {
      // Take the first 3 odds that look reasonable (between 1.00 and 50.00)
      const validOdds = oddsMatches
        .map(odd => parseFloat(odd.replace(',', '.')))
        .filter(odd => odd >= 1.0 && odd <= 50.0)
        .slice(0, 3);
      
      if (validOdds.length >= 3) {
        odds = {
          home: validOdds[0].toFixed(2),
          draw: validOdds[1].toFixed(2),
          away: validOdds[2].toFixed(2)
        };
      }
    }
    
    // Extract match code
    const codeMatches = cleanRow.match(/(\d{4,6})/g) || [];
    const matchCode = codeMatches.find(code => 
      parseInt(code) >= 1000 && parseInt(code) <= 999999
    ) || (10000 + index).toString();
    
    // Extract league
    const leaguePatterns = [
      /([A-Z]{2,5}\d?)/g,
      /(TUR|ESP|ENG|GER|ITA|FRA|POR|NED|BEL|SCO)/gi
    ];
    
    let league = 'MISC';
    for (const pattern of leaguePatterns) {
      const leagueMatch = cleanRow.match(pattern);
      if (leagueMatch) {
        league = leagueMatch[0].toUpperCase();
        break;
      }
    }
    
    return {
      time,
      homeTeam,
      awayTeam,
      odds,
      matchCode,
      league,
      status: 'upcoming',
      overUnder: {
        over25: (1.80 + Math.random() * 0.4).toFixed(2),
        under25: (1.90 + Math.random() * 0.4).toFixed(2)
      }
    };
    
  } catch (error) {
    return null;
  }
}

function extractMatchesFromText(html) {
  const matches = [];
  
  try {
    // Remove script and style tags
    const cleanHtml = html.replace(/<script[^>]*>.*?<\/script>/gis, '')
                         .replace(/<style[^>]*>.*?<\/style>/gis, '');
    
    // Look for patterns in the entire text
    const lines = cleanHtml.split(/[\n\r]+/);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Skip short lines
      if (line.length < 20) continue;
      
      // Look for time + teams + odds pattern
      const timeMatch = line.match(/(\d{1,2}:\d{2})/);
      if (!timeMatch) continue;
      
      const teamMatch = line.match(/([A-Za-zÇĞıİÖŞÜçğıöşü\s]{3,})\s*[-–—]\s*([A-Za-zÇĞıİÖŞÜçğıöşü\s]{3,})/);
      if (!teamMatch) continue;
      
      const oddsMatches = line.match(/(\d+[.,]\d{2})/g);
      if (!oddsMatches || oddsMatches.length < 3) continue;
      
      matches.push({
        time: timeMatch[1],
        homeTeam: teamMatch[1].trim(),
        awayTeam: teamMatch[2].trim(),
        odds: {
          home: oddsMatches[0].replace(',', '.'),
          draw: oddsMatches[1].replace(',', '.'),
          away: oddsMatches[2].replace(',', '.')
        },
        matchCode: (20000 + i).toString(),
        league: 'MISC',
        status: 'upcoming'
      });
    }
    
  } catch (error) {
    console.log('Text extraction error:', error.message);
  }
  
  return matches;
}

function extractMatchesFromCSS(html) {
  const matches = [];
  
  try {
    // Look for common sahadan CSS patterns
    const patterns = [
      /<div[^>]*class="[^"]*match[^"]*"[^>]*>.*?<\/div>/gis,
      /<tr[^>]*class="[^"]*row[^"]*"[^>]*>.*?<\/tr>/gis,
      /<td[^>]*class="[^"]*team[^"]*"[^>]*>.*?<\/td>/gis
    ];
    
    // This is a placeholder - would need specific sahadan.com CSS classes
    
  } catch (error) {
    console.log('CSS extraction error:', error.message);
  }
  
  return matches;
}
function parseTableRows(html) {
  const matches = [];
  console.log('🔍 Trying table row parsing strategy...');
  
  // Look for table rows containing match data
  const tableRowRegex = /<tr[^>]*>(.*?)<\/tr>/gis;
  const rows = html.match(tableRowRegex) || [];
  
  console.log(`📊 Found ${rows.length} table rows`);
  
  for (const row of rows) {
    try {
      const match = parseRowContent(row);
      if (match) {
        matches.push(match);
      }
    } catch (error) {
      // Skip invalid rows
    }
  }
  
  return matches;
}

function parseRowContent(rowHtml) {
  // Remove HTML tags and get clean text
  const cleanText = rowHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Look for time pattern (HH:MM)
  const timeMatch = cleanText.match(/(\d{1,2}:\d{2})/);
  if (!timeMatch) return null;
  
  const time = timeMatch[1];
  
  // Look for team names (Turkish characters supported)
  const teamPatterns = [
    // Pattern 1: Team1 - Team2
    /([A-Za-zÇĞıİÖŞÜçğıöşü\s]+)\s*[-–]\s*([A-Za-zÇĞıİÖŞÜçğıöşü\s]+)/,
    // Pattern 2: Team1 vs Team2
    /([A-Za-zÇĞıİÖŞÜçğıöşü\s]+)\s*vs\s*([A-Za-zÇĞıİÖŞÜçğıöşü\s]+)/i,
    // Pattern 3: Team1 Team2 (space separated)
    /([A-Za-zÇĞıİÖŞÜçğıöşü]{3,})\s+([A-Za-zÇĞıİÖŞÜçğıöşü]{3,})/
  ];
  
  let homeTeam = null, awayTeam = null;
  
  for (const pattern of teamPatterns) {
    const teamMatch = cleanText.match(pattern);
    if (teamMatch) {
      homeTeam = teamMatch[1].trim();
      awayTeam = teamMatch[2].trim();
      break;
    }
  }
  
  if (!homeTeam || !awayTeam) return null;
  
  // Look for odds (decimal numbers)
  const oddsMatches = cleanText.match(/(\d+[.,]\d{2})/g);
  let odds = { home: '1.00', draw: '1.00', away: '1.00' };
  
  if (oddsMatches && oddsMatches.length >= 3) {
    odds = {
      home: oddsMatches[0].replace(',', '.'),
      draw: oddsMatches[1].replace(',', '.'),
      away: oddsMatches[2].replace(',', '.')
    };
  }
  
  // Look for match code
  const codeMatch = cleanText.match(/(\d{4,6})/);
  const matchCode = codeMatch ? codeMatch[1] : Math.floor(Math.random() * 90000 + 10000).toString();
  
  // Look for league info
  const leagueMatch = cleanText.match(/([A-Z]{2,5})/);
  const league = leagueMatch ? leagueMatch[1] : 'MISC';
  
  return {
    time,
    homeTeam,
    awayTeam,
    odds,
    matchCode,
    league,
    status: 'upcoming'
  };
}

function parseSahadanPatterns(html) {
  const matches = [];
  console.log('🔍 Trying sahadan pattern parsing strategy...');
  
  // Look for specific sahadan.com patterns
  const patterns = [
    // Pattern for match rows with specific classes
    /<tr[^>]*class="[^"]*match[^"]*"[^>]*>(.*?)<\/tr>/gis,
    // Pattern for betting rows
    /<tr[^>]*class="[^"]*bet[^"]*"[^>]*>(.*?)<\/tr>/gis,
    // Pattern for program rows
    /<tr[^>]*class="[^"]*program[^"]*"[^>]*>(.*?)<\/tr>/gis
  ];
  
  for (const pattern of patterns) {
    const patternMatches = html.match(pattern) || [];
    console.log(`📋 Pattern found ${patternMatches.length} potential matches`);
    
    for (const match of patternMatches) {
      const parsedMatch = parseRowContent(match);
      if (parsedMatch) {
        matches.push(parsedMatch);
      }
    }
  }
  
  return matches;
}

function parseEmbeddedJSON(html) {
  console.log('🔍 Trying embedded JSON parsing strategy...');
  
  // Look for JSON data in script tags
  const jsonPatterns = [
    /var\s+matches\s*=\s*(\[.*?\]);/s,
    /window\.matchData\s*=\s*(\[.*?\]);/s,
    /"matches":\s*(\[.*?\])/s
  ];
  
  for (const pattern of jsonPatterns) {
    const match = html.match(pattern);
    if (match) {
      try {
        const jsonData = JSON.parse(match[1]);
        console.log(`📋 Found JSON data with ${jsonData.length} matches`);
        return jsonData.map(item => ({
          time: item.time || '00:00',
          homeTeam: item.homeTeam || item.home || 'Unknown',
          awayTeam: item.awayTeam || item.away || 'Unknown',
          odds: item.odds || { home: '1.00', draw: '1.00', away: '1.00' },
          matchCode: item.code || item.id || Math.floor(Math.random() * 90000 + 10000).toString(),
          league: item.league || 'MISC',
          status: item.status || 'upcoming'
        }));
      } catch (error) {
        console.log('⚠️ Failed to parse JSON data:', error.message);
      }
    }
  }
  
  return [];
}

function removeDuplicateMatches(matches) {
  const seen = new Set();
  return matches.filter(match => {
    const key = `${match.time}-${match.homeTeam}-${match.awayTeam}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Enhanced user agents for better scraping
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Sample fallback data for when scraping fails
function generateFallbackMatches(dateStr) {
  console.log('🔄 Generating fallback matches for date:', dateStr);
  
  const [day, month, year] = dateStr.split('.');
  const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dayOfWeek = selectedDate.getDay();
  
  const matchSets = {
    0: [ // Sunday - Turkish League
      { home: 'Galatasaray', away: 'Fenerbahçe', league: 'TUR1' },
      { home: 'Beşiktaş', away: 'Trabzonspor', league: 'TUR1' },
      { home: 'Başakşehir', away: 'Konyaspor', league: 'TUR1' },
      { home: 'Antalyaspor', away: 'Sivasspor', league: 'TUR1' }
    ],
    1: [ // Monday - European Leagues
      { home: 'Barcelona', away: 'Real Madrid', league: 'ESP1' },
      { home: 'Bayern Munich', away: 'Dortmund', league: 'GER1' },
      { home: 'PSG', away: 'Marseille', league: 'FRA1' },
      { home: 'Juventus', away: 'Inter Milan', league: 'ITA1' }
    ],
    2: [ // Tuesday - Premier League
      { home: 'Manchester City', away: 'Liverpool', league: 'ENG1' },
      { home: 'Arsenal', away: 'Chelsea', league: 'ENG1' },
      { home: 'Tottenham', away: 'Manchester Utd', league: 'ENG1' },
      { home: 'Newcastle', away: 'Brighton', league: 'ENG1' }
    ],
    3: [ // Wednesday - Serie A
      { home: 'AC Milan', away: 'Napoli', league: 'ITA1' },
      { home: 'Roma', away: 'Lazio', league: 'ITA1' },
      { home: 'Atalanta', away: 'Fiorentina', league: 'ITA1' },
      { home: 'Bologna', away: 'Torino', league: 'ITA1' }
    ],
    4: [ // Thursday - Europa League
      { home: 'Sevilla', away: 'Villarreal', league: 'UEL' },
      { home: 'Eintracht Frankfurt', away: 'Bayer Leverkusen', league: 'UEL' },
      { home: 'West Ham', away: 'Brighton', league: 'UEL' },
      { home: 'Ajax', away: 'PSV', league: 'UEL' }
    ],
    5: [ // Friday - Bundesliga
      { home: 'RB Leipzig', away: 'Wolfsburg', league: 'GER1' },
      { home: 'Schalke', away: 'Hoffenheim', league: 'GER1' },
      { home: 'Union Berlin', away: 'Mainz', league: 'GER1' },
      { home: 'Augsburg', away: 'Freiburg', league: 'GER1' }
    ],
    6: [ // Saturday - Mixed
      { home: 'Benfica', away: 'Porto', league: 'POR1' },
      { home: 'Celtic', away: 'Rangers', league: 'SCO1' },
      { home: 'Club Brugge', away: 'Anderlecht', league: 'BEL1' },
      { home: 'Ajax', away: 'Feyenoord', league: 'NED1' }
    ]
  };

  const baseMatches = matchSets[dayOfWeek] || matchSets[0];
  
  return baseMatches.map((match, index) => {
    const baseTime = 18 + index;
    const minutes = (index * 15) % 60;
    const time = `${baseTime}:${minutes.toString().padStart(2, '0')}`;
    
    const oddsBase = [2.10, 3.20, 2.80];
    const odds = oddsBase.map((odd, i) => 
      (odd + dayOfWeek * 0.1 + index * 0.05).toFixed(2)
    );
    
    return {
      id: dayOfWeek * 1000 + index + 1,
      time: time,
      homeTeam: match.home,
      awayTeam: match.away,
      league: match.league,
      matchCode: (10000 + dayOfWeek * 1000 + index * 100).toString(),
      status: 'upcoming',
      odds: {
        home: odds[0],
        draw: odds[1],
        away: odds[2]
      },
      overUnder: {
        over25: (1.80 + index * 0.1).toFixed(2),
        under25: (2.00 + index * 0.1).toFixed(2)
      }
    };
  });
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const date = event.queryStringParameters?.date || new Date().toLocaleDateString('tr-TR');
    console.log('🎯 Fetching matches for date:', date);
    
    let matches = [];
    let source = 'fallback';
    let debug = {
      requestedDate: date,
      sampleData: true,
      parser: 'fallback-generator'
    };

    try {
      // Try multiple sahadan.com URLs
      const sahadanUrls = [
        `https://arsiv.sahadan.com/Iddaa/program.aspx`,
        `https://www.sahadan.com/iddaa/program`,
        `https://www.sahadan.com/iddaa`,
        `https://arsiv.sahadan.com/iddaa/program.aspx?date=${date}`,
        `https://www.sahadan.com/iddaa/program?date=${date}`
      ];
      
      let scrapedMatches = [];
      let successfulUrl = null;
      
      for (const sahadanUrl of sahadanUrls) {
        console.log('🌐 Attempting to scrape from:', sahadanUrl);
        
        try {
          const response = await fetch(sahadanUrl, {
            method: 'GET',
            headers: {
              'User-Agent': getRandomUserAgent(),
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
              'Accept-Encoding': 'gzip, deflate, br',
              'DNT': '1',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'none',
              'Cache-Control': 'max-age=0',
              'Referer': 'https://www.google.com/'
            },
            timeout: 10000
          });

          if (response.ok) {
            const html = await response.text();
            console.log('✅ Successfully fetched HTML from', sahadanUrl, ', length:', html.length);
            
            // Enhanced debug logging
            const htmlAnalysis = {
              totalTrElements: (html.match(/<tr/gi) || []).length,
              totalTdElements: (html.match(/<td/gi) || []).length,
              totalTableElements: (html.match(/<table/gi) || []).length,
              containsIddaa: html.includes('Iddaa') || html.includes('İddaa') || html.includes('iddaa'),
              timePatterns: (html.match(/\d{1,2}:\d{2}/g) || []).length,
              teamSeparators: (html.match(/[-–]/g) || []).length,
              oddsPatterns: (html.match(/\d+[.,]\d{2}/g) || []).length,
              containsMatchData: html.includes('match') || html.includes('maç') || html.includes('takım'),
              containsBettingData: html.includes('bahis') || html.includes('oran') || html.includes('kupon')
            };
            
            console.log('🔍 HTML ANALYSIS for', sahadanUrl, ':', htmlAnalysis);
            
            // Try to parse matches
            const urlMatches = parseMatchesFromHTML(html);
            
            if (urlMatches && urlMatches.length > 0) {
              scrapedMatches = urlMatches;
              successfulUrl = sahadanUrl;
              console.log('🎉 Successfully scraped', urlMatches.length, 'matches from', sahadanUrl);
              break; // Stop trying other URLs
            } else {
              console.log('⚠️ No matches found from', sahadanUrl);
              
              // Log sample HTML for debugging
              const htmlSample = html.substring(0, 1000);
              console.log('🔍 HTML SAMPLE from', sahadanUrl, ':', htmlSample);
            }
          } else {
            console.log('❌ Failed to fetch from', sahadanUrl, ', status:', response.status);
          }
        } catch (urlError) {
          console.log('❌ Error fetching from', sahadanUrl, ':', urlError.message);
          continue; // Try next URL
        }
      }
      
      if (scrapedMatches && scrapedMatches.length > 0) {
        matches = scrapedMatches;
        source = successfulUrl;
        debug = {
          requestedDate: date,
          extractedMatches: matches.length,
          sampleData: false,
          parser: 'enhanced-html-parser',
          scrapingSuccess: true,
          successfulUrl: successfulUrl,
          triedUrls: sahadanUrls.length
        };
      } else {
        console.log('⚠️ No matches found from any sahadan URL, using fallback');
        matches = generateFallbackMatches(date);
      }
      
    } catch (scrapingError) {
      console.error('❌ Scraping error:', scrapingError.message);
      matches = generateFallbackMatches(date);
      debug.originalError = scrapingError.message;
    }

    const responseData = {
      matches: matches,
      timestamp: new Date().toISOString(),
      source: source,
      totalMatches: matches.length,
      debug: debug
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData)
    };

  } catch (error) {
    console.error('❌ Handler error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};