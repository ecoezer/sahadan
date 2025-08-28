import { Match } from '../types/match';

export class UIManager {
  private container: HTMLElement;
  private loadingElement!: HTMLElement;
  private errorElement!: HTMLElement;
  private matchesContainer!: HTMLElement;
  private lastUpdated!: HTMLElement;
  private currentMatches: any[] = [];
  private selectedDate: string = this.getTodayString();

  constructor() {
    this.container = document.getElementById('app')!;
    this.initializeUI();
  }

  private getTodayString(): string {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}.${month}.${year}`;
  }

  private formatDateForAPI(dateStr: string): string {
    // Always return the date in DD.MM.YYYY format as the server expects it
    console.log('🔄 formatDateForAPI input:', dateStr);
    const result = dateStr; // Keep original DD.MM.YYYY format
    console.log('🔄 formatDateForAPI output:', result);
    return result;
  }

  private initializeUI(): void {
    this.container.innerHTML = `
      <div class="betting-container">
        <div class="top-controls">
          <div class="sport-checkboxes">
            <div class="sport-checkbox">
              <input type="checkbox" id="futbol" checked>
              <label for="futbol">⚽ Futbol</label>
            </div>
            <div class="sport-checkbox">
              <input type="checkbox" id="basketbol">
              <label for="basketbol">🏀 Basketbol</label>
            </div>
          </div>
          <div class="date-controls">
            <span class="date-label">Tarih :</span>
            <select class="date-select">
              <option>28.08.2025 Per</option>
            </select>
            <span class="date-label">Lig :</span>
            <select class="league-select">
              <option>Hepsi</option>
            </select>
          </div>
        </div>
        
        <div class="tab-controls">
          <div class="tab-buttons">
            <button class="tab-button">Lige göre</button>
            <button class="tab-button active">Tarihe göre</button>
          </div>
          <select class="bet-type-select">
            <option>Maç Sonucu - Alt Üst - Çifte Şans</option>
          </select>
          <div class="only-played-checkbox">
            <input type="checkbox" id="only-played">
            <label for="only-played">Sadece Oynanmamış Maçlar</label>
          </div>
        </div>
        
        <div class="date-header">${this.selectedDate}</div>
        
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

