/**
 * Attendance Service - Gestion des présences
 * Service pour le suivi des présences aux cultes et événements
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { authenticatedFetch } from '@/lib/auth-fetch';

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  memberId?: string;
  memberName?: string;
  isVisitor: boolean;
  visitorName?: string;
  visitorPhone?: string;
  visitorEmail?: string;
  checkInMethod: 'manual' | 'qr_code' | 'facial' | 'self_checkin';
  checkInTime: string;
  checkOutTime?: string;
  verificationStatus: 'pending' | 'verified' | 'flagged';
  confidenceScore?: number;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
}

export interface AttendanceSession {
  id: string;
  eventId: string;
  eventName: string;
  date: string;
  startTime: string;
  endTime?: string;
  totalAttendees: number;
  membersCount: number;
  visitorsCount: number;
  firstTimersCount: number;
  status: 'active' | 'completed';
}

export interface AttendanceFilters {
  eventId?: string;
  memberId?: string;
  dateFrom?: string;
  dateTo?: string;
  method?: string;
  page?: number;
  limit?: number;
}

export interface AttendanceStats {
  totalSessions: number;
  averageAttendance: number;
  peakAttendance: number;
  visitorsTotal: number;
  retentionRate: number;
  weeklyTrend: Array<{ week: string; count: number }>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

class AttendanceService {
  private baseEndpoint = '/api/attendance-proxy';

  /**
   * Récupérer les enregistrements de présence
   */
  async getAttendanceRecords(filters: AttendanceFilters = {}): Promise<{
    success: boolean;
    records: AttendanceRecord[];
    total: number;
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const response = await authenticatedFetch(`${this.baseEndpoint}?${params}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des présences');
    }

    return response.json();
  }

  /**
   * Récupérer l'historique de présence d'un membre
   */
  async getMemberAttendance(memberId: string): Promise<{
    success: boolean;
    records: AttendanceRecord[];
    stats: {
      totalAttendance: number;
      attendanceRate: number;
      lastAttendance: string;
      streak: number;
    };
  }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}?memberId=${memberId}&type=history`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'historique');
    }

    return response.json();
  }

  /**
   * Enregistrer une présence
   */
  async recordAttendance(data: {
    eventId: string;
    memberId?: string;
    isVisitor?: boolean;
    visitorName?: string;
    visitorPhone?: string;
    checkInMethod: string;
    notes?: string;
  }): Promise<{ success: boolean; record: AttendanceRecord }> {
    const response = await authenticatedFetch(this.baseEndpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'enregistrement');
    }

    return response.json();
  }

  /**
   * Enregistrer une présence par reconnaissance faciale
   */
  async recordFacialAttendance(data: {
    eventId: string;
    faceDescriptor: number[];
    imageData?: string;
  }): Promise<{
    success: boolean;
    record?: AttendanceRecord;
    member?: {
      id: string;
      name: string;
      confidence: number;
    };
    isNewVisitor?: boolean;
  }> {
    const response = await authenticatedFetch('/api/facial-recognition-proxy', {
      method: 'POST',
      body: JSON.stringify({
        action: 'check-in',
        ...data,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la reconnaissance faciale');
    }

    return response.json();
  }

  /**
   * Check-out d'un membre
   */
  async checkOut(recordId: string): Promise<{ success: boolean; record: AttendanceRecord }> {
    const response = await authenticatedFetch(this.baseEndpoint, {
      method: 'PUT',
      body: JSON.stringify({
        id: recordId,
        action: 'checkout',
        checkOutTime: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du check-out');
    }

    return response.json();
  }

  /**
   * Démarrer une session de présence
   */
  async startSession(eventId: string): Promise<{
    success: boolean;
    session: AttendanceSession;
  }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}/sessions`, {
      method: 'POST',
      body: JSON.stringify({ eventId, action: 'start' }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors du démarrage de la session');
    }

    return response.json();
  }

  /**
   * Terminer une session de présence
   */
  async endSession(sessionId: string): Promise<{
    success: boolean;
    session: AttendanceSession;
  }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}/sessions`, {
      method: 'PUT',
      body: JSON.stringify({ id: sessionId, action: 'end' }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la fin de la session');
    }

    return response.json();
  }

  /**
   * Récupérer les statistiques de présence
   */
  async getStats(period: 'week' | 'month' | 'year' = 'month'): Promise<{
    success: boolean;
    stats: AttendanceStats;
  }> {
    const response = await authenticatedFetch(`${this.baseEndpoint}?type=stats&period=${period}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }

    return response.json();
  }

  /**
   * Générer un rapport de présence
   */
  async generateReport(options: {
    dateFrom: string;
    dateTo: string;
    eventType?: string;
    format?: 'pdf' | 'csv' | 'xlsx';
  }): Promise<Blob> {
    const params = new URLSearchParams({
      type: 'report',
      dateFrom: options.dateFrom,
      dateTo: options.dateTo,
      format: options.format || 'pdf',
    });

    if (options.eventType) {
      params.append('eventType', options.eventType);
    }

    const response = await authenticatedFetch(`${this.baseEndpoint}/export?${params}`);
    
    if (!response.ok) {
      throw new Error('Erreur lors de la génération du rapport');
    }

    return response.blob();
  }

  /**
   * Récupérer le tableau de bord des présences en temps réel
   */
  async getLiveDashboard(eventId: string): Promise<{
    success: boolean;
    dashboard: {
      currentCount: number;
      members: number;
      visitors: number;
      firstTimers: number;
      checkInRate: number;
      recentCheckIns: Array<{
        name: string;
        time: string;
        method: string;
      }>;
    };
  }> {
    const response = await authenticatedFetch(
      `/api/facial-recognition/presence-dashboard?eventId=${eventId}`
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du tableau de bord');
    }

    return response.json();
  }

  /**
   * Vérifier si un membre est déjà enregistré pour un événement
   */
  async checkExistingAttendance(eventId: string, memberId: string): Promise<{
    success: boolean;
    exists: boolean;
    record?: AttendanceRecord;
  }> {
    const response = await authenticatedFetch(
      `${this.baseEndpoint}?eventId=${eventId}&memberId=${memberId}&type=check`
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors de la vérification');
    }

    return response.json();
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
