from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import pandas as pd
import time
import json

class SahadanScraper:
    def __init__(self, headless=True):
        """Initialize the scraper with Chrome options"""
        self.options = Options()
        if headless:
            self.options.add_argument('--headless')
        self.options.add_argument('--no-sandbox')
        self.options.add_argument('--disable-dev-shm-usage')
        self.options.add_argument('--disable-gpu')
        self.options.add_argument('--window-size=1920,1080')
        
        # Railway-specific optimizations
        if os.environ.get('RAILWAY_ENVIRONMENT'):
            self.options.add_argument('--single-process')
            self.options.add_argument('--disable-background-timer-throttling')
            self.options.add_argument('--disable-renderer-backgrounding')
            self.options.add_argument('--disable-backgrounding-occluded-windows')
            self.options.add_argument('--disable-extensions')
            self.options.add_argument('--disable-plugins')
        
        self.driver = None
        
    def start_driver(self):
        """Start the Chrome driver"""
        try:
            self.driver = webdriver.Chrome(options=self.options)
            print("✅ Chrome driver started successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to start Chrome driver: {e}")
            return False
    
    def scrape_sahadan_matches(self, url="https://arsiv.sahadan.com/Iddaa/program.aspx"):
        """Scrape match data from Sahadan"""
        if not self.driver:
            print("❌ Driver not started. Call start_driver() first.")
            return []
        
        try:
            print(f"🌐 Loading page: {url}")
            self.driver.get(url)
            
            # Wait for page to load
            WebDriverWait(self.driver, 10).wait(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            print("⏳ Waiting for match data to load...")
            time.sleep(3)
            
            # Get page source and parse with BeautifulSoup
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            matches = []
            
            # Look for match containers (adjust selectors based on actual HTML structure)
            match_rows = soup.find_all('tr', class_=['odd', 'even']) or soup.find_all('tr')
            
            print(f"📊 Found {len(match_rows)} potential match rows")
            
            for i, row in enumerate(match_rows[:20]):  # Limit to first 20 for testing
                try:
                    # Extract match data (adjust based on actual HTML structure)
                    cells = row.find_all('td')
                    
                    if len(cells) >= 5:  # Ensure we have enough data
                        match_data = {
                            'match_id': i + 1,
                            'time': cells[0].get_text(strip=True) if cells[0] else '',
                            'home_team': cells[1].get_text(strip=True) if cells[1] else '',
                            'away_team': cells[2].get_text(strip=True) if cells[2] else '',
                            'odds_1': cells[3].get_text(strip=True) if cells[3] else '',
                            'odds_x': cells[4].get_text(strip=True) if cells[4] else '',
                            'odds_2': cells[5].get_text(strip=True) if len(cells) > 5 else '',
                            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
                        }
                        
                        # Only add if we have team names
                        if match_data['home_team'] and match_data['away_team']:
                            matches.append(match_data)
                            
                except Exception as e:
                    print(f"⚠️ Error parsing row {i}: {e}")
                    continue
            
            print(f"✅ Successfully scraped {len(matches)} matches")
            return matches
            
        except Exception as e:
            print(f"❌ Error scraping matches: {e}")
            return []
    
    def save_to_json(self, matches, filename='sahadan_matches.json'):
        """Save matches to JSON file"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(matches, f, ensure_ascii=False, indent=2)
            print(f"💾 Saved {len(matches)} matches to {filename}")
        except Exception as e:
            print(f"❌ Error saving to JSON: {e}")
    
    def save_to_csv(self, matches, filename='sahadan_matches.csv'):
        """Save matches to CSV file"""
        try:
            df = pd.DataFrame(matches)
            df.to_csv(filename, index=False, encoding='utf-8')
            print(f"📊 Saved {len(matches)} matches to {filename}")
        except Exception as e:
            print(f"❌ Error saving to CSV: {e}")
    
    def close(self):
        """Close the driver"""
        if self.driver:
            self.driver.quit()
            print("🔒 Driver closed")

def main():
    """Main function to run the scraper"""
    print("🚀 Starting Sahadan Scraper...")
    
    # Initialize scraper
    scraper = SahadanScraper(headless=True)
    
    try:
        # Start driver
        if not scraper.start_driver():
            return
        
        # Scrape matches
        matches = scraper.scrape_sahadan_matches()
        
        if matches:
            # Save data
            scraper.save_to_json(matches)
            scraper.save_to_csv(matches)
            
            # Print sample data
            print("\n📋 Sample matches:")
            for match in matches[:3]:
                print(f"  {match['home_team']} vs {match['away_team']} - {match['time']}")
        else:
            print("❌ No matches found")
    
    except KeyboardInterrupt:
        print("\n⏹️ Scraping interrupted by user")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    finally:
        scraper.close()

if __name__ == "__main__":
    main()