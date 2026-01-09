/**
 * =============================================================================
 * SERVICE D'ANALYTICS ET TABLEAU DE BORD - MyChurchApp
 * =============================================================================
 * 
 * Fonctionnalités:
 * - Statistiques des membres
 * - Analyse des dons
 * - Métriques de participation
 * - Tendances de croissance
 * - Rapports automatiques
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * =============================================================================
 */

// Types
export interface DashboardMetrics {
  members: MemberMetrics;
  donations: DonationMetrics;
  attendance: AttendanceMetrics;
  engagement: EngagementMetrics;
  growth: GrowthMetrics;
}

export interface MemberMetrics {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  newLastMonth: number;
  growthRate: number;
  byStatus: Record<string, number>;
  byAge: AgeDistribution;
  byGender: Record<string, number>;
  byMinistry: Record<string, number>;
}

export interface AgeDistribution {
  '0-12': number;
  '13-17': number;
  '18-25': number;
  '26-35': number;
  '36-50': number;
  '51-65': number;
  '65+': number;
}

export interface DonationMetrics {
  totalThisMonth: number;
  totalLastMonth: number;
  totalThisYear: number;
  averageDonation: number;
  largestDonation: number;
  donorCount: number;
  recurringDonors: number;
  growthRate: number;
  byType: Record<string, number>;
  byProject: Record<string, number>;
  monthlyTrend: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  value: number;
  count?: number;
}

export interface AttendanceMetrics {
  averageWeekly: number;
  lastWeek: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  peakAttendance: number;
  peakDate: string;
  byService: Record<string, number>;
  weeklyTrend: MonthlyData[];
  onlineVsInPerson: {
    online: number;
    inPerson: number;
  };
}

export interface EngagementMetrics {
  prayerRequests: {
    total: number;
    thisMonth: number;
    answered: number;
  };
  testimonies: {
    total: number;
    thisMonth: number;
    pending: number;
  };
  events: {
    upcoming: number;
    thisMonth: number;
    avgParticipants: number;
  };
  messages: {
    total: number;
    thisWeek: number;
  };
}

export interface GrowthMetrics {
  memberGrowth: TrendData[];
  donationGrowth: TrendData[];
  attendanceGrowth: TrendData[];
  predictions: {
    nextMonthMembers: number;
    nextMonthDonations: number;
    confidence: number;
  };
}

export interface TrendData {
  period: string;
  value: number;
  change: number;
  changePercent: number;
}

// ============================================================================
// SERVICE D'ANALYTICS
// ============================================================================

export class AnalyticsService {
  
  /**
   * Calculer toutes les métriques du tableau de bord
   */
  static async calculateDashboardMetrics(churchId?: string): Promise<DashboardMetrics> {
    // En production, ces données viendraient de la base de données
    // Ici, on génère des données de démonstration réalistes
    
    const members = this.getMemberMetrics();
    const donations = this.getDonationMetrics();
    const attendance = this.getAttendanceMetrics();
    const engagement = this.getEngagementMetrics();
    const growth = this.getGrowthMetrics();

    return {
      members,
      donations,
      attendance,
      engagement,
      growth
    };
  }

  /**
   * Métriques des membres
   */
  private static getMemberMetrics(): MemberMetrics {
    const total = 245;
    const active = 198;
    const newThisMonth = 8;
    const newLastMonth = 6;

    return {
      total,
      active,
      inactive: total - active,
      newThisMonth,
      newLastMonth,
      growthRate: ((newThisMonth - newLastMonth) / newLastMonth) * 100,
      byStatus: {
        'Actif': active,
        'Inactif': 35,
        'Nouveau': newThisMonth,
        'En attente': 4
      },
      byAge: {
        '0-12': 28,
        '13-17': 22,
        '18-25': 45,
        '26-35': 62,
        '36-50': 48,
        '51-65': 28,
        '65+': 12
      },
      byGender: {
        'Homme': 108,
        'Femme': 137
      },
      byMinistry: {
        'Louange': 25,
        'Jeunesse': 32,
        'Enfants': 18,
        'Accueil': 15,
        'Technique': 8,
        'Intercession': 22,
        'Visitation': 12
      }
    };
  }

  /**
   * Métriques des dons
   */
  private static getDonationMetrics(): DonationMetrics {
    const totalThisMonth = 12500;
    const totalLastMonth = 11200;

    return {
      totalThisMonth,
      totalLastMonth,
      totalThisYear: 98500,
      averageDonation: 85,
      largestDonation: 2500,
      donorCount: 147,
      recurringDonors: 52,
      growthRate: ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100,
      byType: {
        'Dîme': 7500,
        'Offrande': 3200,
        'Mission': 1200,
        'Bâtiment': 600
      },
      byProject: {
        'Fonctionnement': 8000,
        'Missions Afrique': 2500,
        'Rénovation': 1500,
        'Aide sociale': 500
      },
      monthlyTrend: this.generateMonthlyTrend(12, 10000, 15000)
    };
  }

  /**
   * Métriques de participation
   */
  private static getAttendanceMetrics(): AttendanceMetrics {
    const lastWeek = 185;
    const averageWeekly = 178;

    return {
      averageWeekly,
      lastWeek,
      trend: lastWeek > averageWeekly ? 'up' : lastWeek < averageWeekly ? 'down' : 'stable',
      trendPercentage: ((lastWeek - averageWeekly) / averageWeekly) * 100,
      peakAttendance: 312,
      peakDate: '2024-12-25',
      byService: {
        'Dimanche matin': 165,
        'Dimanche soir': 45,
        'Mercredi prière': 38,
        'Vendredi jeunes': 52
      },
      weeklyTrend: this.generateWeeklyTrend(8, 150, 200),
      onlineVsInPerson: {
        online: 35,
        inPerson: 150
      }
    };
  }

