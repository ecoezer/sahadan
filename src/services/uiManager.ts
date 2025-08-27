import { Match } from '../types/match';

export class UIManager {
  private container: HTMLElement;
  private loadingElement: HTMLElement;
  private errorElement: HTMLElement;
  private matchesContainer: HTMLElement;
  private lastUpdated: HTMLElement;

  constructor() {
    this.container = document.getElementById('app')!;
    this.initializeUI();
  }

  private initializeUI(): void {
    this.container.innerHTML = `
      <div class="header">
        <h1>⚽ Sahadan Betting Quotes</h1>
        <p class="subtitle">Live football betting odds from sahadan.com</p>
      </div>
      
      <div class="controls">
        <button id="refresh-btn" class="refresh-btn">
          <span class="refresh-icon">🔄</span>
          Refresh Data
        </button>
        <div id="last-updated" class="last-updated"></div>
      </div>
      
      <div id="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading betting data...</p>
      </div>
      
      <div id="error" class="error hidden">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <h3>Unable to load data</h3>
          <p id="error-message"></p>
          <button id="retry-btn" class="retry-btn">Try Again</button>
        </div>
      </div>
      
      <div id="matches-container" class="matches-container hidden"></div>
    `;

    this.loadingElement = document.getElementById('loading')!;
    this.errorElement = document.getElementById('error')!;
    this.matchesContainer = document.getElementById('matches-container')!;
    this.lastUpdated = document.getElementById('last-updated')!;

    // Add event listeners
    document.getElementById('refresh-btn')!.addEventListener('click', () => {
      this.onRefresh();
    });

    document.getElementById('retry-btn')!.addEventListener('click', () => {
      this.onRefresh();
    });
  }

  showLoading(): void {
    this.loadingElement.classList.remove('hidden');
    this.errorElement.classList.add('hidden');
    this.matchesContainer.classList.add('hidden');
  }

  showError(message: string): void {
    this.loadingElement.classList.add('hidden');
    this.errorElement.classList.remove('hidden');
    this.matchesContainer.classList.add('hidden');
    
    const errorMessage = document.getElementById('error-message')!;
    errorMessage.textContent = message;
  }

  showMatches(matches: Match[], timestamp: string): void {
    this.loadingElement.classList.add('hidden');
    this.errorElement.classList.add('hidden');
    this.matchesContainer.classList.remove('hidden');

    this.renderMatches(matches);
    this.updateTimestamp(timestamp);
  }

  private renderMatches(matches: Match[]): void {
    if (matches.length === 0) {
      this.matchesContainer.innerHTML = `
        <div class="no-matches">
          <div class="no-matches-icon">📅</div>
          <h3>No matches available</h3>
          <p>There are currently no betting odds available.</p>
        </div>
      `;
      return;
    }

    const matchesHTML = matches.map(match => `
      <div class="match-card">
        <div class="match-header">
          <div class="match-time">
            <span class="time-icon">🕐</span>
            ${match.time}
          </div>
          <div class="match-id">#${match.id}</div>
        </div>
        
        <div class="teams">
          <div class="team home-team">
            <span class="team-name">${match.homeTeam}</span>
          </div>
          <div class="vs">VS</div>
          <div class="team away-team">
            <span class="team-name">${match.awayTeam}</span>
          </div>
        </div>
        
        <div class="odds">
          <div class="odds-header">Betting Odds</div>
          <div class="odds-row">
            <div class="odd-item home">
              <div class="odd-label">1 (Home)</div>
              <div class="odd-value">${match.odds.home}</div>
            </div>
            <div class="odd-item draw">
              <div class="odd-label">X (Draw)</div>
              <div class="odd-value">${match.odds.draw}</div>
            </div>
            <div class="odd-item away">
              <div class="odd-label">2 (Away)</div>
              <div class="odd-value">${match.odds.away}</div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    this.matchesContainer.innerHTML = `
      <div class="matches-header">
        <h2>Today's Matches (${matches.length})</h2>
      </div>
      <div class="matches-grid">
        ${matchesHTML}
      </div>
    `;
  }

  private updateTimestamp(timestamp: string): void {
    const date = new Date(timestamp);
    const formattedTime = date.toLocaleString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    this.lastUpdated.innerHTML = `
      <span class="update-icon">🕒</span>
      Last updated: ${formattedTime}
    `;
  }

  private onRefresh: () => void = () => {};

  setRefreshHandler(handler: () => void): void {
    this.onRefresh = handler;
  }
}