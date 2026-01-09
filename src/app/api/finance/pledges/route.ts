/**
 * API Routes - Pledge Commitments Management
 * 
 * GET  /api/finance/pledges - Liste des promesses de dons
 * POST /api/finance/pledges - Créer une promesse
 */

import { NextRequest, NextResponse } from 'next/server';
import { PledgeService } from '@/lib/services/finance-service';

// Stockage temporaire
let pledges: any[] = [];
let pledgeIdCounter = 1;

// Initialiser avec des promesses de démonstration
if (pledges.length === 0) {
  pledges = [
    {
      id: `pledge_${pledgeIdCounter++}`,
      memberId: 'member_1',
      memberName: 'Jean Dupont',
      projectId: 'project_1',
      amount: 100,
      frequency: 'monthly',
      startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: null,
      status: 'active',
      fulfilledAmount: 550,
      payments: [
        { id: 'pay_1', amount: 100, date: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'pay_2', amount: 100, date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'pay_3', amount: 100, date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'pay_4', amount: 100, date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'pay_5', amount: 150, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      reminderEnabled: true,
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `pledge_${pledgeIdCounter++}`,
      memberId: 'member_2',
      memberName: 'Marie Martin',
      projectId: null,
      amount: 50,
      frequency: 'weekly',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      fulfilledAmount: 150,
      payments: [
        { id: 'pay_6', amount: 50, date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'pay_7', amount: 50, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'pay_8', amount: 50, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
      ],
      reminderEnabled: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const overdue = searchParams.get('overdue');

    let filteredPledges = [...pledges];

    if (memberId) {
      filteredPledges = filteredPledges.filter(p => p.memberId === memberId);
    }

    if (projectId) {
      filteredPledges = filteredPledges.filter(p => p.projectId === projectId);
    }

    if (status) {
      filteredPledges = filteredPledges.filter(p => p.status === status);
    }

    // Filtrer les promesses en retard
    if (overdue === 'true') {
      filteredPledges = PledgeService.getOverduePledges(filteredPledges);
    }

    // Ajouter les calculs de réalisation
    const pledgesWithDetails = filteredPledges.map(pledge => {
      const fulfillment = PledgeService.calculateFulfillmentRate(pledge);
      const nextDue = PledgeService.calculateNextDueDate(pledge);

      return {
        ...pledge,
        fulfillment,
        nextDueDate: nextDue.toISOString(),
        isOverdue: nextDue < new Date() && pledge.status === 'active'
      };
    });

    // Trier par date de création
    pledgesWithDetails.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: pledgesWithDetails,
      total: pledgesWithDetails.length,
      stats: {
        totalPledged: pledges.filter(p => p.status === 'active').reduce((sum, p) => {
          // Calculer le total promis selon la fréquence
          switch (p.frequency) {
            case 'weekly': return sum + (p.amount * 52);
            case 'monthly': return sum + (p.amount * 12);
            case 'quarterly': return sum + (p.amount * 4);
            case 'yearly': return sum + p.amount;
            default: return sum + p.amount;
          }
        }, 0),
        totalFulfilled: pledges.reduce((sum, p) => sum + p.fulfilledAmount, 0),
        activePledges: pledges.filter(p => p.status === 'active').length,
        overduePledges: PledgeService.getOverduePledges(pledges).length
      }
    });
  } catch (error) {
    console.error('[Pledges GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des promesses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, memberName, projectId, amount, frequency, startDate, endDate, reminderEnabled } = body;

    if (!memberId || !memberName || !amount || !frequency) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const newPledge = {
      id: `pledge_${pledgeIdCounter++}`,
      memberId,
      memberName,
      projectId: projectId || null,
      amount,
      frequency,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      status: 'active',
      fulfilledAmount: 0,
      payments: [],
      reminderEnabled: reminderEnabled !== false,
      createdAt: new Date().toISOString()
    };

    pledges.push(newPledge);

    return NextResponse.json({
      success: true,
      message: 'Promesse de don créée avec succès',
      data: newPledge
    }, { status: 201 });
  } catch (error) {
    console.error('[Pledges POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la promesse' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { pledgeId, action, amount, transactionId } = body;

    const index = pledges.findIndex(p => p.id === pledgeId);
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Promesse non trouvée' },
        { status: 404 }
      );
    }

    if (action === 'record_payment') {
      if (!amount || amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Montant invalide' },
          { status: 400 }
        );
      }

      const payment = {
        id: `pay_${Date.now()}`,
        amount,
        date: new Date().toISOString(),
        transactionId: transactionId || null
      };

      pledges[index].payments.push(payment);
      pledges[index].fulfilledAmount += amount;

      return NextResponse.json({
        success: true,
        message: 'Paiement enregistré',
        data: pledges[index]
      });
    }

    if (action === 'pause' || action === 'resume' || action === 'cancel' || action === 'complete') {
      const statusMap: Record<string, string> = {
        pause: 'paused',
        resume: 'active',
        cancel: 'cancelled',
        complete: 'completed'
      };

      pledges[index].status = statusMap[action];

      return NextResponse.json({
        success: true,
        message: `Promesse ${action === 'pause' ? 'mise en pause' : action === 'resume' ? 'reprise' : action === 'cancel' ? 'annulée' : 'complétée'}`,
        data: pledges[index]
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Pledges PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
