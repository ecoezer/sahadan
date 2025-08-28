const fetch = require('node-fetch');

// Enhanced HTML parsing for sahadan.com
function parseMatchesFromHTML(html) {
  const matches = [];
  let matchId = 1;

  try {
    console.log('🔍 Starting HTML parsing, content length:', html.length);
    
    // Multiple parsing strategies for better coverage
    const strategies = [
      // Strategy 1: Look for table rows with match data
      () => parseTableRows(html),
      // Strategy 2: Look for specific sahadan patterns
      () => parseSahadanPatterns(html),
      // Strategy 3: Look for JSON data embedded in page
      () => parseEmbeddedJSON(html)
    ];

    for (const strategy of strategies) {
      try {
        const strategyMatches = strategy();
        if (strategyMatches && strategyMatches.length > 0) {
          console.log(`✅ Strategy found ${strategyMatches.length} matches`);
          matches.push(...strategyMatches);
        }
      } catch (error) {
        console.log('⚠️ Strategy failed:', error.message);
      }
    }

    // Remove duplicates based on teams and time
    const uniqueMatches = removeDuplicateMatches(matches);
    console.log(`🎯 Total unique matches found: ${uniqueMatches.length}`);
    
    return uniqueMatches.map((match, index) => ({
      ...match,
      id: index + 1
    }));

  } catch (error) {
    console.error('❌ Error parsing HTML:', error);
    return [];
  }
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
      // Try to scrape from sahadan.com
      const sahadanUrl = `https://arsiv.sahadan.com/Iddaa/program.aspx`;
      console.log('🌐 Attempting to scrape from:', sahadanUrl);
      
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
          'Cache-Control': 'max-age=0'
        },
        timeout: 15000
      });

      if (response.ok) {
        const html = await response.text();
        console.log('✅ Successfully fetched HTML, length:', html.length);
        
        const scrapedMatches = parseMatchesFromHTML(html);
        
        if (scrapedMatches && scrapedMatches.length > 0) {
          matches = scrapedMatches;
          source = 'sahadan.com';
          debug = {
            requestedDate: date,
            htmlLength: html.length,
            extractedMatches: matches.length,
            sampleData: false,
            parser: 'enhanced-html-parser',
            scrapingSuccess: true
          };
          console.log('🎉 Successfully scraped', matches.length, 'matches from sahadan.com');
        } else {
          console.log('⚠️ No matches found in scraped content, using fallback');
          matches = generateFallbackMatches(date);
        }
      } else {
        console.log('❌ Failed to fetch from sahadan.com, status:', response.status);
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