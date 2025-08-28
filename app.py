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

def run_scraper_background():
    global scraped_data, scraping_status
    
    try:
        scraping_status["running"] = True
        scraper = SahadanScraper(headless=True)
        
        if scraper.start_driver():
            matches = scraper.scrape_sahadan_matches()
            scraped_data = matches
            scraping_status["last_update"] = time.strftime('%Y-%m-%d %H:%M:%S')
            scraper.close()
        
    except Exception as e:
        print(f"Scraping error: {e}")
    finally:
        scraping_status["running"] = False

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)