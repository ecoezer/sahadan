import { ApiResponse } from '../types/match';

export class DataFetcher {
  private static getApiUrl(): string {
    // In development, use the local server
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001/api/matches';
    }
    // In production, use the Netlify function
    return '/.netlify/functions/matches';
  }

  static async fetchMatches(): Promise<ApiResponse> {
    try {
      const apiUrl = this.getApiUrl();
      console.log('Fetching from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response:', responseText.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. The API endpoint may not be configured correctly.');
      }
      
      const data: ApiResponse = await response.json();
      
      // Log debug information if available
      if (data.debug) {
        console.log('Debug info:', data.debug);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching matches:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
        }
        throw error;
      }
      
      throw new Error('An unexpected error occurred while fetching data.');
    }
  }
}