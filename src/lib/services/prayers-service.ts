/**
 * Prayers Service - Gestion des prières et témoignages
 * Service pour les intentions de prière et témoignages
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { authenticatedFetch } from '@/lib/auth-fetch';

export interface Prayer {
  id: string;
  userId: string;
  userName?: string;
  userPhoto?: string;
  title?: string;
  content: string;
  category: 'health' | 'family' | 'finance' | 'work' | 'spiritual' | 'relationship' | 'guidance' | 'thanksgiving' | 'other';
  isAnonymous: boolean;
  isPublic: boolean;
  isUrgent: boolean;
  prayerDate: string;
  status: 'active' | 'answered' | 'archived';
  prayerCount: number;
  answeredDate?: string;
  answeredTestimony?: string;
  supporters?: Array<{ userId: string; name: string; date: string }>;
  createdAt: string;
  updatedAt?: string;
}

export interface Testimony {
  id: string;
  userId: string;
  userName?: string;
  userPhoto?: string;
  title: string;
  content: string;
  category: 'healing' | 'provision' | 'salvation' | 'deliverance' | 'restoration' | 'miracle' | 'guidance' | 'other';
  isAnonymous: boolean;
  testimonyDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'featured';
  likeCount: number;
  viewCount: number;
  relatedPrayerId?: string;
  mediaUrls?: string[];
  createdAt: string;
}

export interface PrayerFilters {
  category?: string;
  status?: string;
  userId?: string;
  isPublic?: boolean;
  isUrgent?: boolean;
  page?: number;
  limit?: number;
}

export interface TestimonyFilters {
  category?: string;
  status?: string;
  userId?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

class PrayersService {
  private prayersEndpoint = '/api/prayers-proxy';
  private testimoniesEndpoint = '/api/testimonies-proxy';

  // ==================== PRIÈRES ====================

  /**
   * Récupérer les prières
   */
  async getPrayers(filters: PrayerFilters = {}): Promise<{
    success: boolean;
    prayers: Prayer[];
    total: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await authenticatedFetch(`${this.prayersEndpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des prières');
    }

    return response.json();
  }

  /**
   * Récupérer une prière par ID
   */
  async getPrayerById(id: string): Promise<{ success: boolean; prayer: Prayer }> {
    const response = await authenticatedFetch(`${this.prayersEndpoint}?id=${id}`);
    
    if (!response.ok) {
      throw new Error('Prière non trouvée');
    }

    return response.json();
  }

  /**
   * Créer une intention de prière
   */
  async createPrayer(data: Partial<Prayer>): Promise<{ success: boolean; prayer: Prayer }> {
    const response = await authenticatedFetch(this.prayersEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la création');
    }

    return response.json();
  }

  /**
   * Mettre à jour une prière
   */
  async updatePrayer(id: string, data: Partial<Prayer>): Promise<{ success: boolean; prayer: Prayer }> {
    const response = await authenticatedFetch(this.prayersEndpoint, {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return response.json();
  }

  /**
   * Supprimer une prière
   */
  async deletePrayer(id: string): Promise<{ success: boolean }> {
    const response = await authenticatedFetch(`${this.prayersEndpoint}?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }

    return response.json();
  }

  /**
   * Marquer une prière comme exaucée
   */
  async markAsAnswered(id: string, testimony?: string): Promise<{ success: boolean; prayer: Prayer }> {
    const response = await authenticatedFetch(this.prayersEndpoint, {
      method: 'PUT',
      body: JSON.stringify({
        id,
        status: 'answered',
        answeredDate: new Date().toISOString(),
        answeredTestimony: testimony,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return response.json();
  }

  /**
   * Prier pour une intention (incrémenter le compteur)
   */
  async prayFor(prayerId: string): Promise<{ success: boolean; prayerCount: number }> {
    const response = await authenticatedFetch(this.prayersEndpoint, {
      method: 'PUT',
      body: JSON.stringify({
        id: prayerId,
        action: 'pray',
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'enregistrement');
    }

    return response.json();
  }

  /**
   * Récupérer les prières urgentes
   */
  async getUrgentPrayers(): Promise<{ success: boolean; prayers: Prayer[] }> {
    return this.getPrayers({ isUrgent: true, status: 'active', isPublic: true });
  }

  // ==================== TÉMOIGNAGES ====================

  /**
   * Récupérer les témoignages
   */
  async getTestimonies(filters: TestimonyFilters = {}): Promise<{
    success: boolean;
    testimonies: Testimony[];
    total: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await authenticatedFetch(`${this.testimoniesEndpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des témoignages');
    }

    return response.json();
  }

  /**
   * Récupérer un témoignage par ID
   */
  async getTestimonyById(id: string): Promise<{ success: boolean; testimony: Testimony }> {
    const response = await authenticatedFetch(`${this.testimoniesEndpoint}?id=${id}`);
    
    if (!response.ok) {
      throw new Error('Témoignage non trouvé');
    }

    return response.json();
  }

  /**
   * Créer un témoignage
   */
  async createTestimony(data: Partial<Testimony>): Promise<{ success: boolean; testimony: Testimony }> {
    const response = await authenticatedFetch(this.testimoniesEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la création');
    }

    return response.json();
  }

  /**
   * Mettre à jour un témoignage
   */
  async updateTestimony(id: string, data: Partial<Testimony>): Promise<{ success: boolean; testimony: Testimony }> {
    const response = await authenticatedFetch(this.testimoniesEndpoint, {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour');
    }

    return response.json();
  }

  /**
   * Supprimer un témoignage
   */
  async deleteTestimony(id: string): Promise<{ success: boolean }> {
    const response = await authenticatedFetch(`${this.testimoniesEndpoint}?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }

    return response.json();
  }

  /**
   * Approuver ou rejeter un témoignage (admin)
   */
  async moderateTestimony(
    id: string,
    action: 'approve' | 'reject' | 'feature',
    reason?: string
  ): Promise<{ success: boolean; testimony: Testimony }> {
    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      feature: 'featured',
    };

    const response = await authenticatedFetch(this.testimoniesEndpoint, {
      method: 'PUT',
      body: JSON.stringify({
        id,
        status: statusMap[action],
        moderationReason: reason,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la modération');
    }

    return response.json();
  }

  /**
   * Aimer un témoignage
   */
  async likeTestimony(id: string): Promise<{ success: boolean; likeCount: number }> {
    const response = await authenticatedFetch(this.testimoniesEndpoint, {
      method: 'PUT',
      body: JSON.stringify({
        id,
        action: 'like',
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du like');
    }

    return response.json();
  }

  /**
   * Récupérer les témoignages en vedette
   */
  async getFeaturedTestimonies(): Promise<{ success: boolean; testimonies: Testimony[] }> {
    return this.getTestimonies({ featured: true, status: 'featured' });
  }

  /**
   * Récupérer les témoignages en attente de validation (admin)
   */
  async getPendingTestimonies(): Promise<{ success: boolean; testimonies: Testimony[] }> {
    return this.getTestimonies({ status: 'pending' });
  }
}

export const prayersService = new PrayersService();
export default prayersService;
