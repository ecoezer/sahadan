# Sahadan Web Scraper

Web scraping tool for extracting betting data from Sahadan.com using Python and Selenium.

## 🚀 Features

- **Basic Scraper**: Simple extraction of match data
- **Advanced Scraper**: Detailed extraction with stealth mode
- **Multiple Formats**: Save as JSON, CSV, and text
- **Turkish Football**: Optimized for Turkish league matches
- **Error Handling**: Robust error handling and logging

## 📋 Requirements

- Python 3.7+
- Chrome browser
- ChromeDriver (automatically managed by Selenium)

## 🛠️ Installation

1. Install required packages:
```bash
pip install -r requirements.txt
```

2. Run the scraper:
```bash
python run_scraper.py
```

## 📁 Files

- `sahadan_scraper.py` - Basic scraper implementation
- `advanced_scraper.py` - Advanced scraper with stealth features
- `run_scraper.py` - Interactive runner script
- `requirements.txt` - Python dependencies

## 🎯 Usage

### Basic Usage
```python
from sahadan_scraper import SahadanScraper

scraper = SahadanScraper()
scraper.start_driver()
matches = scraper.scrape_sahadan_matches()
scraper.save_to_json(matches)
scraper.close()
```

### Advanced Usage
```python
from advanced_scraper import AdvancedSahadanScraper

scraper = AdvancedSahadanScraper()
scraper.start_driver()
matches = scraper.scrape_detailed_matches()
scraper.save_detailed_data(matches)
scraper.close()
```

## 📊 Output Formats

- **JSON**: Complete match data with metadata
- **CSV**: Tabular format for analysis
- **TXT**: Human-readable summary

## ⚠️ Important Notes

- Respect website terms of service
- Use reasonable delays between requests
- Consider rate limiting for large-scale scraping
- Website structure may change over time

## 🔧 Customization

Modify selectors in the scraper files to match current website structure:

```python
# Update CSS selectors
selectors = [
    "table.matchTable tr",
    ".match-row",
    "tr[class*='match']"
]
```

## 🐛 Troubleshooting

1. **ChromeDriver Issues**: Selenium will auto-download ChromeDriver
2. **Element Not Found**: Website structure may have changed
3. **Timeout Errors**: Increase wait times in scraper settings

## 📝 License

This tool is for educational purposes only. Please respect website terms of service.