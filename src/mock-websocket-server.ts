// Mock WebSocket server simulation for demonstration
export class MockWebSocketServer {
  private interval: number | null = null;
  private matches: any[] = [
    {
      id: '1',
      homeTeam: 'Galatasaray',
      awayTeam: 'Fenerbahçe',
      score: '1-0',
      time: '45+2',
      odds: { home: 2.1, draw: 3.2, away: 3.8 },
      status: 'live'
    },
    {
      id: '2',
      homeTeam: 'Beşiktaş',
      awayTeam: 'Trabzonspor',
      score: '0-0',
      time: '23',
      odds: { home: 1.9, draw: 3.1, away: 4.2 },
      status: 'live'
    },
    {
      id: '3',
      homeTeam: 'Barcelona',
      awayTeam: 'Real Madrid',
      score: '2-1',
      time: '67',
      odds: { home: 2.5, draw: 3.0, away: 2.8 },
      status: 'live'
    }
  ];

  constructor(private onMessage: (data: any) => void) {}

  start(): void {
    // Simulate connection
    setTimeout(() => {
      this.onMessage({
        type: 'connection_status',
        data: { connected: true },
        timestamp: Date.now()
      });
    }, 500);

    // Send initial match data
    setTimeout(() => {
      this.matches.forEach(match => {
        this.onMessage({
          type: 'match_update',
          data: match,
          timestamp: Date.now()
        });
      });
    }, 1000);

    // Start sending periodic updates
    this.interval = window.setInterval(() => {
      this.sendRandomUpdate();
    }, 3000);
  }

  private sendRandomUpdate(): void {
    const updateTypes = ['odds_change', 'score_update', 'match_update'];
    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    const randomMatch = this.matches[Math.floor(Math.random() * this.matches.length)];

    switch (randomType) {
      case 'odds_change':
        // Simulate odds fluctuation
        randomMatch.odds.home += (Math.random() - 0.5) * 0.2;
        randomMatch.odds.draw += (Math.random() - 0.5) * 0.2;
        randomMatch.odds.away += (Math.random() - 0.5) * 0.2;
        
        this.onMessage({
          type: 'odds_change',
          data: {
            matchId: randomMatch.id,
            odds: randomMatch.odds
          },
          timestamp: Date.now()
        });
        break;

      case 'score_update':
        // Simulate score change (rarely)
        if (Math.random() < 0.1) {
          const [home, away] = randomMatch.score.split('-').map(Number);
          if (Math.random() < 0.5) {
            randomMatch.score = `${home + 1}-${away}`;
          } else {
            randomMatch.score = `${home}-${away + 1}`;
          }
          
          this.onMessage({
            type: 'score_update',
            data: {
              matchId: randomMatch.id,
              score: randomMatch.score
            },
            timestamp: Date.now()
          });
        }
        break;

      case 'match_update':
        // Update match time
        const currentTime = parseInt(randomMatch.time.split('+')[0]);
        if (currentTime < 90) {
          randomMatch.time = `${currentTime + 1}`;
        }
        
        this.onMessage({
          type: 'match_update',
          data: randomMatch,
          timestamp: Date.now()
        });
        break;
    }
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}