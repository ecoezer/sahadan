import './style.css';
import { DataFetcher } from './services/dataFetcher';
import { UIManager } from './services/uiManager';

class SahadanApp {
  private uiManager: UIManager;

  constructor() {
    this.uiManager = new UIManager();
    this.uiManager.setRefreshHandler(() => this.loadData());
    this.uiManager.setDateChangeHandler((date: string) => this.loadDataForDate(date));
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadData();
    
    // Auto-refresh every 5 minutes
    setInterval(() => {
      this.loadData();
    }, 5 * 60 * 1000);
  }

  private async loadData(): Promise<void> {
    const selectedDate = this.uiManager.getSelectedDate();
    await this.loadDataForDate(selectedDate);
  }

  private async loadDataForDate(date: string): Promise<void> {
    console.log('🎯 loadDataForDate called with:', date);
    this.uiManager.showLoading();
    
    try {
      const data = await DataFetcher.fetchMatches(date);
      console.log('✅ Data fetched successfully:', data);
      this.uiManager.showMatches(data.matches, data.timestamp);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Error loading data:', errorMessage);
      this.uiManager.showError(errorMessage);
    }
  }
}

// Initialize the application
new SahadanApp();