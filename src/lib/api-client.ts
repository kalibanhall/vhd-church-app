/**
 * Client API pour communiquer avec le backend Express sur Render
 * Utilise les tokens JWT de Supabase pour l'authentification
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

export class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
    console.log('🔗 API Client initialized:', this.baseURL);
  }

  /**
   * Requête HTTP générique
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(error.message || 'API request failed');
      }

      return response.json();
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data: any, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, token?: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }
}

// Instance singleton du client API
export const apiClient = new ApiClient();

// ============================================================================
// API Endpoints organisés par ressource
// ============================================================================

/**
 * API des membres
 */
export const membersApi = {
  /**
   * Récupérer tous les membres
   */
  getAll: (token: string) => 
    apiClient.get<{ success: boolean; data: any[] }>('/members/all', token),

  /**
   * Récupérer un membre par ID
   */
  getById: (id: string, token: string) => 
    apiClient.get<{ success: boolean; data: any }>(`/members/${id}`, token),

  /**
   * Créer un nouveau membre
   */
  create: (data: any, token: string) => 
    apiClient.post<{ success: boolean; data: any }>('/members/create', data, token),

  /**
   * Mettre à jour un membre
   */
  update: (id: string, data: any, token: string) => 
    apiClient.put<{ success: boolean; data: any }>(`/members/${id}`, data, token),

  /**
   * Supprimer un membre
   */
  delete: (id: string, token: string) => 
    apiClient.delete<{ success: boolean; message: string }>(`/members/${id}`, token),
};

/**
 * API des dons
 */
export const donationsApi = {
  getAll: (token: string) => apiClient.get('/donations', token),
  getById: (id: string, token: string) => apiClient.get(`/donations/${id}`, token),
  create: (data: any, token: string) => apiClient.post('/donations', data, token),
  update: (id: string, data: any, token: string) => apiClient.put(`/donations/${id}`, data, token),
  delete: (id: string, token: string) => apiClient.delete(`/donations/${id}`, token),
};

/**
 * API des prédications
 */
export const preachingsApi = {
  getAll: (token: string) => apiClient.get('/preachings', token),
  getById: (id: string, token: string) => apiClient.get(`/preachings/${id}`, token),
  create: (data: any, token: string) => apiClient.post('/preachings', data, token),
  update: (id: string, data: any, token: string) => apiClient.put(`/preachings/${id}`, data, token),
  delete: (id: string, token: string) => apiClient.delete(`/preachings/${id}`, token),
};

/**
 * API des rendez-vous
 */
export const appointmentsApi = {
  getAll: (token: string) => apiClient.get('/appointments', token),
  getById: (id: string, token: string) => apiClient.get(`/appointments/${id}`, token),
  create: (data: any, token: string) => apiClient.post('/appointments', data, token),
  update: (id: string, data: any, token: string) => apiClient.put(`/appointments/${id}`, data, token),
  delete: (id: string, token: string) => apiClient.delete(`/appointments/${id}`, token),
};

/**
 * API des prières
 */
export const prayersApi = {
  getAll: (token: string) => apiClient.get('/prayers', token),
  getById: (id: string, token: string) => apiClient.get(`/prayers/${id}`, token),
  create: (data: any, token: string) => apiClient.post('/prayers', data, token),
  update: (id: string, data: any, token: string) => apiClient.put(`/prayers/${id}`, data, token),
  delete: (id: string, token: string) => apiClient.delete(`/prayers/${id}`, token),
};

/**
 * API des témoignages
 */
export const testimoniesApi = {
  getAll: (token: string) => apiClient.get('/testimonies', token),
  getById: (id: string, token: string) => apiClient.get(`/testimonies/${id}`, token),
  create: (data: any, token: string) => apiClient.post('/testimonies', data, token),
  update: (id: string, data: any, token: string) => apiClient.put(`/testimonies/${id}`, data, token),
  delete: (id: string, token: string) => apiClient.delete(`/testimonies/${id}`, token),
};

/**
 * API des analytics
 */
export const analyticsApi = {
  getDashboard: (token: string) => apiClient.get('/analytics', token),
  getStats: (token: string) => apiClient.get('/analytics/stats', token),
};

// ============================================================================
// Hook React pour faciliter l'utilisation
// ============================================================================

/**
 * Hook pour obtenir le token Supabase automatiquement
 * Utilisation:
 * 
 * const { token, loading } = useApiToken();
 * const members = await membersApi.getAll(token);
 */
export const useApiToken = () => {
  // Ce hook sera implémenté dans un fichier séparé car il nécessite 'use client'
  // Pour l'instant, les composants doivent récupérer le token manuellement
  return null;
};
