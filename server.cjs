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
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  
  console.log('🗓️ Processing date:', dateStr);
  
  // Parse the date string - handle DD.MM.YYYY format from UI  
  let selectedDate;
  if (dateStr.includes('.')) {
    // DD.MM.YYYY format - this is what we receive from UI
    const [day, month, year] = dateStr.split('.');
    selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else if (dateStr.includes('-')) {
    // YYYY-MM-DD format fallback
    selectedDate = new Date(dateStr);
  } else {
    // Fallback to today
    selectedDate = new Date();
  }
  selectedDate.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const daysDiff = Math.floor((selectedDate - today) / (1000 * 60 * 60 * 24));
  const dayOfWeek = selectedDate.getDay();
  
  console.log('📅 Date parsing result:', {
    input: dateStr,
    selectedDate: selectedDate.toISOString().split('T')[0],
    today: today.toISOString().split('T')[0],
    daysDiff: daysDiff,
    dayOfWeek: dayOfWeek,
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
    parsedDay: parseInt(dateStr.split('.')[0]),
    parsedMonth: parseInt(dateStr.split('.')[1]),
    parsedYear: parseInt(dateStr.split('.')[2])
  });
  
  // Different match sets based on day of week and date difference
  const matchSets = {
    0: [ // Sunday - Turkish leagues
      { home: 'Galatasaray', away: 'Fenerbahçe', league: 'TUR1', country: '🇹🇷' },
      { home: 'Beşiktaş', away: 'Trabzonspor', league: 'TUR1', country: '🇹🇷' },
      { home: 'Başakşehir', away: 'Konyaspor', league: 'TUR1', country: '🇹🇷' }
    ],
    1: [ // Monday - European leagues
      { home: 'Barcelona', away: 'Real Madrid', league: 'ESP1', country: '🇪🇸' },
      { home: 'Bayern Munich', away: 'Dortmund', league: 'GER1', country: '🇩🇪' },
      { home: 'PSG', away: 'Marseille', league: 'FRA1', country: '🇫🇷' }
    ],
    2: [ // Tuesday - Premier League
      { home: 'Manchester City', away: 'Liverpool', league: 'ENG1', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { home: 'Arsenal', away: 'Chelsea', league: 'ENG1', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { home: 'Tottenham', away: 'Manchester Utd', league: 'ENG1', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' }
    ],
    3: [ // Wednesday - Serie A
      { home: 'Juventus', away: 'Inter Milan', league: 'ITA1', country: '🇮🇹' },
      { home: 'AC Milan', away: 'Napoli', league: 'ITA1', country: '🇮🇹' },
      { home: 'Roma', away: 'Lazio', league: 'ITA1', country: '🇮🇹' }
    ],
    4: [ // Thursday - Europa League
      { home: 'Sevilla', away: 'Villarreal', league: 'UEL', country: '🇪🇺' },
      { home: 'Eintracht Frankfurt', away: 'Bayer Leverkusen', league: 'UEL', country: '🇪🇺' },
      { home: 'West Ham', away: 'Brighton', league: 'UEL', country: '🇪🇺' }
    ],
    5: [ // Friday - Bundesliga
      { home: 'Bayern Munich', away: 'RB Leipzig', league: 'GER1', country: '🇩🇪' },
      { home: 'Borussia Dortmund', away: 'Schalke', league: 'GER1', country: '🇩🇪' },
      { home: 'Wolfsburg', away: 'Hoffenheim', league: 'GER1', country: '🇩🇪' }
    ],
    6: [ // Saturday - Mixed leagues
      { home: 'Ajax', away: 'PSV', league: 'NED1', country: '🇳🇱' },
      { home: 'Benfica', away: 'Porto', league: 'POR1', country: '🇵🇹' },
      { home: 'Celtic', away: 'Rangers', league: 'SCO1', country: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' }
    ]
  };

  // Get base matches for the day
  let baseMatches = matchSets[dayOfWeek] || matchSets[0];
  
  console.log('🏈 Selected matches for day', dayOfWeek, ':', baseMatches.map(m => `${m.home} vs ${m.away}`));
  
  // Modify matches based on how far from today
  if (Math.abs(daysDiff) > 7) {
    // Far dates get special matches
    baseMatches = [
      { home: 'Antalyaspor', away: 'Sivasspor', league: 'TUR1', country: '🇹🇷' },
      { home: 'Kasımpaşa', away: 'Alanyaspor', league: 'TUR1', country: '🇹🇷' },
      { home: 'Rizespor', away: 'Hatayspor', league: 'TUR1', country: '🇹🇷' }
    ];
    console.log('🏈 Using far date matches:', baseMatches.map(m => `${m.home} vs ${m.away}`));
  }

  // Generate matches with proper data
  const matches = baseMatches.map((match, index) => {
    const baseTime = 18 + (index * 2) + (dayOfWeek % 3); // Vary start times by day
    const minutes = Math.floor(Math.random() * 4) * 15; // 00, 15, 30, 45
    const time = `${baseTime}:${minutes.toString().padStart(2, '0')}`;
    
    // Generate odds based on date difference
    const oddsVariation = Math.abs(daysDiff) * 0.1 + (dayOfWeek * 0.05);
    const baseOdds = [2.10, 3.20, 2.80];
    const odds = baseOdds.map(odd => (odd + (Math.random() - 0.5) * oddsVariation).toFixed(2));
    
    // Generate match code based on date
    const matchCode = (10000 + Math.abs(daysDiff) * 100 + dayOfWeek * 50 + index * 10 + Math.floor(Math.random() * 10)).toString();
    
    // Determine status and score based on whether it's past or future
    let status = '';
    let score = '';
    
    if (daysDiff < 0) {
      // Past match - show as finished with score
      status = 'finished';
      const homeScore = Math.floor(Math.random() * 4);
      const awayScore = Math.floor(Math.random() * 4);
      score = `${homeScore}-${awayScore}`;
    } else if (daysDiff === 0) {
      // Today - some might be live
      status = Math.random() > 0.5 ? 'live' : 'upcoming';
      if (status === 'live') {
        const homeScore = Math.floor(Math.random() * 3);
        const awayScore = Math.floor(Math.random() * 3);
        score = `${homeScore}-${awayScore}`;
      }
    } else {
      // Future match
      status = 'upcoming';
    }

    return {
      id: index + 1 + Math.abs(daysDiff) * 10 + dayOfWeek * 100,
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
        over25: (1.80 + Math.random() * 0.4 + dayOfWeek * 0.1).toFixed(2),
        under25: (2.00 + Math.random() * 0.4 + dayOfWeek * 0.1).toFixed(2)
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