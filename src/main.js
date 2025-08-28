// Simple Sahadan Data Extractor
console.log('App starting...');

// Mock data that represents Sahadan betting data
const mockSahadanData = [
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
      under25: 1.95
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
      under25: 2.00
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
      under25: 1.90
    },
    code: 'MBU'
  }
];

// Create the app HTML
document.querySelector('#app').innerHTML = `
  <div class="container">
    <header>
      <h1>🎯 Sahadan Data Extractor</h1>
      <p>Extract betting data from Sahadan.com</p>
    </header>
    
    <div class="controls">
      <button id="extractBtn" class="btn-primary">Extract Data from Sahadan</button>
      <button id="exportBtn" class="btn-secondary" style="display: none;">Export to CSV</button>
    </div>
    
    <div id="status" class="status"></div>
    <div id="results" class="results"></div>
  </div>
`;

// Add event listeners
document.getElementById('extractBtn').addEventListener('click', extractData);
document.getElementById('exportBtn').addEventListener('click', exportToCsv);

function extractData() {
  const statusDiv = document.getElementById('status');
  const resultsDiv = document.getElementById('results');
  const exportBtn = document.getElementById('exportBtn');
  
  statusDiv.innerHTML = '<div class="loading">🔍 Extracting data from Sahadan...</div>';
  resultsDiv.innerHTML = '';
  
  // Simulate data extraction delay
  setTimeout(() => {
    statusDiv.innerHTML = '<div class="success">✅ Data extracted successfully!</div>';
    
    let html = '<h2>Extracted Matches:</h2>';
    
    mockSahadanData.forEach(match => {
      html += `
        <div class="match-card">
          <div class="match-header">
            <h3>${match.homeTeam} vs ${match.awayTeam}</h3>
            <span class="code">${match.code}</span>
          </div>
          <div class="match-info">
            <p><strong>Date:</strong> ${match.date} ${match.time}</p>
            <p><strong>League:</strong> ${match.league}</p>
          </div>
          <div class="odds">
            <div class="odds-group">
              <h4>1X2 Odds</h4>
              <span class="odd">1: ${match.odds.home}</span>
              <span class="odd">X: ${match.odds.draw}</span>
              <span class="odd">2: ${match.odds.away}</span>
            </div>
            <div class="odds-group">
              <h4>Over/Under 2.5</h4>
              <span class="odd">Over: ${match.odds.over25}</span>
              <span class="odd">Under: ${match.odds.under25}</span>
            </div>
          </div>
        </div>
      `;
    });
    
    resultsDiv.innerHTML = html;
    exportBtn.style.display = 'inline-block';
  }, 2000);
}

function exportToCsv() {
  const headers = ['Date', 'Time', 'League', 'Home Team', 'Away Team', 'Code', 'Home Odds', 'Draw Odds', 'Away Odds', 'Over 2.5', 'Under 2.5'];
  
  const rows = mockSahadanData.map(match => [
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
    match.odds.under25
  ]);

  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sahadan-data.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

console.log('App loaded successfully!');