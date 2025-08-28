import './style.css';
import { SahadanScraper, SahadanMatch } from './sahadan-scraper';

class SahadanApp {
  private scraper: SahadanScraper;
  private matches: SahadanMatch[] = [];
  private isLoading = false;

  constructor() {
    this.scraper = new SahadanScraper();
    this.init();
  }

  private init() {
    this.renderUI();
    this.attachEventListeners();
    this.addLog('info', 'Sahadan Data Extractor initialized');
  }

  private renderUI() {
    document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
      <div class="app-container">
        <header class="app-header">
          <h1>🎯 Sahadan Data Extractor</h1>
          <div class="status">
            <span id="match-count">0 matches loaded</span>
          </div>
        </header>

        <div class="controls">
          <button id="fetch-btn" class="btn btn-primary">
            📊 Extract Sahadan Data
          </button>
          <button id="export-json-btn" class="btn btn-secondary" disabled>
            📄 Export JSON
          </button>
          <button id="export-csv-btn" class="btn btn-secondary" disabled>
            📊 Export CSV
          </button>
          
          <div class="filters">
            <h3>🔍 Filters</h3>
            <div class="filter-row">
              <select id="league-filter">
                <option value="">All Leagues</option>
                <option value="süper lig">Süper Lig</option>
                <option value="1. lig">1. Lig</option>
                <option value="champions league">Champions League</option>
              </select>
              
              <input type="number" id="min-odds" placeholder="Min Home Odds" step="0.1" min="1">
              <input type="number" id="max-odds" placeholder="Max Home Odds" step="0.1" min="1">
              
              <button id="apply-filters" class="btn btn-small">Apply Filters</button>
              <button id="clear-filters" class="btn btn-small">Clear</button>
            </div>
          </div>
        </div>

        <div class="stats">
          <div class="stat-card">
            <h3>Total Matches</h3>
            <span id="total-matches">0</span>
          </div>
          <div class="stat-card">
            <h3>Filtered Matches</h3>
            <span id="filtered-matches">0</span>
          </div>
          <div class="stat-card">
            <h3>Avg Home Odds</h3>
            <span id="avg-odds">0.00</span>
          </div>
          <div class="stat-card">
            <h3>Last Update</h3>
            <span id="last-update">Never</span>
          </div>
        </div>

        <div class="matches-container">
          <h2>📋 Extracted Matches</h2>
          <div id="matches-list" class="matches-list">
            <div class="no-data">Click "Extract Sahadan Data" to load betting data</div>
          </div>
        </div>

        <div class="logs-container">
          <h2>📡 Extraction Logs</h2>
          <div class="logs-controls">
            <button id="clear-logs" class="btn btn-small">Clear Logs</button>
          </div>
          <div id="logs" class="logs">
            <div class="log-entry info">
              <span class="timestamp">[${new Date().toLocaleTimeString()}]</span>
              <span class="message">Ready to extract data from https://arsiv.sahadan.com/Iddaa/program.aspx</span>
            </div>
          </div>
        </div>

        <div class="info-panel">
          <h3>🔧 How to Use for Real Scraping:</h3>
          <ol>
            <li><strong>Backend Required:</strong> Create a Node.js server to avoid CORS restrictions</li>
            <li><strong>HTTP Request:</strong> Use axios/fetch to get the HTML page</li>
            <li><strong>HTML Parsing:</strong> Use cheerio or jsdom to parse match data</li>
            <li><strong>Data Structure:</strong> Extract teams, odds, codes, and times</li>
            <li><strong>Real-time Updates:</strong> Set up intervals to refresh data</li>
          </ol>
          
          <div class="code-example">
            <h4>Example Backend Code:</h4>
            <pre><code>// Node.js backend example
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeSahadan() {
  const response = await axios.get('https://arsiv.sahadan.com/Iddaa/program.aspx');
  const $ = cheerio.load(response.data);
  
  const matches = [];
  $('.matchRow').each((i, row) => {
    const homeTeam = $(row).find('.homeTeam').text();
    const awayTeam = $(row).find('.awayTeam').text();
    const homeOdds = parseFloat($(row).find('.homeOdds').text());
    // ... extract more data
    
    matches.push({ homeTeam, awayTeam, homeOdds });
  });
  
  return matches;
}</code></pre>
          </div>
        </div>
      </div>
    `;
  }

  private attachEventListeners() {
    document.getElementById('fetch-btn')!.addEventListener('click', () => this.fetchData());
    document.getElementById('export-json-btn')!.addEventListener('click', () => this.exportJSON());
    document.getElementById('export-csv-btn')!.addEventListener('click', () => this.exportCSV());
    document.getElementById('apply-filters')!.addEventListener('click', () => this.applyFilters());
    document.getElementById('clear-filters')!.addEventListener('click', () => this.clearFilters());
    document.getElementById('clear-logs')!.addEventListener('click', () => this.clearLogs());
  }

  private async fetchData() {
    if (this.isLoading) return;

    this.isLoading = true;
    const fetchBtn = document.getElementById('fetch-btn') as HTMLButtonElement;
    fetchBtn.disabled = true;
    fetchBtn.textContent = '⏳ Extracting...';

    this.addLog('info', 'Starting data extraction from Sahadan...');

    try {
      this.matches = await this.scraper.fetchMatches();
      this.displayMatches(this.matches);
      this.updateStats(this.matches);
      this.enableExportButtons();
      
      this.addLog('success', `Successfully extracted ${this.matches.length} matches`);
      document.getElementById('last-update')!.textContent = new Date().toLocaleTimeString();
      
    } catch (error) {
      this.addLog('error', `Error extracting data: ${error}`);
    } finally {
      this.isLoading = false;
      fetchBtn.disabled = false;
      fetchBtn.textContent = '📊 Extract Sahadan Data';
    }
  }

  private displayMatches(matches: SahadanMatch[]) {
    const matchesList = document.getElementById('matches-list')!;
    
    if (matches.length === 0) {
      matchesList.innerHTML = '<div class="no-data">No matches found</div>';
      return;
    }

    matchesList.innerHTML = matches.map(match => `
      <div class="match-card">
        <div class="match-header">
          <div class="match-info">
            <span class="league">${match.league}</span>
            <span class="code">${match.code}</span>
            <span class="datetime">${match.date} ${match.time}</span>
          </div>
        </div>
        
        <div class="teams">
          <span class="home-team">${match.homeTeam}</span>
          <span class="vs">vs</span>
          <span class="away-team">${match.awayTeam}</span>
        </div>

        <div class="odds-grid">
          <div class="odds-section">
            <h4>1X2</h4>
            <div class="odds-row">
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
          
          <div class="odds-section">
            <h4>Goals</h4>
            <div class="odds-row">
              <div class="odd">
                <span class="label">O2.5</span>
                <span class="value">${match.odds.over25.toFixed(2)}</span>
              </div>
              <div class="odd">
                <span class="label">U2.5</span>
                <span class="value">${match.odds.under25.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="odds-section">
            <h4>Both Score</h4>
            <div class="odds-row">
              <div class="odd">
                <span class="label">GG</span>
                <span class="value">${match.odds.gg.toFixed(2)}</span>
              </div>
              <div class="odd">
                <span class="label">NG</span>
                <span class="value">${match.odds.ng.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  private updateStats(matches: SahadanMatch[]) {
    document.getElementById('total-matches')!.textContent = this.matches.length.toString();
    document.getElementById('filtered-matches')!.textContent = matches.length.toString();
    document.getElementById('match-count')!.textContent = `${matches.length} matches loaded`;
    
    if (matches.length > 0) {
      const avgOdds = matches.reduce((sum, match) => sum + match.odds.home, 0) / matches.length;
      document.getElementById('avg-odds')!.textContent = avgOdds.toFixed(2);
    }
  }

  private applyFilters() {
    const league = (document.getElementById('league-filter') as HTMLSelectElement).value;
    const minOdds = parseFloat((document.getElementById('min-odds') as HTMLInputElement).value) || undefined;
    const maxOdds = parseFloat((document.getElementById('max-odds') as HTMLInputElement).value) || undefined;

    const filtered = this.scraper.filterMatches(this.matches, {
      league,
      minHomeOdds: minOdds,
      maxHomeOdds: maxOdds
    });

    this.displayMatches(filtered);
    this.updateStats(filtered);
    this.addLog('info', `Applied filters: ${filtered.length} matches shown`);
  }

  private clearFilters() {
    (document.getElementById('league-filter') as HTMLSelectElement).value = '';
    (document.getElementById('min-odds') as HTMLInputElement).value = '';
    (document.getElementById('max-odds') as HTMLInputElement).value = '';
    
    this.displayMatches(this.matches);
    this.updateStats(this.matches);
    this.addLog('info', 'Filters cleared');
  }

  private enableExportButtons() {
    (document.getElementById('export-json-btn') as HTMLButtonElement).disabled = false;
    (document.getElementById('export-csv-btn') as HTMLButtonElement).disabled = false;
  }

  private exportJSON() {
    const json = this.scraper.exportToJSON(this.matches);
    this.downloadFile('sahadan-data.json', json, 'application/json');
    this.addLog('success', 'Data exported as JSON');
  }

  private exportCSV() {
    const csv = this.scraper.exportToCSV(this.matches);
    this.downloadFile('sahadan-data.csv', csv, 'text/csv');
    this.addLog('success', 'Data exported as CSV');
  }

  private downloadFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private addLog(type: 'info' | 'error' | 'success', message: string) {
    const logs = document.getElementById('logs')!;
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.innerHTML = `<span class="timestamp">[${timestamp}]</span> <span class="message">${message}</span>`;
    
    logs.appendChild(logEntry);
    logs.scrollTop = logs.scrollHeight;
  }

  private clearLogs() {
    const logs = document.getElementById('logs')!;
    logs.innerHTML = '';
  }
}

// Initialize the app
new SahadanApp();