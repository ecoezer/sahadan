const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Sample match data generator based on date
function generateMatchesForDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  console.log('🗓️ Processing date:', dateStr);
  
  // Parse DD.MM.YYYY format from UI
  let selectedDate;
  const [day, month, year] = dateStr.split('.');
  selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  selectedDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((selectedDate - today) / (1000 * 60 * 60 * 24));
  const dayOfWeek = selectedDate.getDay();
  
  console.log('📅 Date parsing result:', {
    input: dateStr,
    selectedDate: selectedDate.toDateString(),
    today: today.toDateString(),
    daysDiff: daysDiff,
    dayOfWeek: dayOfWeek,
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]
  });
  
  // Generate unique matches based on the specific date
  const matchSets = {
    0: [ // Sunday
      { home: 'Galatasaray', away: 'Fenerbahçe', league: 'TUR1', country: '🇹🇷' },
      { home: 'Beşiktaş', away: 'Trabzonspor', league: 'TUR1', country: '🇹🇷' },
      { home: 'Başakşehir', away: 'Konyaspor', league: 'TUR1', country: '🇹🇷' }
    ],
    1: [ // Monday
      { home: 'Barcelona', away: 'Real Madrid', league: 'ESP1', country: '🇪🇸' },
      { home: 'Bayern Munich', away: 'Dortmund', league: 'GER1', country: '🇩🇪' },
      { home: 'PSG', away: 'Marseille', league: 'FRA1', country: '🇫🇷' }
    ],
    2: [ // Tuesday
      { home: 'Manchester City', away: 'Liverpool', league: 'ENG1', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { home: 'Arsenal', away: 'Chelsea', league: 'ENG1', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { home: 'Tottenham', away: 'Manchester Utd', league: 'ENG1', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }
    ],
    3: [ // Wednesday
      { home: 'Juventus', away: 'Inter Milan', league: 'ITA1', country: '🇮🇹' },
      { home: 'AC Milan', away: 'Napoli', league: 'ITA1', country: '🇮🇹' },
      { home: 'Roma', away: 'Lazio', league: 'ITA1', country: '🇮🇹' }
    ],
    4: [ // Thursday
      { home: 'Sevilla', away: 'Villarreal', league: 'UEL', country: '🇪🇺' },
      { home: 'Eintracht Frankfurt', away: 'Bayer Leverkusen', league: 'UEL', country: '🇪🇺' },
      { home: 'West Ham', away: 'Brighton', league: 'UEL', country: '🇪🇺' }
    ],
    5: [ // Friday
      { home: 'Bayern Munich', away: 'RB Leipzig', league: 'GER1', country: '🇩🇪' },
      { home: 'Borussia Dortmund', away: 'Schalke', league: 'GER1', country: '🇩🇪' },
      { home: 'Wolfsburg', away: 'Hoffenheim', league: 'GER1', country: '🇩🇪' }
    ],
    6: [ // Saturday
      { home: 'Ajax', away: 'PSV', league: 'NED1', country: '🇳🇱' },
      { home: 'Benfica', away: 'Porto', league: 'POR1', country: '🇵🇹' },
      { home: 'Celtic', away: 'Rangers', league: 'SCO1', country: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' }
    ]
  };

  let baseMatches = matchSets[dayOfWeek] || matchSets[0];
  
  console.log('🏈 Selected matches for day', dayOfWeek, ':', baseMatches.map(m => `${m.home} vs ${m.away}`));
  
  // Add variation for different dates
  if (Math.abs(daysDiff) > 3) {
    baseMatches = [
      { home: 'Antalyaspor', away: 'Sivasspor', league: 'TUR1', country: '🇹🇷' },
      { home: 'Kasımpaşa', away: 'Alanyaspor', league: 'TUR1', country: '🇹🇷' },
      { home: 'Rizespor', away: 'Hatayspor', league: 'TUR1', country: '🇹🇷' }
    ];
    console.log('🏈 Using special matches for far date:', baseMatches.map(m => `${m.home} vs ${m.away}`));
  }

  const matches = baseMatches.map((match, index) => {
    // Create unique times based on date and day of week
    const baseTime = 18 + index + (dayOfWeek % 4);
    const minutes = (dayOfWeek * 15 + index * 15) % 60;
    const time = `${baseTime}:${minutes.toString().padStart(2, '0')}`;
    
    // Generate unique odds based on day of week and date
    const oddsBase = [2.10, 3.20, 2.80];
    const dayVariation = dayOfWeek * 0.2;
    const dateVariation = Math.abs(daysDiff) * 0.1;
    const odds = oddsBase.map((odd, i) => 
      (odd + dayVariation + dateVariation + (i * 0.1)).toFixed(2)
    );
    
    // Generate unique match code
    const matchCode = (10000 + dayOfWeek * 1000 + Math.abs(daysDiff) * 100 + index * 10).toString();
    
    // Status based on date relationship to today
    let status = '';
    let score = '';
    
    if (daysDiff < 0) {
      status = 'finished';
      const homeScore = (dayOfWeek + index) % 4;
      const awayScore = (dayOfWeek + index + 1) % 4;
      score = `${homeScore}-${awayScore}`;
    } else if (daysDiff === 0) {
      status = index % 2 === 0 ? 'live' : 'upcoming';
      if (status === 'live') {
        const homeScore = index % 3;
        const awayScore = (index + 1) % 3;
        score = `${homeScore}-${awayScore}`;
      }
    } else {
      status = 'upcoming';
    }

    return {
      id: dayOfWeek * 1000 + Math.abs(daysDiff) * 100 + index + 1,
      time: time,
      homeTeam: match.home,
      awayTeam: match.away,
      league: match.league,
      matchCode: matchCode,
      status: status,
      score: score,
      odds: {
        home: odds[0],
        draw: odds[1],
        away: odds[2]
      },
      overUnder: {
        over25: (1.80 + dayOfWeek * 0.1 + index * 0.05).toFixed(2),
        under25: (2.00 + dayOfWeek * 0.1 + index * 0.05).toFixed(2)
      }
    };
  });

  console.log('🎯 Final generated matches:', matches.map(m => `${m.homeTeam} vs ${m.awayTeam} (${m.status})`));

  return matches;
}

// API endpoint for matches
app.get('/api/matches', (req, res) => {
  try {
    // Get date from query parameters
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    console.log('Fetching matches for date:', date);
    
    // Generate matches for the selected date
    const matches = generateMatchesForDate(date);
    
    const response = {
      matches: matches,
      timestamp: new Date().toISOString(),
      source: 'development-server',
      totalMatches: matches.length,
      debug: {
        requestedDate: date,
        generatedMatches: matches.length,
        sampleData: true,
        parser: 'date-based-generator'
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`Development server running on http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/matches`);
});