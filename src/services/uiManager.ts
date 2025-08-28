import { Match } from '../types/match';

export class UIManager {
  private container: HTMLElement;
  private loadingElement!: HTMLElement;
  private errorElement!: HTMLElement;
  private matchesContainer!: HTMLElement;
  private currentMatches: any[] = [];
  private selectedDate: string = this.getTodayString();
  private sortColumn: string = '';
  private sortDirection: 'asc' | 'desc' = 'asc';

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
            <option value="ms-au-cs">Maç Sonucu - Alt Üst - Çifte Şans</option>
            <option value="iy-sonucu">İlk Yarı Sonucu</option>
            <option value="iy-ms">İlk Yarı - Maç Sonucu</option>
            <option value="1-5-gol">1,5 Üstü - Altı</option>
            <option value="2-5-gol">2,5 Üstü - Altı</option>
            <option value="3-5-gol">3,5 Üstü - Altı</option>
            <option value="4-5-gol">4,5 Üstü - Altı</option>
            <option value="0-5-gol">0,5 Üstü - Altı</option>
            <option value="iy-1-5-gol">İlk Yarı 1,5 Üstü - Altı</option>
            <option value="iy-0-5-gol">İlk Yarı 0,5 Üstü - Altı</option>
            <option value="cift-sans">Çifte Şans</option>
            <option value="tek-cift">Tek - Çift</option>
            <option value="iy-tek-cift">İlk Yarı Tek - Çift</option>
            <option value="her-iki-takim-gol">Her İki Takım Gol Atar</option>
            <option value="ilk-gol">İlk Golü Kim Atar</option>
            <option value="son-gol">Son Golü Kim Atar</option>
            <option value="mac-skoru">Maç Skoru</option>
            <option value="iy-skoru">İlk Yarı Skoru</option>
            <option value="penalti-var">Penaltı Var</option>
            <option value="kirmizi-kart">Kırmızı Kart Var</option>
            <option value="korner-sayisi">Korner Sayısı</option>
            <option value="iy-korner">İlk Yarı Korner</option>
            <option value="toplam-kart">Toplam Kart Sayısı</option>
            <option value="iy-kart">İlk Yarı Kart</option>
            <option value="handikap">Handikap</option>
            <option value="asya-handikap">Asya Handikap</option>
            <option value="gol-dakikasi">Gol Dakikası</option>
            <option value="mac-suresi">Maç Süresi</option>
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

