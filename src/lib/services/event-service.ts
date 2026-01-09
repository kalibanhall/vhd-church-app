/**
 * =============================================================================
 * SERVICE D'ÉVÉNEMENTS AVANCÉS - MyChurchApp
 * =============================================================================
 * 
 * Fonctionnalités:
 * - Check-in/Check-out des participants
 * - Inscriptions en ligne
 * - Événements récurrents
 * - Rappels automatiques
 * - Gestion des capacités
 * - QR codes pour check-in
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * =============================================================================
 */

// Types
export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  category: string;
  startDate: Date;
  endDate: Date;
  location: EventLocation;
  organizer: EventOrganizer;
  capacity?: number;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  isPublic: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  recurrence?: EventRecurrence;
  registrations: EventRegistration[];
  attendance: EventAttendance[];
  reminders: EventReminder[];
  tags: string[];
  image?: string;
  attachments?: EventAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventType = 
  | 'service'      // Culte
  | 'prayer'       // Réunion de prière
  | 'study'        // Étude biblique
  | 'youth'        // Jeunesse
  | 'children'     // Enfants
  | 'conference'   // Conférence
  | 'retreat'      // Retraite
  | 'social'       // Activité sociale
  | 'outreach'     // Évangélisation
  | 'training'     // Formation
  | 'meeting'      // Réunion
  | 'other';

export interface EventLocation {
  name: string;
  address?: string;
  room?: string;
  isOnline: boolean;
  onlineUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface EventOrganizer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  ministry?: string;
}

export interface EventRecurrence {
  pattern: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  interval: number; // Tous les X jours/semaines/mois
  endDate?: Date;
  daysOfWeek?: number[]; // 0=Dimanche, 1=Lundi, etc.
  dayOfMonth?: number; // Pour mensuel
  exceptions?: Date[]; // Dates à exclure
}

export interface EventRegistration {
  id: string;
  eventId: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  memberPhone?: string;
  guests: number;
  guestNames?: string[];
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist';
  notes?: string;
  registeredAt: Date;
  confirmedAt?: Date;
  checkInCode?: string;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  memberId: string;
  memberName: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  method: 'manual' | 'qr' | 'facial' | 'self';
  checkedInBy?: string;
  notes?: string;
}

export interface EventReminder {
  id: string;
  type: 'email' | 'sms' | 'push';
  sendAt: Date;
  sent: boolean;
  sentAt?: Date;
  recipients: 'all' | 'registered' | 'custom';
  customRecipients?: string[];
  message?: string;
}

export interface EventAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// ============================================================================
// SERVICE D'ÉVÉNEMENTS
// ============================================================================

export class EventService {
  
  /**
   * Générer un code de check-in unique
   */
  static generateCheckInCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Calculer les statistiques d'un événement
   */
  static calculateEventStats(event: Event): {
    totalRegistrations: number;
    confirmedRegistrations: number;
    waitlistCount: number;
    totalGuests: number;
    expectedAttendance: number;
    actualAttendance: number;
    checkInRate: number;
    capacityUtilization: number;
    spotsRemaining: number | null;
  } {
    const confirmedRegs = event.registrations.filter(r => r.status === 'confirmed');
    const waitlistRegs = event.registrations.filter(r => r.status === 'waitlist');
    const totalGuests = confirmedRegs.reduce((sum, r) => sum + r.guests, 0);
    const expectedAttendance = confirmedRegs.length + totalGuests;
    const actualAttendance = event.attendance.filter(a => a.checkInTime).length;

    return {
      totalRegistrations: event.registrations.length,
      confirmedRegistrations: confirmedRegs.length,
      waitlistCount: waitlistRegs.length,
      totalGuests,
      expectedAttendance,
      actualAttendance,
      checkInRate: expectedAttendance > 0 
        ? Math.round((actualAttendance / expectedAttendance) * 100) 
        : 0,
      capacityUtilization: event.capacity 
        ? Math.round((expectedAttendance / event.capacity) * 100) 
        : 0,
      spotsRemaining: event.capacity 
        ? Math.max(0, event.capacity - expectedAttendance) 
        : null
    };
  }

  /**
   * Vérifier si un membre peut s'inscrire
   */
  static canRegister(event: Event, memberId: string): {
    canRegister: boolean;
    reason?: string;
  } {
    // Vérifier si l'événement est publié
    if (event.status !== 'published') {
      return { canRegister: false, reason: 'L\'événement n\'est pas ouvert aux inscriptions' };
    }

    // Vérifier si les inscriptions sont requises
    if (!event.registrationRequired) {
      return { canRegister: false, reason: 'Cet événement ne nécessite pas d\'inscription' };
    }

    // Vérifier la date limite
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return { canRegister: false, reason: 'La date limite d\'inscription est dépassée' };
    }

    // Vérifier si déjà inscrit
    const existingReg = event.registrations.find(r => 
      r.memberId === memberId && r.status !== 'cancelled'
    );
    if (existingReg) {
      return { canRegister: false, reason: 'Vous êtes déjà inscrit à cet événement' };
    }

