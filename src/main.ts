import './style.css';
import { LiveDataClient, LiveMatch, WebSocketMessage } from './websocket-client';
import { MockWebSocketServer } from './mock-websocket-server';

class LiveSportsApp {
  private client: LiveDataClient | null = null;
  private mockServer: MockWebSocketServer | null = null;
  private matches: Map<string, LiveMatch> = new Map();
  private isConnected = false;
  private useMockServer = true; // Toggle for real vs mock WebSocket

  constructor() {
    this.initializeUI();
    this.setupEventListeners();
  }

  private initializeUI(): void {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>🏆 Live Sports Data</h1>
          <div class="connection-status">
            <span class="status-indicator" id="status-indicator"></span>
            <span id="connection-text">Disconnected</span>
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
            <div class="no-data">No live matches available. Connect to start receiving data.</div>
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
          <div id="logs" class="logs"></div>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    const connectBtn = document.getElementById('connect-btn')!;
    const disconnectBtn = document.getElementById('disconnect-btn')!;
    const clearLogsBtn = document.getElementById('clear-logs')!;
    const useMockCheckbox = document.getElementById('use-mock') as HTMLInputElement;
    const urlInput = document.getElementById('websocket-url') as HTMLInputElement;

    connectBtn.addEventListener('click', () => this.connect());
    disconnectBtn.addEventListener('click', () => this.disconnect());
    clearLogsBtn.addEventListener('click', () => this.clearLogs());
    
    useMockCheckbox.addEventListener('change', (e) => {
      this.useMockServer = (e.target as HTMLInputElement).checked;
      if (this.useMockServer) {
        urlInput.value = 'wss://mock-server/live';
      } else {
        urlInput.value = 'wss://example.sahadan.com/live';
      }
    });
  }

  private connect(): void {
    const urlInput = document.getElementById('websocket-url') as HTMLInputElement;
    const url = urlInput.value.trim();

    if (!url) {
      this.addLog('error', 'Please enter a WebSocket URL');
      return;
    }

    this.addLog('info', `Attempting to connect to: ${url}`);

    if (this.useMockServer) {
      this.connectToMockServer();
    } else {
      this.connectToRealServer(url);
    }
  }

  private connectToMockServer(): void {
    this.mockServer = new MockWebSocketServer((data) => {
      this.handleMessage(data);
    });

    this.mockServer.start();
    this.updateConnectionStatus(true);
    this.addLog('success', 'Connected to mock WebSocket server');
  }

  private connectToRealServer(url: string): void {
    this.client = new LiveDataClient(
      url,
      (data) => this.handleMessage(data),
      (connected) => this.updateConnectionStatus(connected)
    );

    this.client.connect();
  }

  private disconnect(): void {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }

    if (this.mockServer) {
      this.mockServer.stop();
      this.mockServer = null;
    }

    this.updateConnectionStatus(false);
    this.addLog('info', 'Disconnected from WebSocket server');
  }

  private handleMessage(data: WebSocketMessage): void {
    this.addLog('data', `Received: ${data.type}`, data);
    this.updateMessageCount();
    this.updateLastUpdate();

    switch (data.type) {
      case 'match_update':
        this.updateMatch(data.data);
        break;
      case 'odds_change':
        this.updateOdds(data.data);
        break;
      case 'score_update':
        this.updateScore(data.data);
        break;
      case 'connection_status':
        this.addLog('info', 'Connection status updated');
        break;
    }

    this.renderMatches();
  }

  private updateMatch(matchData: LiveMatch): void {
    this.matches.set(matchData.id, matchData);
    this.updateMatchCount();
  }

  private updateOdds(data: { matchId: string; odds: any }): void {
    const match = this.matches.get(data.matchId);
    if (match) {
      match.odds = data.odds;
      this.matches.set(data.matchId, match);
    }
  }

  private updateScore(data: { matchId: string; score: string }): void {
    const match = this.matches.get(data.matchId);
    if (match) {
      match.score = data.score;
      this.matches.set(data.matchId, match);
    }
  }

  private renderMatches(): void {
    const matchesList = document.getElementById('matches-list')!;
    
    if (this.matches.size === 0) {
      matchesList.innerHTML = '<div class="no-data">No live matches available.</div>';
      return;
    }

    const matchesHTML = Array.from(this.matches.values()).map(match => `
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

    matchesList.innerHTML = matchesHTML;
  }

  private updateConnectionStatus(connected: boolean): void {
    this.isConnected = connected;
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

  private updateMatchCount(): void {
    document.getElementById('match-count')!.textContent = this.matches.size.toString();
  }

  private updateMessageCount(): void {
    const countElement = document.getElementById('message-count')!;
    const currentCount = parseInt(countElement.textContent || '0');
    countElement.textContent = (currentCount + 1).toString();
  }

  private updateLastUpdate(): void {
    document.getElementById('last-update')!.textContent = new Date().toLocaleTimeString();
  }

  private addLog(type: 'info' | 'error' | 'success' | 'data', message: string, data?: any): void {
    const logs = document.getElementById('logs')!;
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    
    let content = `<span class="timestamp">[${timestamp}]</span> <span class="message">${message}</span>`;
    
    if (data) {
      content += `<pre class="data">${JSON.stringify(data, null, 2)}</pre>`;
    }
    
    logEntry.innerHTML = content;
    logs.appendChild(logEntry);

    // Auto-scroll if enabled
    const autoScroll = document.getElementById('auto-scroll') as HTMLInputElement;
    if (autoScroll.checked) {
      logs.scrollTop = logs.scrollHeight;
    }

    // Limit log entries to prevent memory issues
    while (logs.children.length > 100) {
      logs.removeChild(logs.firstChild!);
    }
  }

  private clearLogs(): void {
    document.getElementById('logs')!.innerHTML = '';
  }
}

// Initialize the application
new LiveSportsApp();