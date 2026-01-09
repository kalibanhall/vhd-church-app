/**
 * Members Service - Gestion des membres
 * Service pour toutes les opérations liées aux membres de l'église
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { authenticatedFetch } from '@/lib/auth-fetch';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: 'M' | 'F';
  birthDate?: string;
  address?: string;
  profileImage?: string;
  membershipDate: string;
  membershipNumber?: string;
  status: 'active' | 'inactive' | 'pending';
  role: 'member' | 'pastor' | 'admin' | 'deacon';
  baptismDate?: string;
  maritalStatus?: string;
  profession?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberFilters {
  search?: string;
  status?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  byRole: Record<string, number>;
  byGender: Record<string, number>;
}

class MembersService {
  private baseEndpoint = '/api/members-proxy';

  /**
   * Récupérer tous les membres avec filtres
   */
  async getMembers(filters: MemberFilters = {}): Promise<{
    success: boolean;
    members: Member[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.role) params.append('role', filters.role);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await authenticatedFetch(`${this.baseEndpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des membres');
    }

    return response.json();
  }

  /**
   * Récupérer un membre par ID
   */
  async getMemberById(id: string): Promise<{ success: boolean; member: Member }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}?id=${id}`);
    
    if (!response.ok) {
      throw new Error('Membre non trouvé');
    }

    return response.json();
  }

  /**
   * Créer un nouveau membre
   */
  async createMember(data: Partial<Member>): Promise<{ success: boolean; member: Member }> {
    const response = await authenticatedFetch(this.baseEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la création du membre');
    }

    return response.json();
  }

  /**
   * Mettre à jour un membre
   */
  async updateMember(id: string, data: Partial<Member>): Promise<{ success: boolean; member: Member }> {
    const response = await authenticatedFetch(this.baseEndpoint, {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour du membre');
    }

    return response.json();
  }

  /**
   * Supprimer un membre
   */
  async deleteMember(id: string): Promise<{ success: boolean }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du membre');
    }

    return response.json();
  }

  /**
   * Récupérer les statistiques des membres
   */
  async getMemberStats(): Promise<{ success: boolean; stats: MemberStats }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}?type=stats`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }

    return response.json();
  }

  /**
   * Rechercher des membres
   */
  async searchMembers(query: string): Promise<{ success: boolean; members: Member[] }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}?search=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la recherche');
    }

    return response.json();
  }

  /**
   * Exporter les membres en CSV
   */
  async exportMembers(filters: MemberFilters = {}): Promise<Blob> {
    const params = new URLSearchParams({ format: 'csv' });
    if (filters.status) params.append('status', filters.status);
    if (filters.role) params.append('role', filters.role);

    const response = await authenticatedFetch(`${this.baseEndpoint}/export?${params}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'export');
    }

    return response.blob();
  }

  /**
   * Importer des membres depuis un fichier CSV
   */
  async importMembers(file: File): Promise<{ 
    success: boolean; 
    imported: number; 
    errors: Array<{ row: number; error: string }> 
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await authenticatedFetch(`${this.baseEndpoint}/import`, {
      method: 'POST',
      body: formData,
      headers: {}, // Laisser le navigateur définir le Content-Type pour FormData
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'import');
    }

    return response.json();
  }

  /**
   * Récupérer les familles
   */
  async getFamilies(): Promise<{
    success: boolean;
    families: Array<{
      id: string;
      name: string;
      headId: string;
      members: Member[];
    }>;
  }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}?type=families`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des familles');
    }

    return response.json();
  }

  /**
   * Récupérer les anniversaires du mois
   */
  async getBirthdays(month?: number): Promise<{ success: boolean; members: Member[] }> {
    const currentMonth = month ?? new Date().getMonth() + 1;
    const response = await authenticatedFetch(`${this.baseEndpoint}?type=birthdays&month=${currentMonth}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des anniversaires');
    }

    return response.json();
  }
}

export const membersService = new MembersService();
export default membersService;
