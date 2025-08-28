from flask import Flask, render_template, jsonify
import os
import json
from sahadan_scraper import SahadanScraper
import threading
import time

app = Flask(__name__)

# Store scraped data
scraped_data = []
scraping_status = {"running": False, "last_update": None}

# Railway-specific Chrome options
def get_chrome_options():
    from selenium.webdriver.chrome.options import Options
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-plugins')
    options.add_argument('--disable-images')
    options.add_argument('--single-process')
    options.add_argument('--disable-background-timer-throttling')
    options.add_argument('--disable-renderer-backgrounding')
    options.add_argument('--disable-backgrounding-occluded-windows')
    
    # Railway-specific Chrome binary path
    if os.environ.get('RAILWAY_ENVIRONMENT'):
        options.binary_location = '/nix/store/*/bin/chromium'
    
    return options

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/scrape', methods=['POST'])
def start_scraping():
    global scraping_status
    
    if scraping_status["running"]:
        return jsonify({"error": "Scraping already in progress"}), 400
    
    # Start scraping in background thread
    thread = threading.Thread(target=run_scraper_background)
    thread.start()
    
    return jsonify({"message": "Scraping started", "status": "running"})

@app.route('/api/data')
def get_data():
    return jsonify({
        "matches": scraped_data,
        "status": scraping_status,
        "count": len(scraped_data)
    })

@app.route('/api/status')
def get_status():
    return jsonify(scraping_status)

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "environment": os.environ.get('RAILWAY_ENVIRONMENT', 'local')})

def run_scraper_background():
    global scraped_data, scraping_status
    
    try:
        scraping_status["running"] = True
        
        # Use Railway-optimized scraper
        from selenium import webdriver
        options = get_chrome_options()
        
        scraper = SahadanScraper(headless=True)
        scraper.options = options  # Override with Railway options
        
        if scraper.start_driver():
            matches = scraper.scrape_sahadan_matches()
            scraped_data = matches
            scraping_status["last_update"] = time.strftime('%Y-%m-%d %H:%M:%S')
            scraper.close()
        
    except Exception as e:
        print(f"Railway scraping error: {e}")
        scraping_status["error"] = str(e)
    finally:
        scraping_status["running"] = False

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)