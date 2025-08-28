from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
import pandas as pd
import time
import json
import re

class AdvancedSahadanScraper:
    def __init__(self):
        """Advanced scraper with more features"""
        self.options = Options()
        self.options.add_argument('--headless')
        self.options.add_argument('--no-sandbox')
        self.options.add_argument('--disable-dev-shm-usage')
        self.options.add_argument('--disable-blink-features=AutomationControlled')
        self.options.add_experimental_option("excludeSwitches", ["enable-automation"])
        self.options.add_experimental_option('useAutomationExtension', False)
        self.driver = None
        
    def start_driver(self):
        """Start Chrome with stealth settings"""
        try:
            self.driver = webdriver.Chrome(options=self.options)
            # Execute script to hide automation
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            print("✅ Advanced Chrome driver started")
            return True
        except Exception as e:
            print(f"❌ Failed to start driver: {e}")
            return False
    
    def wait_for_element(self, by, value, timeout=10):
        """Wait for element to be present"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return element
        except:
            return None
    
    def scrape_detailed_matches(self, url="https://arsiv.sahadan.com/Iddaa/program.aspx"):
        """Scrape with detailed match information"""
        if not self.driver:
            return []
        
        try:
            print(f"🌐 Loading: {url}")
            self.driver.get(url)
            
            # Wait for page load
            time.sleep(5)
            
            matches = []
            
            # Try multiple selectors for match data
            selectors = [
                "table.matchTable tr",
                ".match-row",
                "tr[class*='match']",
                "tbody tr"
            ]
            
            for selector in selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if elements:
                        print(f"✅ Found {len(elements)} elements with selector: {selector}")
                        break
                except:
                    continue
            
            # Extract match data
            for i, element in enumerate(elements[:15]):
                try:
                    match_data = self.extract_match_data(element, i)
                    if match_data:
                        matches.append(match_data)
                except Exception as e:
                    print(f"⚠️ Error extracting match {i}: {e}")
            
            print(f"✅ Extracted {len(matches)} matches")
            return matches
            
        except Exception as e:
            print(f"❌ Scraping error: {e}")
            return []
    
    def extract_match_data(self, element, index):
        """Extract detailed match information"""
        try:
            # Get all text content
            text = element.text.strip()
            
            if not text or len(text) < 10:
                return None
            
            # Try to extract team names and odds
            lines = text.split('\n')
            
            match_data = {
                'id': index + 1,
                'raw_text': text,
                'teams': self.extract_teams(text),
                'odds': self.extract_odds(text),
                'time': self.extract_time(text),
                'league': self.extract_league(text),
                'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return match_data
            
        except Exception as e:
            print(f"❌ Error extracting match data: {e}")
            return None
    
    def extract_teams(self, text):
        """Extract team names from text"""
        # Common Turkish team patterns
        turkish_teams = [
            'Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor',
            'Başakşehir', 'Alanyaspor', 'Antalyaspor', 'Kayserispor',
            'Konyaspor', 'Sivasspor', 'Gaziantep', 'Hatayspor'
        ]
        
        found_teams = []
        for team in turkish_teams:
            if team.lower() in text.lower():
                found_teams.append(team)
        
        return found_teams[:2] if len(found_teams) >= 2 else []
    
    def extract_odds(self, text):
        """Extract betting odds from text"""
        # Look for decimal odds pattern (e.g., 1.85, 3.20, 4.50)
        odds_pattern = r'\b\d+\.\d{2}\b'
        odds = re.findall(odds_pattern, text)
        
        return {
            'home': odds[0] if len(odds) > 0 else '',
            'draw': odds[1] if len(odds) > 1 else '',
            'away': odds[2] if len(odds) > 2 else '',
            'all_odds': odds
        }
    
    def extract_time(self, text):
        """Extract match time"""
        time_pattern = r'\b\d{2}:\d{2}\b'
        times = re.findall(time_pattern, text)
        return times[0] if times else ''
    
    def extract_league(self, text):
        """Extract league information"""
        leagues = ['Süper Lig', '1. Lig', 'Premier League', 'La Liga', 'Serie A']
        for league in leagues:
            if league.lower() in text.lower():
                return league
        return 'Unknown'
    
    def save_detailed_data(self, matches, base_filename='sahadan_detailed'):
        """Save with multiple formats"""
        try:
            # JSON
            with open(f'{base_filename}.json', 'w', encoding='utf-8') as f:
                json.dump(matches, f, ensure_ascii=False, indent=2)
            
            # CSV
            df = pd.DataFrame(matches)
            df.to_csv(f'{base_filename}.csv', index=False, encoding='utf-8')
            
            # Text summary
            with open(f'{base_filename}_summary.txt', 'w', encoding='utf-8') as f:
                f.write(f"Sahadan Scraping Results\n")
                f.write(f"========================\n")
                f.write(f"Total matches: {len(matches)}\n")
                f.write(f"Scraped at: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                
                for match in matches:
                    f.write(f"Match {match['id']}: {match.get('teams', [])} - {match.get('time', '')}\n")
            
            print(f"💾 Saved detailed data: {len(matches)} matches")
            
        except Exception as e:
            print(f"❌ Error saving data: {e}")
    
    def close(self):
        """Close driver"""
        if self.driver:
            self.driver.quit()
            print("🔒 Advanced driver closed")

def run_advanced_scraper():
    """Run the advanced scraper"""
    print("🚀 Starting Advanced Sahadan Scraper...")
    
    scraper = AdvancedSahadanScraper()
    
    try:
        if scraper.start_driver():
            matches = scraper.scrape_detailed_matches()
            
            if matches:
                scraper.save_detailed_data(matches)
                
                print("\n📊 Scraping Summary:")
                print(f"   Total matches: {len(matches)}")
                print(f"   With teams: {len([m for m in matches if m.get('teams')])}")
                print(f"   With odds: {len([m for m in matches if m.get('odds', {}).get('home')])}")
            else:
                print("❌ No matches extracted")
    
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        scraper.close()

if __name__ == "__main__":
    run_advanced_scraper()