import { Match } from '../types/match';

export class UIManager {
  private container: HTMLElement;
  private loadingElement!: HTMLElement;
  private errorElement!: HTMLElement;
  private matchesContainer!: HTMLElement;
  private lastUpdated!: HTMLElement;
  private dateSelector!: HTMLElement;
  private currentMatches: any[] = [];
  private sortState: { column: string; direction: 'asc' | 'desc' } = { column: '', direction: 'asc' };
  private selectedDate: string = this.getTodayString();
  private onDateChange: (date: string) => void = () => {};

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

  private generateDateOptions(): string {
    const options: string[] = [];
    const today = new Date();
    
    // Add past 30 days
    for (let i = 30; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = this.formatDateString(date);
      options.push(`<option value="${dateStr}">${dateStr}</option>`);
    }
    
    // Add today
    const todayStr = this.formatDateString(today);
    options.push(`<option value="${todayStr}" selected>${todayStr} (Bugün)</option>`);
    
    // Add next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = this.formatDateString(date);
      const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
      options.push(`<option value="${dateStr}">${dateStr} (${dayName})</option>`);
    }
    
    return options.join('');
  }

  private formatDateString(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
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
        
        <div class="date-selector-container">
          <div class="date-controls">
            <button id="prev-date" class="date-nav-btn">◀</button>
            <select id="date-selector" class="date-select">
              ${this.generateDateOptions()}
            </select>
            <button id="next-date" class="date-nav-btn">▶</button>
            <button id="today-btn" class="today-btn">Bugün</button>
          </div>
          <div class="date-info">
            <span class="date-label">Seçili Tarih:</span>
            <span id="selected-date-display" class="selected-date">${this.selectedDate}</span>
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
    this.dateSelector = document.getElementById('date-selector')!;

    // Add event listeners
    document.getElementById('refresh-btn')!.addEventListener('click', () => {
      this.onRefresh();
    });

    document.getElementById('retry-btn')!.addEventListener('click', () => {
      this.onRefresh();
    });

    // Date selector event listeners
    this.dateSelector.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.selectedDate = target.value;
      console.log('📅 Date selector changed to:', this.selectedDate);
      this.updateSelectedDateDisplay();
      const apiDate = this.formatDateForAPI(this.selectedDate);
      console.log('🚀 Calling onDateChange with:', apiDate);
      this.onDateChange(apiDate);
    });

    document.getElementById('prev-date')!.addEventListener('click', () => {
      this.navigateDate(-1);
    });

    document.getElementById('next-date')!.addEventListener('click', () => {
      this.navigateDate(1);
    });

    document.getElementById('today-btn')!.addEventListener('click', () => {
      this.goToToday();
    });
  }

  private navigateDate(direction: number): void {
    const currentDate = this.parseDate(this.selectedDate);
    currentDate.setDate(currentDate.getDate() + direction);
    const newDateStr = this.formatDateString(currentDate);
    console.log('🔄 Navigate date:', direction, 'New date:', newDateStr);
    
    // Update the selector
    const selector = this.dateSelector as HTMLSelectElement;
    const option = Array.from(selector.options).find(opt => opt.value === newDateStr);
    
    if (option) {
      selector.value = newDateStr;
      this.selectedDate = newDateStr;
      this.updateSelectedDateDisplay();
      const apiDate = this.formatDateForAPI(this.selectedDate);
      console.log('🚀 Navigate calling onDateChange with:', apiDate);
      this.onDateChange(apiDate);
    } else {
      // If date is not in the list, add it dynamically
      this.addDateOption(newDateStr);
      selector.value = newDateStr;
      this.selectedDate = newDateStr;
      this.updateSelectedDateDisplay();
      const apiDate = this.formatDateForAPI(this.selectedDate);
      console.log('🚀 Navigate (new option) calling onDateChange with:', apiDate);
      this.onDateChange(apiDate);
    }
  }

  private parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('.').map(Number);
    return new Date(year, month - 1, day);
  }

  private addDateOption(dateStr: string): void {
    const selector = this.dateSelector as HTMLSelectElement;
    const option = document.createElement('option');
    option.value = dateStr;
    option.textContent = dateStr;
    
    // Insert in chronological order
    const options = Array.from(selector.options);
    let inserted = false;
    
    for (let i = 0; i < options.length; i++) {
      const optionDate = this.parseDate(options[i].value);
      const newDate = this.parseDate(dateStr);
      
      if (newDate < optionDate) {
        selector.insertBefore(option, options[i]);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      selector.appendChild(option);
    }
  }

  private goToToday(): void {
    const todayStr = this.getTodayString();
    const selector = this.dateSelector as HTMLSelectElement;
    
    // Find today's option
    const todayOption = Array.from(selector.options).find(opt => 
      opt.value === todayStr || opt.textContent?.includes('Bugün')
    );
    
    if (todayOption) {
      selector.value = todayOption.value;
      this.selectedDate = todayOption.value;
      this.updateSelectedDateDisplay();
      const apiDate = this.formatDateForAPI(this.selectedDate);
      console.log('🚀 Today button calling onDateChange with:', apiDate);
      this.onDateChange(apiDate);
    }
  }

  private updateSelectedDateDisplay(): void {
    const display = document.getElementById('selected-date-display')!;
    const date = this.parseDate(this.selectedDate);
    const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
    const isToday = this.selectedDate === this.getTodayString();
    
    display.textContent = isToday ? `${this.selectedDate} (Bugün - ${dayName})` : `${this.selectedDate} (${dayName})`;
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
          const statusOrder: { [key: string]: number } = { '●': 1, 'C': 2, '': 3 };
          aValue = statusOrder[aValue as string] || 3;
          bValue = statusOrder[bValue as string] || 3;
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
        <div class="date-header">${this.selectedDate}</div>
        
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

  setDateChangeHandler(handler: (date: string) => void): void {
    this.onDateChange = handler;
  }

  getSelectedDate(): string {
    return this.formatDateForAPI(this.selectedDate);
  }
}