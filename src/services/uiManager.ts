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
      
      <div class="header-controls">
        <div class="control-group">
          <span class="control-label">Lige göre</span>
          <button class="control-button">Tarihe göre</button>
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

    // Generate country flags and league info
    const getCountryInfo = (homeTeam: string, awayTeam: string) => {
      const turkishTeams = ['Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor', 'Başakşehir', 'Antalyaspor'];
      const czechTeams = ['Vysoke Myto', 'Jihlava', 'Sokol Hostoun', 'Bohemians 1905'];
      const norwegianTeams = ['Strommen', 'Odds Bk', 'Bjarg', 'Vard Haugesund'];
      const germanTeams = ['Lübeck', 'Jeddeloh'];
      
      if (turkishTeams.some(team => homeTeam.includes(team) || awayTeam.includes(team))) {
        return { flag: '🇹🇷', league: 'TUR' };
      } else if (czechTeams.some(team => homeTeam.includes(team) || awayTeam.includes(team))) {
        return { flag: '🇨🇿', league: 'ČEKK' };
      } else if (norwegianTeams.some(team => homeTeam.includes(team) || awayTeam.includes(team))) {
        return { flag: '🇳🇴', league: 'NOK' };
      } else if (germanTeams.some(team => homeTeam.includes(team) || awayTeam.includes(team))) {
        return { flag: '🇩🇪', league: 'ALMBÖL' };
      } else if (homeTeam.includes('Barcelona') || homeTeam.includes('Real Madrid')) {
        return { flag: '🇪🇸', league: 'ESP' };
      } else if (homeTeam.includes('Manchester') || homeTeam.includes('Liverpool')) {
        return { flag: '🇬🇧', league: 'ENG' };
      }
      return { flag: '🏳️', league: 'INT' };
    };

    const matchesHTML = matches.map((match, index) => {
      const countryInfo = getCountryInfo(match.homeTeam, match.awayTeam);
      const isLive = Math.random() > 0.7; // Simulate some live matches
      const hasScore = isLive;
      const score = hasScore ? `${Math.floor(Math.random() * 4)}-${Math.floor(Math.random() * 4)}` : '0-0';
      
      return `
        <tr class="match-row">
          <td class="time-cell">${match.time}</td>
          <td class="country-cell">
            <span class="country-flag">${countryInfo.flag}</span>
          </td>
          <td class="league-cell">${countryInfo.league}</td>
          <td class="status-cell">
            ${isLive ? '<div class="status-icon">●</div>' : ''}
          </td>
          <td class="teams-cell">
            <div class="match-teams">
              <span class="home-team">${match.homeTeam}</span>
              <span class="vs-separator">-</span>
              <span class="away-team">${match.awayTeam}</span>
            </div>
          </td>
          <td class="score-cell">
            <div class="score-value">${score}</div>
          </td>
          <td class="code-cell">
            ${match.matchCode || String(16127 + index).padStart(5, '0')}
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
          <td class="odds-cell over-odds">
            <div class="odds-value">${match.overUnder?.over25 || '1.75'}</div>
            <div class="odds-code">01</div>
          </td>
          <td class="odds-cell under-odds">
            <div class="odds-value">${match.overUnder?.under25 || '2.05'}</div>
            <div class="odds-code">02</div>
          </td>
          <td class="combo-cell">
            <div class="combo-odds">
              ${index % 3 === 0 ? `<span class="combo-value">${(Math.random() * 2 + 1).toFixed(2)}</span>` : ''}
            </div>
          </td>
          <td class="actions-cell">
            <button class="bet-button" title="Bahis Yap">
              💰
            </button>
          </td>
        </tr>
      `;
    }).join('');

    this.matchesContainer.innerHTML = `
      <div class="betting-table-container">
        <div class="date-header">${currentDate}</div>
        
        <table class="betting-table">
          <thead>
            <tr class="table-header-row">
              <th class="time-header">
                <div class="odds-title">IY</div>
              </th>
              <th class="country-header">
                <div class="odds-title">MS</div>
              </th>
              <th class="league-header">
                <div class="odds-title">MS</div>
              </th>
              <th class="status-header">
                <div class="odds-title">1</div>
              </th>
              <th class="teams-header">
                <div class="odds-title">X</div>
              </th>
              <th class="score-header">
                <div class="odds-title">2</div>
              </th>
              <th class="code-header">
                <div class="odds-title">2,5 Gol</div>
              </th>
              <th class="odds-header">
                <div class="odds-title">2,5A</div>
              </th>
              <th class="odds-header">
                <div class="odds-title">2,5Ü</div>
                <div class="odds-subtitle">▲</div>
              </th>
              <th class="odds-header">
                <div class="odds-title">ÇŞ</div>
              </th>
              <th class="odds-header">
                <div class="odds-title">1-X</div>
              </th>
              <th class="odds-header">
                <div class="odds-title">1-2</div>
              </th>
              <th class="odds-header">
                <div class="odds-title">X-2</div>
              </th>
              <th class="combo-header">
                <div class="odds-title">Tümü</div>
              </th>
            </tr>
            <tr class="table-header-row">
              <th class="time-header"></th>
              <th class="country-header"></th>
              <th class="league-header"></th>
              <th class="status-header"></th>
              <th class="teams-header">
                <div class="odds-title">Kod</div>
              </th>
              <th class="score-header"></th>
              <th class="code-header"></th>
              <th class="odds-header">
                <div class="odds-subtitle">01</div>
              </th>
              <th class="odds-header">
                <div class="odds-subtitle">02</div>
              </th>
              <th class="odds-header">
                <div class="odds-subtitle">03</div>
              </th>
              <th class="odds-header">
                <div class="odds-subtitle">Kod</div>
              </th>
              <th class="odds-header">
                <div class="odds-subtitle">01</div>
              </th>
              <th class="odds-header">
                <div class="odds-subtitle">02</div>
              </th>
              <th class="combo-header">
                <div class="odds-subtitle">03</div>
              </th>
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