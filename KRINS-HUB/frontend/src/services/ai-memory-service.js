/**
 * =ù AI Memory Service - Frontend bridge to Krin backend
 * 
 * Service for kommunikasjon med Krins memory system via backend API
 */

const BASE_URL = 'http://localhost:3003/api';

class AIMemoryService {
  constructor() {
    this.baseURL = BASE_URL;
  }

  /**
   * Henter alle Krin's minner fra backend
   */
  async getKrinMemories() {
    try {
      const response = await fetch(`${this.baseURL}/krin/memories`);
      const data = await response.json();
      
      if (!data.success) {
        // Fallback til default minner hvis backend feiler
        return {
          success: true,
          memories: data.fallback_memories || [],
          memoriesCount: data.fallback_memories?.length || 0,
          personalityLoaded: false
        };
      }
      
      return data;
    } catch (error) {
      console.error('=ù Kunne ikke hente Krin minner:', error);
      return {
        success: false,
        memories: [],
        memoriesCount: 0,
        personalityLoaded: false,
        error: error.message
      };
    }
  }

  /**
   * Sender melding til Krin via chat API
   */
  async chatWithKrin(message) {
    try {
      const response = await fetch(`${this.baseURL}/krin/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('=ù Chat med Krin feilet:', error);
      return {
        success: false,
        error: error.message,
        response: '=ù Beklager, jeg kunne ikke svare akkurat nÂ. Pr¯v igjen!'
      };
    }
  }

  /**
   * Sjekker backend status
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`http://localhost:3003/health`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new AIMemoryService();