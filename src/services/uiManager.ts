import { Match } from '../types/match';

export class UIManager {
  private container: HTMLElement;
  private loadingElement!: HTMLElement;
  private errorElement!: HTMLElement;
  private matchesContainer!: HTMLElement;
  private lastUpdated!: HTMLElement;
  private currentMatches: any[] = [];
  private sortState: { column: string; direction: 'asc' | 'desc' } = { column: '', direction: 'asc' };

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

    this.currentMatches = this.prepareSahadanMatches();
    this.renderMatches(matches);
    this.updateTimestamp(timestamp);
  }

  private prepareSahadanMatches() {
    // Sahadan.com'daki gerçek veri yapısına göre örnek veriler
    return [
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
  }

  private sortMatches(column: string): void {
    // Toggle sort direction if clicking the same column
    if (this.sortState.column === column) {
      this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortState.column = column;
      this.sortState.direction = 'asc';
    }

    this.currentMatches.sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];

      // Handle different data types
      switch (column) {
        case 'time':
          // Convert time to minutes for proper sorting
          const aMinutes = this.timeToMinutes(aValue);
          const bMinutes = this.timeToMinutes(bValue);
          aValue = aMinutes;
          bValue = bMinutes;
          break;
        case 'odds1':
        case 'oddsX':
        case 'odds2':
        case 'under25':
          // Convert odds to numbers
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
          break;
        case 'code':
          // Convert codes to numbers
          aValue = parseInt(aValue) || 0;
          bValue = parseInt(bValue) || 0;
          break;
        case 'homeTeam':
        case 'awayTeam':
        case 'league':
          // String comparison (case insensitive)
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
          break;
        case 'status':
          // Custom status sorting: ● (live) first, then C (cancelled)
          const statusOrder = { '●': 1, 'C': 2, '': 3 };
          aValue = statusOrder[aValue] || 3;
          bValue = statusOrder[bValue] || 3;
          break;
      }

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return this.sortState.direction === 'asc' ? comparison : -comparison;
    });

    // Re-render the table with sorted data
    this.renderSortedMatches();
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private renderSortedMatches(): void {
    const matchesHTML = this.currentMatches.map((match) => {
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

    // Update only the tbody
    const tbody = this.matchesContainer.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = matchesHTML;
    }
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

    const matchesHTML = this.currentMatches.map((match) => {
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
              <th rowspan="2" class="time-header sortable" data-column="time">
                IY <span class="sort-indicator"></span>
              </th>
              <th rowspan="2" class="country-header sortable" data-column="country">
                MS <span class="sort-indicator"></span>
              </th>
              <th rowspan="2" class="league-header sortable" data-column="league">
                MS <span class="sort-indicator"></span>
              </th>
              <th rowspan="2" class="status-header sortable" data-column="status">
                1 <span class="sort-indicator"></span>
              </th>
              <th rowspan="2" class="teams-header sortable" data-column="homeTeam">
                X <span class="sort-indicator"></span>
              </th>
              <th rowspan="2" class="score-header sortable" data-column="score">
                2 <span class="sort-indicator"></span>
              </th>
              <th rowspan="2" class="code-header sortable" data-column="code">
                Kod <span class="sort-indicator"></span>
              </th>
              <th class="odds-header sortable" data-column="odds1">
                1 <span class="sort-indicator"></span>
              </th>
              <th class="odds-header sortable" data-column="oddsX">
                X <span class="sort-indicator"></span>
              </th>
              <th class="odds-header sortable" data-column="odds2">
                2 <span class="sort-indicator"></span>
              </th>
              <th class="odds-header sortable" data-column="under25">
                2,5 Gol <span class="sort-indicator"></span>
              </th>
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

    // Add click event listeners to sortable headers
    const sortableHeaders = this.matchesContainer.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const column = header.getAttribute('data-column');
        if (column) {
          this.sortMatches(column);
          this.updateSortIndicators();
        }
      });
    });
  }

  private updateSortIndicators(): void {
    // Clear all sort indicators
    const indicators = this.matchesContainer.querySelectorAll('.sort-indicator');
    indicators.forEach(indicator => {
      indicator.textContent = '';
    });

    // Set the active sort indicator
    if (this.sortState.column) {
      const activeHeader = this.matchesContainer.querySelector(`[data-column="${this.sortState.column}"] .sort-indicator`);
      if (activeHeader) {
        activeHeader.textContent = this.sortState.direction === 'asc' ? ' ▲' : ' ▼';
      }
    }
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