    // Vérifier la capacité
    const stats = this.calculateEventStats(event);
    if (event.capacity && stats.expectedAttendance >= event.capacity) {
      return { canRegister: true, reason: 'Liste d\'attente disponible' };
    }

    return { canRegister: true };
  }

  /**
   * Générer les dates d'un événement récurrent
   */
  static generateRecurringDates(
    startDate: Date,
    recurrence: EventRecurrence,
    count: number = 10
  ): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    const endDate = recurrence.endDate ? new Date(recurrence.endDate) : null;

    while (dates.length < count) {
      // Vérifier si on a dépassé la date de fin
      if (endDate && currentDate > endDate) break;

      // Vérifier si cette date est une exception
      const isException = recurrence.exceptions?.some(
        ex => new Date(ex).toDateString() === currentDate.toDateString()
      );

      if (!isException) {
        dates.push(new Date(currentDate));
      }

      // Calculer la prochaine date
      switch (recurrence.pattern) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + recurrence.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * recurrence.interval));
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + recurrence.interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + recurrence.interval);
          break;
      }
    }

    return dates;
  }

  /**
   * Obtenir le type d'événement formaté
   */
  static getEventTypeLabel(type: EventType): string {
    const labels: Record<EventType, string> = {
      service: 'Culte',
      prayer: 'Prière',
      study: 'Étude biblique',
      youth: 'Jeunesse',
      children: 'Enfants',
      conference: 'Conférence',
      retreat: 'Retraite',
      social: 'Activité sociale',
      outreach: 'Évangélisation',
      training: 'Formation',
      meeting: 'Réunion',
      other: 'Autre'
    };
    return labels[type] || 'Événement';
  }

  /**
   * Obtenir l'icône d'un type d'événement
   */
  static getEventTypeIcon(type: EventType): string {
    const icons: Record<EventType, string> = {
      service: '⛪',
      prayer: '🙏',
      study: '📖',
      youth: '🌟',
      children: '👶',
      conference: '🎤',
      retreat: '🏕️',
      social: '🎉',
      outreach: '🌍',
      training: '📚',
      meeting: '👥',
      other: '📅'
    };
    return icons[type] || '📅';
  }

  /**
   * Formater la date d'un événement
   */
  static formatEventDate(startDate: Date, endDate: Date): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };

    const startDateStr = start.toLocaleDateString('fr-FR', dateOptions);
    const startTimeStr = start.toLocaleTimeString('fr-FR', timeOptions);
    const endTimeStr = end.toLocaleTimeString('fr-FR', timeOptions);

    // Même jour
    if (start.toDateString() === end.toDateString()) {
      return `${startDateStr} de ${startTimeStr} à ${endTimeStr}`;
    }

    // Jours différents
    const endDateStr = end.toLocaleDateString('fr-FR', dateOptions);
    return `Du ${startDateStr} à ${startTimeStr} au ${endDateStr} à ${endTimeStr}`;
  }
}

// ============================================================================
// SERVICE DE CHECK-IN
// ============================================================================

export class CheckInService {
  
  /**
   * Effectuer un check-in
   */
  static performCheckIn(
    eventId: string,
    memberId: string,
    memberName: string,
    method: EventAttendance['method'] = 'manual',
    checkedInBy?: string
  ): EventAttendance {
    return {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventId,
      memberId,
      memberName,
      checkInTime: new Date(),
      method,
      checkedInBy
    };
  }

  /**
   * Effectuer un check-out
   */
  static performCheckOut(attendance: EventAttendance): EventAttendance {
    return {
      ...attendance,
      checkOutTime: new Date()
    };
  }

  /**
   * Vérifier un code de check-in
   */
  static verifyCheckInCode(
    event: Event,
    code: string
  ): EventRegistration | null {
    return event.registrations.find(
      r => r.checkInCode === code && r.status === 'confirmed'
    ) || null;
  }

  /**
   * Générer un QR code data pour le check-in
   */
  static generateQRCodeData(
    eventId: string,
    registrationId: string,
    checkInCode: string
  ): string {
    return JSON.stringify({
      type: 'event_checkin',
      eventId,
      registrationId,
      code: checkInCode,
      timestamp: Date.now()
    });
  }

  /**
   * Calculer la durée de présence
   */
  static calculateDuration(attendance: EventAttendance): number | null {
    if (!attendance.checkInTime || !attendance.checkOutTime) {
      return null;
    }
    
    const checkIn = new Date(attendance.checkInTime);
    const checkOut = new Date(attendance.checkOutTime);
    
    return Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60)); // En minutes
  }

  /**
   * Obtenir le statut de présence formaté
   */
  static getAttendanceStatus(attendance: EventAttendance): {
    status: 'checked-in' | 'checked-out' | 'absent';
    label: string;
    color: string;
  } {
    if (attendance.checkOutTime) {
      return { status: 'checked-out', label: 'Parti', color: '#6b7280' };
    }
    if (attendance.checkInTime) {
      return { status: 'checked-in', label: 'Présent', color: '#10b981' };
    }
    return { status: 'absent', label: 'Absent', color: '#ef4444' };
  }
}

const eventExports = {
  EventService,
  CheckInService
};

export default eventExports;