    // Add betting type change handler
    const betTypeSelect = document.querySelector('.bet-type-select') as HTMLSelectElement;
    betTypeSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.handleBettingTypeChange(target.value);
    });
  }





  private handleBettingTypeChange(betType: string): void {
    console.log('Betting type changed to:', betType);
    // Re-render matches with new betting type
    if (this.currentMatches.length > 0) {
      this.renderMatchesWithBettingType(betType);
    }
  }

  private sortMatches(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.currentMatches.sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];

      // Handle different data types
      if (column === 'time') {
        aValue = this.timeToMinutes(aValue);
        bValue = this.timeToMinutes(bValue);
      } else if (column.includes('odds') || column.includes('over') || column.includes('under') || column.includes('doubleChance')) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (this.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Re-render with current betting type
    const betTypeSelect = document.querySelector('.bet-type-select') as HTMLSelectElement;
    this.renderMatchesWithBettingType(betTypeSelect.value);
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
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
    const betTypeSelect = document.querySelector('.bet-type-select') as HTMLSelectElement;
    this.renderMatchesWithBettingType(betTypeSelect?.value || 'ms-au-cs');
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



  private renderMatchesWithBettingType(betType: string): void {
    const matches = this.currentMatches;
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

    const { headers, matchRows } = this.generateTableContent(betType, matches);

    this.matchesContainer.innerHTML = `
      <div class="betting-table-container">
        <table class="betting-table">
          ${headers}
          <tbody>
            ${matchRows}
          </tbody>
        </table>
      </div>
    `;

    // Add click handlers for sortable columns
    this.addSortHandlers();
  }

  private generateTableContent(betType: string, matches: any[]): { headers: string, matchRows: string } {
    let headers = '';
    let matchRows = '';

    switch (betType) {
      case 'ms-au-cs': // Maç Sonucu - Alt Üst - Çifte Şans
        headers = this.getDefaultHeaders();
        matchRows = this.getDefaultMatchRows(matches);
        break;
      case 'iy-sonucu': // İlk Yarı Sonucu
        headers = this.getFirstHalfHeaders();
        matchRows = this.getFirstHalfMatchRows(matches);
        break;
      case '1-5-gol': // 1,5 Gol
        headers = this.getGoalHeaders('1,5');
        matchRows = this.getGoalMatchRows(matches, '1.5');
        break;
      case '2-5-gol': // 2,5 Gol
        headers = this.getGoalHeaders('2,5');
        matchRows = this.getGoalMatchRows(matches, '2.5');
        break;
      case 'cift-sans': // Çifte Şans
        headers = this.getDoubleChanceHeaders();
        matchRows = this.getDoubleChanceMatchRows(matches);
        break;
      default:
        headers = this.getDefaultHeaders();
        matchRows = this.getDefaultMatchRows(matches);
    }

    return { headers, matchRows };
  }

  private getDefaultHeaders(): string {
    return `
      <thead>
        <tr>
          <th rowspan="2" class="col-time sortable" data-column="time">
            Saat ${this.getSortIcon('time')}
          </th>
          <th rowspan="2" class="col-country">
            Ülke
          </th>
          <th rowspan="2" class="col-league sortable" data-column="league">
            Lig ${this.getSortIcon('league')}
          </th>
          <th rowspan="2" class="col-status">
            D
          </th>
          <th rowspan="2" class="col-teams sortable" data-column="homeTeam">
            Karşılaşma ${this.getSortIcon('homeTeam')}
          </th>
          <th rowspan="2" class="col-score">
            Skor
          </th>
          <th rowspan="2" class="col-code">
            Kod
          </th>
          <th class="col-odds sortable" data-column="odds1">
            1 ${this.getSortIcon('odds1')}
          </th>
          <th class="col-odds sortable" data-column="oddsX">
            X ${this.getSortIcon('oddsX')}
          </th>
          <th class="col-odds sortable" data-column="odds2">
            2 ${this.getSortIcon('odds2')}
          </th>
          <th class="col-ou-code">
            Kod
          </th>
          <th class="col-odds sortable" data-column="over25">
            2,5Ü ${this.getSortIcon('over25')}
          </th>
          <th class="col-odds red-header sortable" data-column="under25">
            2,5A ${this.getSortIcon('under25')}
          </th>
          <th class="col-dc sortable" data-column="doubleChance1X">
            1-X ${this.getSortIcon('doubleChance1X')}
          </th>
          <th class="col-dc sortable" data-column="doubleChance12">
            1-2 ${this.getSortIcon('doubleChance12')}
          </th>
          <th class="col-dc sortable" data-column="doubleChanceX2">
            X-2 ${this.getSortIcon('doubleChanceX2')}
          </th>
          <th rowspan="2" class="col-all">Tümü</th>
        </tr>
        <tr class="subheader-row">
          <th>01</th>
          <th>02</th>
          <th>03</th>
          <th>01</th>
          <th class="red-header">02</th>
          <th>01</th>
          <th>02</th>
          <th>03</th>
        </tr>
      </thead>
    `;
  }

  private getFirstHalfHeaders(): string {
    return `
      <thead>
        <tr>
          <th rowspan="2" class="col-time sortable" data-column="time">
            Saat ${this.getSortIcon('time')}
          </th>
          <th rowspan="2" class="col-country">Ülke</th>
          <th rowspan="2" class="col-league sortable" data-column="league">
            Lig ${this.getSortIcon('league')}
          </th>
          <th rowspan="2" class="col-status">D</th>
          <th rowspan="2" class="col-teams sortable" data-column="homeTeam">
            Karşılaşma ${this.getSortIcon('homeTeam')}
          </th>
          <th rowspan="2" class="col-score">Skor</th>
          <th rowspan="2" class="col-code">Kod</th>
          <th class="col-odds">İY 1</th>
          <th class="col-odds">İY X</th>
          <th class="col-odds">İY 2</th>
          <th rowspan="2" class="col-all">Tümü</th>
        </tr>
        <tr class="subheader-row">
          <th>01</th>
          <th>02</th>
          <th>03</th>
        </tr>
      </thead>
    `;
  }

  private getGoalHeaders(goalCount: string): string {
    return `
      <thead>
        <tr>
          <th rowspan="2" class="col-time sortable" data-column="time">
            Saat ${this.getSortIcon('time')}
          </th>
          <th rowspan="2" class="col-country">Ülke</th>
          <th rowspan="2" class="col-league sortable" data-column="league">
            Lig ${this.getSortIcon('league')}
          </th>
          <th rowspan="2" class="col-status">D</th>
          <th rowspan="2" class="col-teams sortable" data-column="homeTeam">
            Karşılaşma ${this.getSortIcon('homeTeam')}
          </th>
          <th rowspan="2" class="col-score">Skor</th>
          <th rowspan="2" class="col-code">Kod</th>
          <th class="col-odds">${goalCount}Ü</th>
          <th class="col-odds red-header">${goalCount}A</th>
          <th rowspan="2" class="col-all">Tümü</th>
        </tr>
        <tr class="subheader-row">
          <th>01</th>
          <th class="red-header">02</th>
        </tr>
      </thead>
    `;
  }

  private getDoubleChanceHeaders(): string {
    return `
      <thead>
        <tr>
          <th rowspan="2" class="col-time sortable" data-column="time">
            Saat ${this.getSortIcon('time')}
          </th>
          <th rowspan="2" class="col-country">Ülke</th>
          <th rowspan="2" class="col-league sortable" data-column="league">
            Lig ${this.getSortIcon('league')}
          </th>
          <th rowspan="2" class="col-status">D</th>
          <th rowspan="2" class="col-teams sortable" data-column="homeTeam">
            Karşılaşma ${this.getSortIcon('homeTeam')}
          </th>
          <th rowspan="2" class="col-score">Skor</th>
          <th rowspan="2" class="col-code">Kod</th>
          <th class="col-dc">1-X</th>
          <th class="col-dc">1-2</th>
          <th class="col-dc">X-2</th>
          <th rowspan="2" class="col-all">Tümü</th>
        </tr>
        <tr class="subheader-row">
          <th>01</th>
          <th>02</th>
          <th>03</th>
        </tr>
      </thead>
    `;
  }

  private getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return '<span class="sort-icon">↕️</span>';
    }
    return this.sortDirection === 'asc' ? 
      '<span class="sort-icon">↑</span>' : 
      '<span class="sort-icon">↓</span>';
  }

  private getDefaultMatchRows(matches: any[]): string {
    return matches.map((match) => `
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
        <td class="code-cell">${match.code}OU</td>
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
    `).join('');
  }

  private getFirstHalfMatchRows(matches: any[]): string {
    return matches.map((match) => `
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
        <td class="code-cell">${match.code}IY</td>
        <td class="odds-cell">
          <div class="odds-value">${(parseFloat(match.odds1) + 0.3).toFixed(2)}</div>
          <div class="odds-code">01</div>
        </td>
        <td class="odds-cell">
          <div class="odds-value">${(parseFloat(match.oddsX) + 0.5).toFixed(2)}</div>
          <div class="odds-code">02</div>
        </td>
        <td class="odds-cell">
          <div class="odds-value">${(parseFloat(match.odds2) + 0.3).toFixed(2)}</div>
          <div class="odds-code">03</div>
        </td>
        <td class="all-cell">
          <button class="bet-all-button">💰</button>
        </td>
      </tr>
    `).join('');
  }

  private getGoalMatchRows(matches: any[], goalType: string): string {
    return matches.map((match) => {
      const overOdds = goalType === '1.5' ? 
        (parseFloat(match.over25) - 0.2).toFixed(2) : 
        match.over25;
      const underOdds = goalType === '1.5' ? 
        (parseFloat(match.under25) + 0.3).toFixed(2) : 
        match.under25;
      
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
          <td class="code-cell">${match.code}G${goalType}</td>
          <td class="odds-cell">
            <div class="odds-value">${overOdds}</div>
            <div class="odds-code">01</div>
          </td>
          <td class="odds-cell">
            <div class="odds-value">${underOdds}</div>
            <div class="odds-code">02</div>
          </td>
          <td class="all-cell">
            <button class="bet-all-button">💰</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  private getDoubleChanceMatchRows(matches: any[]): string {
    return matches.map((match) => `
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
        <td class="code-cell">${match.code}CS</td>
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
    `).join('');
  }

  private addSortHandlers(): void {
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
      header.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const column = target.getAttribute('data-column');
        if (column) {
          this.sortMatches(column);
        }
      });
    });
  }

  private updateTimestamp(timestamp: string): void {
    // Update timestamp display in the date header
    const dateHeader = document.querySelector('.date-header');
    if (dateHeader) {
      const date = new Date(timestamp);
      const formattedTime = date.toLocaleString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      dateHeader.innerHTML = `${this.selectedDate} <span style="font-size: 10px; color: #666; margin-left: 10px;">🕒 Son güncelleme: ${formattedTime}</span>`;
    }
  }

  private onRefresh: () => void = () => {};

  setRefreshHandler(handler: () => void): void {
    this.onRefresh = handler;
  }

  setDateChangeHandler(_handler: (date: string) => void): void {
    // Date change handler would be used here if we had date selection UI
  }

  getSelectedDate(): string {
    return this.formatDateForAPI(this.selectedDate);
  }
}