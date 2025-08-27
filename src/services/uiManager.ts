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
      <div class="betting-container">
        <div class="header-controls">
          <div class="control-group">
            <button class="control-button inactive">Lige göre</button>
            <button class="control-button active">Tarihe göre</button>
          </div>
          <div class="control-group">
            <select class="control-select">
              <option>Maç Sonucu - Alt Üst - Çifte Şans</option>
            </select>
          </div>
          <div class="control-group">
            <input type="checkbox" id="only-playing" class="control-checkbox">
            <label for="only-playing" class="checkbox-label">Sadece Oynananmış Maçlar</label>
          </div>
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
      </div>
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

    // Sahadan.com'daki gerçek veri yapısına göre örnek veriler
    const sahadanMatches = [
      {
        time: '18:30',
        country: '🇨🇿',
        league: 'ČEKK',
        status: '●',
        homeTeam: 'Vysoke Myto',
        awayTeam: 'Jihlava',
        score: '0-1',
        code: '16127',
        odds1: '7.62',
        oddsX: '4.97',
        odds2: '1.11',
        over25: '',
        under25: '',
        doubleChance1X: '',
        doubleChance12: '',
        doubleChanceX2: '',
        all: ''
      },
      {
        time: '18:30',
        country: '🇨🇿',
        league: 'ČEKK',
        status: 'C',
        homeTeam: 'Sokol Hostoun',
        awayTeam: 'Bohemians 1905',
        score: '1-2',
        code: '10376',
        odds1: '4.90',
        oddsX: '4.05',
        odds2: '1.29',
        over25: '',
        under25: '',
        doubleChance1X: '',
        doubleChance12: '',
        doubleChanceX2: '',
        all: ''
      },
      {
        time: '19:00',
        country: '🇳🇴',
        league: 'NOK',
        status: '●',
        homeTeam: 'Strommen',
        awayTeam: 'Odds Bk',
        score: '2-2',
        code: '13347',
        odds1: '3.45',
        oddsX: '4.09',
        odds2: '1.44',
        over25: '02644',
        under25: '1.54',
        doubleChance1X: '',
        doubleChance12: '',
        doubleChanceX2: '',
        all: ''
      },
      {
        time: '19:00',
        country: '🇳🇴',
        league: 'NOK',
        status: '●',
        homeTeam: 'Bjarg',
        awayTeam: 'Vard Haugesund',
        score: '2-1',
        code: '12893',
        odds1: '1.64',
        oddsX: '3.39',
        odds2: '3.09',
        over25: '04873',
        under25: '1.05',
        doubleChance1X: '',
        doubleChance12: '1.39',
        doubleChanceX2: '',
        all: ''
      },
      {
        time: '20:00',
        country: '🇩🇪',
        league: 'ALMBÖL',
        status: '●',
        homeTeam: 'Lübeck',
        awayTeam: 'Jeddeloh',
        score: '1-1',
        code: '12500',
        odds1: '2.14',
        oddsX: '3.13',
        odds2: '2.25',
        over25: '12501',
        under25: '1.17',
        doubleChance1X: '1.05',
        doubleChance12: '1.19',
        doubleChanceX2: '',
        all: ''
      }
    ];

    const matchesHTML = sahadanMatches.map((match) => {
      return `
        <tr class="match-row">
          <td class="time-cell">${match.time}</td>
          <td class="country-cell">${match.country}</td>
          <td class="league-cell">${match.league}</td>
          <td class="status-cell">
            ${match.status === '●' ? '<span class="status-live">●</span>' : 
              match.status === 'C' ? '<span class="status-cancelled">C</span>' : ''}
          </td>
          <td class="teams-cell">
            <span class="home-team">${match.homeTeam}</span>
            <span class="vs-separator"> - </span>
            <span class="away-team">${match.awayTeam}</span>
          </td>
          <td class="score-cell">${match.score}</td>
          <td class="code-cell">${match.code}</td>
          <td class="odds-cell">
            <div class="odds-value">${match.odds1}</div>
            <div class="odds-code">01</div>
          </td>
          <td class="odds-cell">
            <div class="odds-value">${match.oddsX}</div>
            <div class="odds-code">02</div>
          </td>
          <td class="odds-cell">
            <div class="odds-value">${match.odds2}</div>
            <div class="odds-code">03</div>
          </td>
          <td class="odds-cell">
            ${match.over25 ? `<div class="odds-code">${match.over25}</div>` : ''}
            ${match.under25 ? `<div class="odds-value">${match.under25}</div>` : ''}
            ${match.under25 ? `<div class="odds-code">01</div>` : ''}
          </td>
          <td class="odds-cell">
            <div class="odds-value red-odds">2,5Ü</div>
            <div class="odds-code">02▲</div>
          </td>
          <td class="odds-cell">
            ${match.doubleChance1X ? `<div class="odds-code">${match.doubleChance1X}</div>` : ''}
            ${match.doubleChance12 ? `<div class="odds-value">${match.doubleChance12}</div>` : ''}
          </td>
          <td class="odds-cell">
            ${match.doubleChance12 ? `<div class="odds-value">${match.doubleChance12}</div>` : ''}
          </td>
          <td class="odds-cell">
            ${match.doubleChanceX2 ? `<div class="odds-value">${match.doubleChanceX2}</div>` : ''}
          </td>
          <td class="all-cell">
            <button class="bet-all-button">💰</button>
          </td>
        </tr>
      `;
    }).join('');

    this.matchesContainer.innerHTML = `
      <div class="betting-table-container">
        <div class="date-header">27.08.2025</div>
        
        <table class="betting-table">
          <thead>
            <tr class="table-header-row">
              <th rowspan="2" class="time-header">IY</th>
              <th rowspan="2" class="country-header">MS</th>
              <th rowspan="2" class="league-header">MS</th>
              <th rowspan="2" class="status-header">1</th>
              <th rowspan="2" class="teams-header">X</th>
              <th rowspan="2" class="score-header">2</th>
              <th rowspan="2" class="code-header">Kod</th>
              <th class="odds-header">1</th>
              <th class="odds-header">X</th>
              <th class="odds-header">2</th>
              <th class="odds-header">2,5 Gol</th>
              <th class="odds-header red-header">2,5A</th>
              <th class="odds-header">ÇŞ</th>
              <th class="odds-header">1-X</th>
              <th class="odds-header">1-2</th>
              <th class="odds-header">X-2</th>
              <th rowspan="2" class="all-header">Tümü</th>
            </tr>
            <tr class="table-subheader-row">
              <th class="odds-subheader">01</th>
              <th class="odds-subheader">02</th>
              <th class="odds-subheader">03</th>
              <th class="odds-subheader">Kod</th>
              <th class="odds-subheader red-subheader">02▲</th>
              <th class="odds-subheader">Kod</th>
              <th class="odds-subheader">01</th>
              <th class="odds-subheader">02</th>
              <th class="odds-subheader">03</th>
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