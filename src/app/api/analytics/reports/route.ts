/**
 * API Routes - Reports Generation
 * 
 * GET  /api/analytics/reports - Liste des rapports
 * POST /api/analytics/reports - Générer un nouveau rapport
 */

import { NextRequest, NextResponse } from 'next/server';
import AnalyticsService from '@/lib/services/analytics-service';

// Stockage des rapports générés
let reports: any[] = [];
let reportIdCounter = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10');

    let filteredReports = [...reports];

    if (type) {
      filteredReports = filteredReports.filter(r => r.type === type);
    }

    // Trier par date de création (plus récent en premier)
    filteredReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: filteredReports.slice(0, limit),
      total: filteredReports.length,
      types: ['weekly', 'monthly', 'quarterly', 'annual']
    });
  } catch (error) {
    console.error('[Reports GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des rapports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'monthly', startDate, endDate } = body;

    // Calculer les dates si non fournies
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (type) {
      case 'weekly':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'annual':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (endDate) {
      end = new Date(endDate);
    }

    // Générer le rapport
    const reportData = await AnalyticsService.generateReport(type, start, end);

    const report = {
      id: `report_${reportIdCounter++}`,
      type,
      ...reportData,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    reports.push(report);

    return NextResponse.json({
      success: true,
      message: 'Rapport généré avec succès',
      data: report
    }, { status: 201 });
  } catch (error) {
    console.error('[Reports POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du rapport' },
      { status: 500 }
    );
  }
}
