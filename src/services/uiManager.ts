import { Match } from '../types/match';

export class UIManager {
  private container: HTMLElement;
  private loadingElement!: HTMLElement;
  private errorElement!: HTMLElement;
  private matchesContainer!: HTMLElement;
  private lastUpdated!: HTMLElement;

  constructor() {
    this.container = document.getElementById('app')!;
    this.initializeUI();
  }

  private initializeUI(): void {
    this.container.innerHTML = `
      <div class="header">
        <h1>⚽ Sahadan İddaa Programı</h1>
        <p class="subtitle">Canlı futbol bahis oranları - sahadan.com</p>
      </div>
      
      <div class="controls">
        <button id="refresh-btn" class="refresh-btn">
          <span class="refresh-icon">🔄</span>
          Verileri Yenile
        </button>
        <div id="last-updated" class="last-updated"></div>
      </div>
      
      <div id="loading" class="loading">
        <div class="spinner"></div>
        <p>Bahis verileri yükleniyor...</p>
      </div>
      
      <div id="error" class="error hidden">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <h3>Veriler yüklenemedi</h3>
          <p id="error-message"></p>
          <button id="retry-btn" class="retry-btn">Tekrar Dene</button>
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
          <h3>Maç bulunamadı</h3>
          <p>Şu anda mevcut bahis oranı bulunmamaktadır.</p>
        </div>
      `;
      return;
    }

    const currentDate = new Date().toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const matchesHTML = matches.map(match => `
      <tr class="match-row">
        <td class="time-cell">${match.time}</td>
        <td class="league-cell">
          ${match.league ? `<span class="league-badge">${match.league}</span>` : ''}
        </td>
        <td class="teams-cell">
          <div class="match-teams">
            <span class="home-team">${match.homeTeam}</span>
            <span class="vs-separator">-</span>
            <span class="away-team">${match.awayTeam}</span>
          </div>
        </td>
        <td class="score-cell">
          <div class="score-placeholder">-</div>
        </td>
        <td class="code-cell">
          ${match.matchCode || String(match.id).padStart(5, '0')}
        </td>
        <td class="odds-cell home-odds">
          <div class="odds-value">${match.odds.home}</div>
          <div class="odds-code">01</div>
        </td>
        <td class="odds-cell draw-odds">
          <div class="odds-value">${match.odds.draw}</div>
          <div class="odds-code">02</div>
        </td>
        <td class="odds-cell away-odds">
          <div class="odds-value">${match.odds.away}</div>
          <div class="odds-code">03</div>
        </td>
        ${match.overUnder ? `
          <td class="odds-cell over-odds">
            <div class="odds-value">${match.overUnder.over25}</div>
            <div class="odds-code">01</div>
          </td>
          <td class="odds-cell under-odds">
            <div class="odds-value">${match.overUnder.under25}</div>
            <div class="odds-code">02</div>
          </td>
        ` : `
          <td class="odds-cell empty-odds">-</td>
          <td class="odds-cell empty-odds">-</td>
        `}
        <td class="combo-cell">
          <div class="combo-odds">
            <span class="combo-value">1.84</span>
          </div>
        </td>
        <td class="actions-cell">
          <button class="bet-button" title="Bahis Yap">
            💰
          </button>
        </td>
      </tr>
    `).join('');

    this.matchesContainer.innerHTML = `
      <div class="betting-table-container">
        <div class="table-header">
          <div class="date-header">${currentDate}</div>
          <div class="matches-count">Toplam ${matches.length} maç</div>
        </div>
        
        <table class="betting-table">
          <thead>
            <tr class="table-header-row">
              <th class="time-header">Saat</th>
              <th class="league-header">Lig</th>
              <th class="teams-header">Maç</th>
              <th class="score-header">Skor</th>
              <th class="code-header">Kod</th>
              <th class="odds-header home-header">
                <div class="odds-title">1</div>
                <div class="odds-subtitle">Ev Sahibi</div>
              </th>
              <th class="odds-header draw-header">
                <div class="odds-title">X</div>
                <div class="odds-subtitle">Beraberlik</div>
              </th>
              <th class="odds-header away-header">
                <div class="odds-title">2</div>
                <div class="odds-subtitle">Deplasman</div>
              </th>
              <th class="odds-header over-header">
                <div class="odds-title">2,5 Üst</div>
                <div class="odds-subtitle">Kod 01</div>
              </th>
              <th class="odds-header under-header">
                <div class="odds-title">2,5 Alt</div>
                <div class="odds-subtitle">Kod 02</div>
              </th>
              <th class="combo-header">
                <div class="odds-title">Kombin</div>
                <div class="odds-subtitle">1-X</div>
              </th>
              <th class="actions-header">İşlem</th>
            </tr>
          </thead>
          <tbody>
            ${matchesHTML}
          </tbody>
        </table>
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
      Son güncelleme: ${formattedTime}
    `;
  }

  private onRefresh: () => void = () => {};

  setRefreshHandler(handler: () => void): void {
    this.onRefresh = handler;
  }
}