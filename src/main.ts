import './style.css';

// Simple test to make sure the app loads
console.log('App is loading...');

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="app-container">
    <header class="app-header">
      <h1>🏆 Live Sports WebSocket</h1>
      <div class="connection-status">
        <span class="status-indicator disconnected" id="status-indicator"></span>
        <span id="connection-text">Ready to Connect</span>
      </div>
    </header>

    <div class="controls">
      <button id="connect-btn" class="btn btn-primary">Connect to Live Data</button>
      <button id="disconnect-btn" class="btn btn-secondary" disabled>Disconnect</button>
      <div class="url-input">
        <input 
          type="text" 
          id="websocket-url" 
          placeholder="wss://example.sahadan.com/live"
          value="wss://mock-server/live"
        />
        <label>
          <input type="checkbox" id="use-mock" checked> Use Mock Server
        </label>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <h3>Live Matches</h3>
        <span id="match-count">0</span>
      </div>
      <div class="stat-card">
        <h3>Messages Received</h3>
        <span id="message-count">0</span>
      </div>
      <div class="stat-card">
        <h3>Last Update</h3>
        <span id="last-update">Never</span>
      </div>
    </div>

    <div class="matches-container">
      <h2>📊 Live Matches</h2>
      <div id="matches-list" class="matches-list">
        <div class="no-data">Click "Connect to Live Data" to start receiving live match data</div>
      </div>
    </div>

    <div class="logs-container">
      <h2>📡 WebSocket Messages</h2>
      <div class="logs-controls">
        <button id="clear-logs" class="btn btn-small">Clear Logs</button>
        <label>
          <input type="checkbox" id="auto-scroll" checked> Auto-scroll
        </label>
      </div>
      <div id="logs" class="logs">
        <div class="log-entry info">
          <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
          <span class="message">Application loaded successfully. Ready to connect to WebSocket.</span>
        </div>
      </div>
    </div>
  </div>
`;

// Add basic event listeners
const connectBtn = document.getElementById('connect-btn')!;
const disconnectBtn = document.getElementById('disconnect-btn')!;
const clearLogsBtn = document.getElementById('clear-logs')!;

connectBtn.addEventListener('click', () => {
  console.log('Connect button clicked');
  addLog('info', 'Starting mock WebSocket connection...');
  
  // Simulate connection
  setTimeout(() => {
    updateConnectionStatus(true);
    addLog('success', 'Connected to mock WebSocket server');
    startMockData();
  }, 1000);
});

disconnectBtn.addEventListener('click', () => {
  console.log('Disconnect button clicked');
  updateConnectionStatus(false);
  addLog('info', 'Disconnected from WebSocket server');
});

clearLogsBtn.addEventListener('click', () => {
  const logs = document.getElementById('logs')!;
  logs.innerHTML = '';
});

function updateConnectionStatus(connected: boolean) {
  const indicator = document.getElementById('status-indicator')!;
  const text = document.getElementById('connection-text')!;
  const connectBtn = document.getElementById('connect-btn') as HTMLButtonElement;
  const disconnectBtn = document.getElementById('disconnect-btn') as HTMLButtonElement;

  if (connected) {
    indicator.className = 'status-indicator connected';
    text.textContent = 'Connected';
    connectBtn.disabled = true;
    disconnectBtn.disabled = false;
  } else {
    indicator.className = 'status-indicator disconnected';
    text.textContent = 'Disconnected';
    connectBtn.disabled = false;
    disconnectBtn.disabled = true;
  }
}

function addLog(type: 'info' | 'error' | 'success' | 'data', message: string) {
  const logs = document.getElementById('logs')!;
  const timestamp = new Date().toLocaleTimeString();
  
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${type}`;
  logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> <span class="message">${message}</span>`;
  
  logs.appendChild(logEntry);
  logs.scrollTop = logs.scrollHeight;
}

function startMockData() {
  const matches = [
    {
      id: '1',
      homeTeam: 'Galatasaray',
      awayTeam: 'Fenerbahçe',
      score: '1-0',
      time: '45+2',
      odds: { home: 2.1, draw: 3.2, away: 3.8 },
      status: 'live'
    },
    {
      id: '2',
      homeTeam: 'Beşiktaş',
      awayTeam: 'Trabzonspor',
      score: '0-0',
      time: '23',
      odds: { home: 1.9, draw: 3.1, away: 4.2 },
      status: 'live'
    }
  ];

  // Display matches
  const matchesList = document.getElementById('matches-list')!;
  matchesList.innerHTML = matches.map(match => `
    <div class="match-card ${match.status}">
      <div class="match-header">
        <div class="teams">
          <span class="home-team">${match.homeTeam}</span>
          <span class="vs">vs</span>
          <span class="away-team">${match.awayTeam}</span>
        </div>
        <div class="match-info">
          <span class="score">${match.score}</span>
          <span class="time">${match.time}'</span>
          <span class="status-badge ${match.status}">${match.status}</span>
        </div>
      </div>
      <div class="odds">
        <div class="odd">
          <span class="label">1</span>
          <span class="value">${match.odds.home.toFixed(2)}</span>
        </div>
        <div class="odd">
          <span class="label">X</span>
          <span class="value">${match.odds.draw.toFixed(2)}</span>
        </div>
        <div class="odd">
          <span class="label">2</span>
          <span class="value">${match.odds.away.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Update stats
  document.getElementById('match-count')!.textContent = matches.length.toString();
  document.getElementById('message-count')!.textContent = '1';
  document.getElementById('last-update')!.textContent = new Date().toLocaleTimeString();

  addLog('data', 'Received match data for 2 live matches');
}

console.log('App setup complete');