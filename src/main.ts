import './style.css';

class ScraperApp {
  constructor() {
    this.initializeUI();
  }

  private initializeUI(): void {
    const app = document.querySelector<HTMLDivElement>('#app')!;
    
    app.innerHTML = `
      <div class="container">
        <header>
          <h1>🕷️ Web Scraper</h1>
          <p>Ready to scrape data</p>
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
          <h3>📊 Results</h3>
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
    this.updateUI('running');
    this.updateStatus('🔄 Starting scraper...');

    try {
      // Simulate scraping delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data for demonstration
      const mockData = [
        {
          teams: "Galatasaray vs Fenerbahçe",
          odds: { "1": "2.10", "X": "3.20", "2": "3.50" },
          time: "20:00",
          league: "Süper Lig"
        },
        {
          teams: "Beşiktaş vs Trabzonspor", 
          odds: { "1": "1.85", "X": "3.40", "2": "4.20" },
          time: "17:30",
          league: "Süper Lig"
        }
      ];
      
      this.displayResults(mockData);
      this.updateStatus(`✅ Scraping completed! Found ${mockData.length} matches`);
      
    } catch (error) {
      console.error('Scraping error:', error);
      this.updateStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.updateUI('stopped');
    }
  }

  private stopScraping(): void {
    this.updateStatus('⏹️ Scraping stopped');
    this.updateUI('stopped');
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