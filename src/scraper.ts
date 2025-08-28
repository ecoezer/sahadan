import { Builder, By, WebDriver, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

export class SahadanScraper {
  private driver: WebDriver | null = null;

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Selenium WebDriver...');
    
    const options = new chrome.Options();
    options.addArguments('--headless'); // Run in background
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
      
    console.log('✅ WebDriver initialized successfully');
  }

  async scrapeIddaaProgram(): Promise<any[]> {
    if (!this.driver) {
      throw new Error('WebDriver not initialized. Call initialize() first.');
    }

    console.log('🌐 Navigating to sahadan.com Iddaa archive...');
    
    try {
      // Navigate to the page
      await this.driver.get('https://arsiv.sahadan.com/Iddaa/program.aspx');
      
      // Wait for page to load
      await this.driver.wait(until.titleContains('İddaa'), 10000);
      console.log('📄 Page loaded successfully');

      // Wait for the main content to load
      await this.driver.wait(until.elementLocated(By.className('iddaa-program')), 10000);
      
      // Extract betting data
      const matches = await this.extractMatches();
      
      console.log(`📊 Found ${matches.length} matches`);
      return matches;
      
    } catch (error) {
      console.error('❌ Error scraping data:', error);
      throw error;
    }
  }

  private async extractMatches(): Promise<any[]> {
    if (!this.driver) return [];

    const matches: any[] = [];
    
    try {
      // Find match rows (adjust selector based on actual HTML structure)
      const matchElements = await this.driver.findElements(By.css('.match-row, .iddaa-match, tr[class*="match"]'));
      
      for (const matchElement of matchElements) {
        try {
          const matchData = {
            teams: await this.extractTeams(matchElement),
            odds: await this.extractOdds(matchElement),
            time: await this.extractMatchTime(matchElement),
            league: await this.extractLeague(matchElement)
          };
          
          if (matchData.teams) {
            matches.push(matchData);
          }
        } catch (error) {
          console.warn('⚠️ Error extracting match data:', error);
        }
      }
      
    } catch (error) {
      console.error('❌ Error finding match elements:', error);
    }
    
    return matches;
  }

  private async extractTeams(element: any): Promise<string | null> {
    try {
      const teamElement = await element.findElement(By.css('.team-names, .teams, td[class*="team"]'));
      return await teamElement.getText();
    } catch {
      return null;
    }
  }

  private async extractOdds(element: any): Promise<any> {
    const odds: any = {};
    
    try {
      // Extract common betting odds (1X2, Over/Under, etc.)
      const oddElements = await element.findElements(By.css('.odd, .oran, td[class*="odd"]'));
      
      for (let i = 0; i < oddElements.length; i++) {
        const oddText = await oddElements[i].getText();
        if (oddText && oddText.trim()) {
          odds[`odd_${i + 1}`] = oddText.trim();
        }
      }
    } catch (error) {
      console.warn('⚠️ Error extracting odds:', error);
    }
    
    return odds;
  }

  private async extractMatchTime(element: any): Promise<string | null> {
    try {
      const timeElement = await element.findElement(By.css('.time, .match-time, td[class*="time"]'));
      return await timeElement.getText();
    } catch {
      return null;
    }
  }

  private async extractLeague(element: any): Promise<string | null> {
    try {
      const leagueElement = await element.findElement(By.css('.league, .lig, td[class*="league"]'));
      return await leagueElement.getText();
    } catch {
      return null;
    }
  }

  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.quit();
      console.log('🔒 WebDriver closed');
    }
  }
}