# Sahadan Betting Data Scraper

A modern web application that scrapes and displays Turkish betting (İddaa) program data from sahadan.com. Built with TypeScript, featuring real-time odds, match schedules, and a responsive design.

## Features

- 🏈 **Live Betting Data**: Scrapes real-time odds from sahadan.com
- ⚽ **Match Information**: Displays team names, match times, and league information
- 📊 **Multiple Bet Types**: Shows 1X2 odds and Over/Under 2.5 goals
- 🔄 **Auto-refresh**: Updates data every 5 minutes automatically
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🚀 **Fast Loading**: Optimized for quick data retrieval and display
- 🛡️ **Error Handling**: Robust error handling with fallback data

## Tech Stack

- **Frontend**: TypeScript, Vanilla JS, CSS3
- **Backend**: Node.js, Express (development), Netlify Functions (production)
- **Scraping**: node-html-parser, node-fetch
- **Build Tool**: Vite
- **Deployment**: Netlify

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Start backend proxy** (in another terminal):
   ```bash
   npm run server
   ```

4. **Full development mode** (starts both frontend and backend):
   ```bash
   npm run dev:full
   ```

## Production Deployment

The application is configured for Netlify deployment with:
- Netlify Functions for serverless backend
- Automatic builds from the repository
- CORS handling for cross-origin requests

## Data Sources

- **Primary**: https://arsiv.sahadan.com/Iddaa/program.aspx
- **Fallback**: Sample data with realistic Turkish league matches

## API Endpoints

- **Development**: `http://localhost:3001/api/matches`
- **Production**: `/.netlify/functions/matches`

## Project Structure

```
src/
├── services/
│   ├── dataFetcher.ts    # API communication
│   ├── dataParser.ts     # HTML parsing logic
│   └── uiManager.ts      # UI rendering and management
├── types/
│   └── match.ts          # TypeScript interfaces
├── main.ts               # Application entry point
└── style.css             # Styling and responsive design

netlify/
└── functions/
    └── matches.js        # Serverless function for data scraping

server.js                 # Development proxy server
```

## Features in Detail

### Data Scraping
- Multiple parsing strategies for robust data extraction
- User agent rotation to avoid blocking
- Fallback mechanisms for reliable service
- Enhanced error handling and logging

### UI/UX
- Clean, modern design with Turkish football focus
- Real-time loading states and error messages
- Responsive grid layout for match cards
- Interactive odds display with hover effects

### Performance
- Efficient DOM manipulation
- Optimized network requests
- Automatic refresh with smart caching
- Lightweight bundle size

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Legal Notice

This project is for educational purposes only. Please respect sahadan.com's terms of service and robots.txt. Consider implementing rate limiting and respectful scraping practices.

## License

MIT License - see LICENSE file for details.