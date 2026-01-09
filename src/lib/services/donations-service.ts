/**
 * Donations Service - Gestion des dons et offrandes
 * Service pour toutes les opérations financières de l'église
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { authenticatedFetch } from '@/lib/auth-fetch';

export interface Donation {
  id: string;
  userId?: string;
  memberName?: string;
  amount: number;
  currency: string;
  donationType: 'offering' | 'tithe' | 'freewill' | 'project' | 'building' | 'other';
  paymentMethod: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'check';
  paymentReference?: string;
  donationDate: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  projectId?: string;
  projectName?: string;
  notes?: string;
  receiptNumber?: string;
  isAnonymous?: boolean;
  createdAt?: string;
}

export interface DonationFilters {
  search?: string;
  type?: string;
  method?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  memberId?: string;
  projectId?: string;
  page?: number;
  limit?: number;
}

export interface DonationStats {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  byType: Record<string, { count: number; amount: number }>;
  byMethod: Record<string, { count: number; amount: number }>;
  monthlyTrend: Array<{ month: string; amount: number; count: number }>;
}

export interface DonationProject {
  id: string;
  name: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  donorsCount: number;
}

class DonationsService {
  private baseEndpoint = '/api/donations-proxy';

  /**
   * Récupérer toutes les donations avec filtres
   */
  async getDonations(filters: DonationFilters = {}): Promise<{
    success: boolean;
    donations: Donation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await authenticatedFetch(`${this.baseEndpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des dons');
    }

    return response.json();
  }

  /**
   * Récupérer les donations d'un membre
   */
  async getMemberDonations(memberId: string): Promise<{
    success: boolean;
    donations: Donation[];
    totalAmount: number;
  }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}?memberId=${memberId}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des dons');
    }

    return response.json();
  }

  /**
   * Créer un nouveau don
   */
  async createDonation(data: Partial<Donation>): Promise<{ success: boolean; donation: Donation }> {
    const response = await authenticatedFetch(this.baseEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'enregistrement du don');
    }

    return response.json();
  }

  /**
   * Mettre à jour un don
   */
  async updateDonation(id: string, data: Partial<Donation>): Promise<{ success: boolean; donation: Donation }> {
    const response = await authenticatedFetch(this.baseEndpoint, {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour');
    }

    return response.json();
  }

  /**
   * Supprimer un don
   */
  async deleteDonation(id: string): Promise<{ success: boolean }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }

    return response.json();
  }

  /**
   * Récupérer les statistiques des dons
   */
  async getDonationStats(period: 'week' | 'month' | 'year' = 'month'): Promise<{
    success: boolean;
    stats: DonationStats;
  }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}?type=stats&period=${period}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }

    return response.json();
  }

  /**
   * Récupérer les projets de collecte
   */
  async getProjects(): Promise<{ success: boolean; projects: DonationProject[] }> {
    const response = await authenticatedFetch('/api/finance/projects');
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des projets');
    }

    return response.json();
  }

  /**
   * Créer un projet de collecte
   */
  async createProject(data: Partial<DonationProject>): Promise<{ success: boolean; project: DonationProject }> {
    const response = await authenticatedFetch('/api/finance/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du projet');
    }

    return response.json();
  }

  /**
   * Générer un reçu fiscal
   */
  async generateTaxReceipt(memberId: string, year: number): Promise<{
    success: boolean;
    receipt: {
      id: string;
      receiptNumber: string;
      totalAmount: number;
      donationsCount: number;
      downloadUrl: string;
    };
  }> {
    const response = await authenticatedFetch('/api/finance/tax-receipts', {
      method: 'POST',
      body: JSON.stringify({ memberId, year }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération du reçu');
    }

    return response.json();
  }

  /**
   * Exporter les dons en CSV
   */
  async exportDonations(filters: DonationFilters = {}): Promise<Blob> {
    const params = new URLSearchParams({ format: 'csv' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });

    const response = await authenticatedFetch(`${this.baseEndpoint}/export?${params}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'export');
    }

    return response.blob();
  }

  /**
   * Récupérer le rapport mensuel
   */
  async getMonthlyReport(year: number, month: number): Promise<{
    success: boolean;
    report: {
      totalIncome: number;
      totalExpenses: number;
      netIncome: number;
      byCategory: Record<string, number>;
      topDonors: Array<{ name: string; amount: number }>;
      comparison: {
        previousMonth: number;
        percentChange: number;
      };
    };
  }> {
    const response = await authenticatedFetch(
      `/api/finance/reports?type=monthly&year=${year}&month=${month}`
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du rapport');
    }

    return response.json();
  }
}

export const donationsService = new DonationsService();
export default donationsService;
