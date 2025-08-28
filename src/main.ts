import { SahadanScraper } from './scraper';
import './style.css';

class ScraperApp {
  private scraper: SahadanScraper;
  private isRunning = false;

  constructor() {
    this.scraper = new SahadanScraper();
    this.initializeUI();
  }

  private initializeUI(): void {
    const app = document.querySelector<HTMLDivElement>('#app')!;
    
    app.innerHTML = `
      <div class="container">
        <header>
          <h1>🕷️ Sahadan.com Scraper</h1>
          <p>Selenium-powered web scraper for İddaa betting data</p>
        </header>
        
        <div class="controls">
          <button id="startBtn" class="btn btn-primary">
            🚀 Start Scraping
          </button>
          <button id="stopBtn" class="btn btn-secondary" disabled>
            ⏹️ Stop
          </button>
        </div>
        
        <div class="status">
          <div id="statusText">Ready to scrape</div>
          <div id="progress" class="progress-bar"></div>
        </div>
        
        <div class="results">
          <h3>📊 Scraped Data</h3>
          <div id="dataContainer" class="data-container">
            <p class="placeholder">No data yet. Click "Start Scraping" to begin.</p>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;

    startBtn.addEventListener('click', () => this.startScraping());
    stopBtn.addEventListener('click', () => this.stopScraping());
  }

  private async startScraping(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.updateUI('running');
    this.updateStatus('🔄 Initializing WebDriver...');

    try {
      await this.scraper.initialize();
      this.updateStatus('🌐 Scraping sahadan.com...');
      
      const matches = await this.scraper.scrapeIddaaProgram();
      
      this.displayResults(matches);
      this.updateStatus(`✅ Scraping completed! Found ${matches.length} matches`);
      
    } catch (error) {
      console.error('Scraping error:', error);
      this.updateStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await this.scraper.close();
      this.isRunning = false;
      this.updateUI('stopped');
    }
  }

  private async stopScraping(): Promise<void> {
    if (!this.isRunning) return;
    
    this.updateStatus('🛑 Stopping scraper...');
    await this.scraper.close();
    this.isRunning = false;
    this.updateUI('stopped');
    this.updateStatus('⏹️ Scraping stopped');
  }

  private updateUI(state: 'running' | 'stopped'): void {
    const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
    const progress = document.getElementById('progress') as HTMLDivElement;

    if (state === 'running') {
      startBtn.disabled = true;
      stopBtn.disabled = false;
      progress.classList.add('active');
    } else {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      progress.classList.remove('active');
    }
  }

  private updateStatus(message: string): void {
    const statusText = document.getElementById('statusText');
    if (statusText) {
      statusText.textContent = message;
    }
    console.log(message);
  }

  private displayResults(matches: any[]): void {
    const container = document.getElementById('dataContainer');
    if (!container) return;

    if (matches.length === 0) {
      container.innerHTML = '<p class="no-data">No matches found</p>';
      return;
    }

    const html = matches.map((match, index) => `
      <div class="match-card">
        <div class="match-header">
          <span class="match-number">#${index + 1}</span>
          <span class="match-time">${match.time || 'N/A'}</span>
        </div>
        <div class="match-teams">
          <strong>${match.teams || 'Teams not found'}</strong>
        </div>
        <div class="match-league">
          <em>${match.league || 'League not specified'}</em>
        </div>
        <div class="match-odds">
          ${Object.entries(match.odds || {}).map(([key, value]) => 
            `<span class="odd">${key}: ${value}</span>`
          ).join('')}
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }
}

// Initialize the app
new ScraperApp();