    // Use the actual scraped matches instead of hardcoded sample data
    this.currentMatches = this.convertMatchesToTableFormat(matches);
    this.renderMatches(matches);
    this.updateTimestamp(timestamp);
  }

  private convertMatchesToTableFormat(matches: Match[]) {
    return matches.map(match => ({
      time: match.time,
      country: this.getCountryFlag(match.league),
      league: match.league || 'MISC',
      status: this.getMatchStatus(match.status),
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      score: match.score || '',
      code: match.matchCode || '',
      odds1: match.odds?.home || '1.00',
      oddsX: match.odds?.draw || '1.00', 
      odds2: match.odds?.away || '1.00',
      over25: match.overUnder?.over25 || '1.85',
      under25: match.overUnder?.under25 || '1.95',
      doubleChance1X: this.calculateDoubleChance(match.odds?.home, match.odds?.draw),
      doubleChance12: this.calculateDoubleChance(match.odds?.home, match.odds?.away),
      doubleChanceX2: this.calculateDoubleChance(match.odds?.draw, match.odds?.away),
      all: ''
    }));
  }

  private calculateDoubleChance(odd1?: string, odd2?: string): string {
    if (!odd1 || !odd2) return '1.20';
    
    const o1 = parseFloat(odd1);
    const o2 = parseFloat(odd2);
    
    if (isNaN(o1) || isNaN(o2)) return '1.20';
    
    // Calculate double chance odds using probability formula
    const prob1 = 1 / o1;
    const prob2 = 1 / o2;
    const combinedProb = prob1 + prob2;
    const doubleChanceOdd = 1 / combinedProb;
    
    return Math.max(1.01, doubleChanceOdd).toFixed(2);
  }

  private getCountryFlag(league?: string): string {
    const flagMap: { [key: string]: string } = {
      'TUR1': '🇹🇷', 'TUR': '🇹🇷',
      'ESP1': '🇪🇸', 'ESP': '🇪🇸',
      'ENG1': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'ENG': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      'GER1': '🇩🇪', 'GER': '🇩🇪', 'ALMBÖL': '🇩🇪',
      'ITA1': '🇮🇹', 'ITA': '🇮🇹',
      'FRA1': '🇫🇷', 'FRA': '🇫🇷',
      'POR1': '🇵🇹', 'POR': '🇵🇹',
      'NED1': '🇳🇱', 'NED': '🇳🇱',
      'BEL1': '🇧🇪', 'BEL': '🇧🇪',
      'SCO1': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'SCO': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'UEL': '🇪🇺', 'UCL': '🇪🇺',
      'ČEKK': '🇨🇿', 'CZE': '🇨🇿',
      'NOK': '🇳🇴', 'NOR': '🇳🇴'
    };
    return flagMap[league || ''] || '🌍';
  }

  private getMatchStatus(status?: string): string {
    switch (status) {
      case 'live': return '●';
      case 'finished': return 'C';
      case 'cancelled': return 'C';
      default: return '';
    }
  }



  private renderMatches(matches: Match[]): void {
    if (matches.length === 0) {
      this.matchesContainer.innerHTML = `
        <div class="no-matches">
          <div class="no-matches-icon">📅</div>
          <h3>Maç bulunamadı</h3>
          <p>${this.selectedDate} tarihinde mevcut bahis oranı bulunmamaktadır.</p>
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
            <div class="odds-value">${match.over25}</div>
            <div class="odds-code">01</div>
          </td>
          <td class="odds-cell">
            <div class="odds-value">${match.under25}</div>
            <div class="odds-code">02</div>
          </td>
          <td class="odds-cell">
            <div class="odds-value">${match.doubleChance1X}</div>
            <div class="odds-code">01</div>
          </td>
          <td class="odds-cell">
            <div class="odds-value">${match.doubleChance12}</div>
            <div class="odds-code">02</div>
          </td>
          <td class="odds-cell">
            <div class="odds-value">${match.doubleChanceX2}</div>
            <div class="odds-code">03</div>
          </td>
          <td class="all-cell">
            <button class="bet-all-button">💰</button>
          </td>
        </tr>
      `;
    }).join('');

    this.matchesContainer.innerHTML = `
      <div class="betting-table-container">
        <table class="betting-table">
          <thead>
            <tr>
              <th rowspan="2" class="col-time">
                İY
              </th>
              <th rowspan="2" class="col-country">
                MS
              </th>
              <th rowspan="2" class="col-league">
                MS
              </th>
              <th rowspan="2" class="col-status">
                1
              </th>
              <th rowspan="2" class="col-teams">
                X
              </th>
              <th rowspan="2" class="col-score">
                2
              </th>
              <th rowspan="2" class="col-code">
                Kod
              </th>
              <th class="col-odds">
                1
              </th>
              <th class="col-odds">
                X
              </th>
              <th class="col-odds">
                2
              </th>
              <th class="col-odds">
                2,5 Gol
              </th>
              <th class="col-odds red-header">2,5A</th>
              <th class="col-ou-code">ÇŞ</th>
              <th class="col-dc">1-X</th>
              <th class="col-dc">1-2</th>
              <th class="col-dc">X-2</th>
              <th rowspan="2" class="col-all">Tümü</th>
            </tr>
            <tr class="subheader-row">
              <th>01</th>
              <th>02</th>
              <th>03</th>
              <th>Kod</th>
              <th class="red-header">02</th>
              <th>Kod</th>
              <th>01</th>
              <th>02</th>
              <th>03</th>
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

  setDateChangeHandler(handler: (date: string) => void): void {
    // Date change handler would be used here if we had date selection UI
  }

  getSelectedDate(): string {
    return this.formatDateForAPI(this.selectedDate);
  }
}