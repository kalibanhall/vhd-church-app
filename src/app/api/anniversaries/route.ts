/**
 * API Routes - Anniversaries Management
 * 
 * GET /api/anniversaries - Liste les anniversaires
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnniversaryService } from '@/lib/services/workflow-service';

// Données de démonstration (en production, récupérer de la base de données)
const DEMO_MEMBERS = [
  { id: '1', firstName: 'Jean', lastName: 'Dupont', birthDate: new Date(1985, new Date().getMonth(), new Date().getDate()), membershipDate: '2020-03-15', status: 'ACTIVE', email: 'jean.dupont@email.com' },
  { id: '2', firstName: 'Marie', lastName: 'Martin', birthDate: new Date(1990, new Date().getMonth(), new Date().getDate() + 2), membershipDate: '2019-06-20', status: 'ACTIVE', email: 'marie.martin@email.com' },
  { id: '3', firstName: 'Pierre', lastName: 'Bernard', birthDate: new Date(1978, new Date().getMonth(), new Date().getDate() + 5), membershipDate: '2018-01-10', status: 'ACTIVE', email: 'pierre.bernard@email.com' },
  { id: '4', firstName: 'Sophie', lastName: 'Durand', birthDate: new Date(1995, new Date().getMonth(), new Date().getDate() - 1), membershipDate: '2021-09-05', status: 'ACTIVE', email: 'sophie.durand@email.com' },
  { id: '5', firstName: 'Lucas', lastName: 'Petit', birthDate: new Date(1982, new Date().getMonth() + 1, 15), membershipDate: '2017-04-22', status: 'ACTIVE', email: 'lucas.petit@email.com' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // birthday, membership, all
    const period = searchParams.get('period') || 'week'; // today, week, month
    const days = parseInt(searchParams.get('days') || '7');

    const response: any = {
      success: true,
      data: {},
      timestamp: new Date().toISOString()
    };

    // Anniversaires de naissance
    if (type === 'birthday' || type === 'all') {
      const todaysBirthdays = AnniversaryService.getTodaysBirthdays(DEMO_MEMBERS);
      const upcomingBirthdays = AnniversaryService.getUpcomingBirthdays(DEMO_MEMBERS, days);

      response.data.birthdays = {
        today: todaysBirthdays.map(member => ({
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          age: AnniversaryService.calculateAge(member.birthDate),
          type: 'birthday'
        })),
        upcoming: upcomingBirthdays.map(member => ({
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          daysUntil: member.daysUntilBirthday,
          date: member.upcomingBirthday,
          age: AnniversaryService.calculateAge(member.birthDate) + 1,
          type: 'birthday'
        })),
        total: todaysBirthdays.length + upcomingBirthdays.length
      };
    }

    // Anniversaires de membership
    if (type === 'membership' || type === 'all') {
      const membershipAnniversaries = AnniversaryService.getMembershipAnniversaries(DEMO_MEMBERS);

      response.data.membership = {
        thisMonth: membershipAnniversaries.map(member => ({
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          years: member.yearsOfMembership,
          date: member.anniversaryDate,
          type: 'membership'
        })),
        total: membershipAnniversaries.length
      };
    }

    // Statistiques globales
    response.stats = {
      birthdaysThisMonth: DEMO_MEMBERS.filter(m => {
        if (!m.birthDate) return false;
        return new Date(m.birthDate).getMonth() === new Date().getMonth();
      }).length,
      membershipAnniversariesThisMonth: response.data.membership?.total || 0,
      upcomingCount: response.data.birthdays?.upcoming.length || 0
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Anniversaries GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des anniversaires' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, memberId, type } = body;

    if (action === 'send_wishes') {
      // Envoyer les vœux d'anniversaire
      // En production, déclencher l'envoi d'email via le workflow
      
      return NextResponse.json({
        success: true,
        message: `Vœux d'anniversaire envoyés avec succès`,
        data: {
          memberId,
          type,
          sentAt: new Date().toISOString()
        }
      });
    }

    if (action === 'mark_acknowledged') {
      // Marquer comme vu/reconnu
      return NextResponse.json({
        success: true,
        message: 'Anniversaire marqué comme reconnu',
        data: {
          memberId,
          acknowledgedAt: new Date().toISOString()
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Anniversaries POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du traitement de l\'action' },
      { status: 500 }
    );
  }
}
