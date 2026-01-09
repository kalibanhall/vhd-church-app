/**
 * API Routes - Dashboard Analytics
 * 
 * GET /api/analytics/dashboard - Métriques complètes du tableau de bord
 */

import { NextRequest, NextResponse } from 'next/server';
import AnalyticsService from '@/lib/services/analytics-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section'); // members, donations, attendance, engagement, growth, all
    const period = searchParams.get('period') || 'month'; // week, month, quarter, year

    const metrics = await AnalyticsService.calculateDashboardMetrics();

    // Si une section spécifique est demandée
    if (section && section !== 'all') {
      const sectionKey = section as keyof typeof metrics;
      if (metrics[sectionKey]) {
        return NextResponse.json({
          success: true,
          data: {
            [section]: metrics[sectionKey]
          },
          period,
          generatedAt: new Date().toISOString()
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Section non reconnue' },
          { status: 400 }
        );
      }
    }

    // Retourner toutes les métriques
    return NextResponse.json({
      success: true,
      data: metrics,
      period,
      summary: {
        totalMembers: metrics.members.total,
        activeMembers: metrics.members.active,
        monthlyDonations: metrics.donations.totalThisMonth,
        averageAttendance: metrics.attendance.averageWeekly,
        growthTrend: metrics.members.growthRate > 0 ? 'positive' : metrics.members.growthRate < 0 ? 'negative' : 'stable'
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Analytics Dashboard GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des analytics' },
      { status: 500 }
    );
  }
}
