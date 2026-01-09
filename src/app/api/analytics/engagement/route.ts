/**
 * API Routes - Member Engagement Scoring
 * 
 * GET  /api/analytics/engagement/[memberId] - Score d'engagement d'un membre
 * GET  /api/analytics/engagement - Scores globaux
 */

import { NextRequest, NextResponse } from 'next/server';
import AnalyticsService from '@/lib/services/analytics-service';

// Données de démonstration
const DEMO_ENGAGEMENT_DATA: Record<string, any> = {
  'member_1': {
    memberId: 'member_1',
    name: 'Jean Dupont',
    attendanceRate: 0.85,
    donationFrequency: 0.9,
    ministryInvolvement: 0.7,
    eventParticipation: 0.6,
    prayerActivity: 0.8
  },
  'member_2': {
    memberId: 'member_2',
    name: 'Marie Martin',
    attendanceRate: 0.95,
    donationFrequency: 0.8,
    ministryInvolvement: 0.9,
    eventParticipation: 0.85,
    prayerActivity: 0.9
  },
  'member_3': {
    memberId: 'member_3',
    name: 'Pierre Bernard',
    attendanceRate: 0.45,
    donationFrequency: 0.3,
    ministryInvolvement: 0.2,
    eventParticipation: 0.1,
    prayerActivity: 0.25
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const minScore = parseInt(searchParams.get('minScore') || '0');
    const maxScore = parseInt(searchParams.get('maxScore') || '100');
    const level = searchParams.get('level');

    // Si un membre spécifique est demandé
    if (memberId) {
      const memberData = DEMO_ENGAGEMENT_DATA[memberId];
      
      if (!memberData) {
        return NextResponse.json(
          { success: false, error: 'Membre non trouvé' },
          { status: 404 }
        );
      }

      const engagement = AnalyticsService.calculateMemberEngagementScore({
        attendanceRate: memberData.attendanceRate,
        donationFrequency: memberData.donationFrequency,
        ministryInvolvement: memberData.ministryInvolvement,
        eventParticipation: memberData.eventParticipation,
        prayerActivity: memberData.prayerActivity
      });

      return NextResponse.json({
        success: true,
        data: {
          ...memberData,
          engagement
        }
      });
    }

    // Sinon, retourner tous les scores
    const allEngagements = Object.entries(DEMO_ENGAGEMENT_DATA).map(([id, data]) => {
      const engagement = AnalyticsService.calculateMemberEngagementScore({
        attendanceRate: data.attendanceRate,
        donationFrequency: data.donationFrequency,
        ministryInvolvement: data.ministryInvolvement,
        eventParticipation: data.eventParticipation,
        prayerActivity: data.prayerActivity
      });

      return {
        memberId: id,
        name: data.name,
        ...engagement
      };
    });

    // Filtrer par score
    let filtered = allEngagements.filter(e => e.score >= minScore && e.score <= maxScore);

    // Filtrer par niveau
    if (level) {
      filtered = filtered.filter(e => e.level === level);
    }

    // Trier par score décroissant
    filtered.sort((a, b) => b.score - a.score);

    // Statistiques globales
    const stats = {
      averageScore: Math.round(allEngagements.reduce((acc, e) => acc + e.score, 0) / allEngagements.length),
      byLevel: allEngagements.reduce((acc: Record<string, number>, e) => {
        acc[e.level] = (acc[e.level] || 0) + 1;
        return acc;
      }, {}),
      topPerformers: allEngagements.filter(e => e.score >= 80).length,
      atRisk: allEngagements.filter(e => e.score < 40).length
    };

    return NextResponse.json({
      success: true,
      data: filtered,
      stats,
      total: filtered.length
    });
  } catch (error) {
    console.error('[Engagement GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des scores' },
      { status: 500 }
    );
  }
}
