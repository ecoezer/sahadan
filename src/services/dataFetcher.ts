import { ApiResponse } from '../types/match';

export class DataFetcher {
  private static readonly API_URL = 'http://localhost:3001/api/matches';

  static async fetchMatches(): Promise<ApiResponse> {
    try {
      const response = await fetch(this.API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching matches:', error);
      throw new Error('Failed to fetch betting data. Please ensure the proxy server is running.');
    }
  }
}