  /**
   * Métriques d'engagement
   */
  private static getEngagementMetrics(): EngagementMetrics {
    return {
      prayerRequests: {
        total: 856,
        thisMonth: 42,
        answered: 324
      },
      testimonies: {
        total: 128,
        thisMonth: 8,
        pending: 3
      },
      events: {
        upcoming: 5,
        thisMonth: 8,
        avgParticipants: 45
      },
      messages: {
        total: 2456,
        thisWeek: 89
      }
    };
  }

  /**
   * Métriques de croissance
   */
  private static getGrowthMetrics(): GrowthMetrics {
    return {
      memberGrowth: this.generateTrendData(6, 230, 245),
      donationGrowth: this.generateTrendData(6, 9500, 12500),
      attendanceGrowth: this.generateTrendData(6, 165, 185),
      predictions: {
        nextMonthMembers: 252,
        nextMonthDonations: 13200,
        confidence: 78
      }
    };
  }

  /**
   * Générer des données de tendance mensuelle
   */
  private static generateMonthlyTrend(months: number, min: number, max: number): MonthlyData[] {
    const data: MonthlyData[] = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      data.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        value: Math.floor(min + Math.random() * (max - min)),
        count: Math.floor(80 + Math.random() * 70)
      });
    }
    
    return data;
  }

  /**
   * Générer des données de tendance hebdomadaire
   */
  private static generateWeeklyTrend(weeks: number, min: number, max: number): MonthlyData[] {
    const data: MonthlyData[] = [];
    const now = new Date();
    
    for (let i = weeks - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      data.push({
        month: `Sem. ${date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`,
        value: Math.floor(min + Math.random() * (max - min))
      });
    }
    
    return data;
  }

  /**
   * Générer des données de tendance avec calcul de changement
   */
  private static generateTrendData(periods: number, startValue: number, endValue: number): TrendData[] {
    const data: TrendData[] = [];
    const increment = (endValue - startValue) / (periods - 1);
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const now = new Date();
    
    for (let i = 0; i < periods; i++) {
      const monthIndex = (now.getMonth() - periods + 1 + i + 12) % 12;
      const value = Math.round(startValue + (increment * i) + (Math.random() * 10 - 5));
      const prevValue = i > 0 ? data[i - 1].value : value;
      const change = value - prevValue;
      
      data.push({
        period: months[monthIndex],
        value,
        change,
        changePercent: prevValue > 0 ? (change / prevValue) * 100 : 0
      });
    }
    
    return data;
  }

  /**
   * Calculer le score d'engagement d'un membre
   */
  static calculateMemberEngagementScore(memberData: {
    attendanceRate: number;
    donationFrequency: number;
    ministryInvolvement: number;
    eventParticipation: number;
    prayerActivity: number;
  }): { score: number; level: string; recommendations: string[] } {
    const weights = {
      attendance: 0.3,
      donations: 0.2,
      ministry: 0.25,
      events: 0.15,
      prayer: 0.1
    };

    const score = Math.round(
      (memberData.attendanceRate * weights.attendance +
       memberData.donationFrequency * weights.donations +
       memberData.ministryInvolvement * weights.ministry +
       memberData.eventParticipation * weights.events +
       memberData.prayerActivity * weights.prayer) * 100
    );

    let level: string;
    let recommendations: string[] = [];

    if (score >= 80) {
      level = 'Très engagé';
      recommendations = ['Envisager un rôle de leadership', 'Participer au mentorat'];
    } else if (score >= 60) {
      level = 'Engagé';
      recommendations = ['Rejoindre un ministère', 'Participer aux petits groupes'];
    } else if (score >= 40) {
      level = 'Modérément engagé';
      recommendations = ['Assister aux cultes régulièrement', 'Participer à un événement'];
    } else if (score >= 20) {
      level = 'Peu engagé';
      recommendations = ['Prendre contact pastoral', 'Proposer une visite'];
    } else {
      level = 'Inactif';
      recommendations = ['Contacter le membre', 'Vérifier le bien-être'];
    }

    return { score, level, recommendations };
  }

  /**
   * Générer un rapport périodique
   */
  static async generateReport(
    type: 'weekly' | 'monthly' | 'quarterly' | 'annual',
    startDate: Date,
    endDate: Date
  ): Promise<{
    period: string;
    summary: string;
    metrics: Partial<DashboardMetrics>;
    highlights: string[];
    concerns: string[];
  }> {
    const metrics = await this.calculateDashboardMetrics();

    const periodNames = {
      weekly: 'Semaine',
      monthly: 'Mois',
      quarterly: 'Trimestre',
      annual: 'Année'
    };

    return {
      period: `${periodNames[type]} du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`,
      summary: `Rapport ${periodNames[type].toLowerCase()} de l'église`,
      metrics: {
        members: metrics.members,
        donations: metrics.donations,
        attendance: metrics.attendance
      },
      highlights: [
        `${metrics.members.newThisMonth} nouveaux membres ont rejoint la communauté`,
        `Les dons ont augmenté de ${metrics.donations.growthRate.toFixed(1)}%`,
        `Participation moyenne de ${metrics.attendance.averageWeekly} personnes par culte`
      ],
      concerns: metrics.donations.growthRate < 0 
        ? ['Baisse des dons ce mois-ci - envisager une campagne de sensibilisation']
        : []
    };
  }
}

export default AnalyticsService;
