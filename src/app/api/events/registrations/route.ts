/**
 * API Routes - Event Registrations
 * 
 * GET  /api/events/registrations - Liste des inscriptions
 * POST /api/events/registrations - S'inscrire à un événement
 */

import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '@/lib/services/event-service';

// Stockage temporaire
let registrations: any[] = [];
let regIdCounter = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const memberId = searchParams.get('memberId');
    const status = searchParams.get('status');

    let filteredRegs = [...registrations];

    if (eventId) {
      filteredRegs = filteredRegs.filter(r => r.eventId === eventId);
    }

    if (memberId) {
      filteredRegs = filteredRegs.filter(r => r.memberId === memberId);
    }

    if (status) {
      filteredRegs = filteredRegs.filter(r => r.status === status);
    }

    // Trier par date d'inscription
    filteredRegs.sort((a, b) => 
      new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredRegs,
      total: filteredRegs.length,
      stats: {
        confirmed: filteredRegs.filter(r => r.status === 'confirmed').length,
        pending: filteredRegs.filter(r => r.status === 'pending').length,
        waitlist: filteredRegs.filter(r => r.status === 'waitlist').length,
        cancelled: filteredRegs.filter(r => r.status === 'cancelled').length
      }
    });
  } catch (error) {
    console.error('[Registrations GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des inscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, memberId, memberName, memberEmail, memberPhone, guests, guestNames, notes } = body;

    if (!eventId || !memberId || !memberName) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Vérifier si déjà inscrit
    const existingReg = registrations.find(
      r => r.eventId === eventId && r.memberId === memberId && r.status !== 'cancelled'
    );

    if (existingReg) {
      return NextResponse.json(
        { success: false, error: 'Vous êtes déjà inscrit à cet événement' },
        { status: 409 }
      );
    }

    const newRegistration = {
      id: `reg_${regIdCounter++}`,
      eventId,
      memberId,
      memberName,
      memberEmail: memberEmail || null,
      memberPhone: memberPhone || null,
      guests: guests || 0,
      guestNames: guestNames || [],
      status: 'confirmed', // En production, vérifier la capacité pour mettre en waitlist
      notes: notes || null,
      registeredAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      checkInCode: EventService.generateCheckInCode()
    };

    registrations.push(newRegistration);

    return NextResponse.json({
      success: true,
      message: 'Inscription confirmée',
      data: newRegistration
    }, { status: 201 });
  } catch (error) {
    console.error('[Registrations POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { registrationId, action, guests, guestNames, notes } = body;

    const index = registrations.findIndex(r => r.id === registrationId);
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Inscription non trouvée' },
        { status: 404 }
      );
    }

    if (action === 'cancel') {
      registrations[index].status = 'cancelled';
      return NextResponse.json({
        success: true,
        message: 'Inscription annulée',
        data: registrations[index]
      });
    }

    if (action === 'confirm') {
      registrations[index].status = 'confirmed';
      registrations[index].confirmedAt = new Date().toISOString();
      return NextResponse.json({
        success: true,
        message: 'Inscription confirmée',
        data: registrations[index]
      });
    }

    if (action === 'update') {
      if (guests !== undefined) {
        registrations[index].guests = guests;
        registrations[index].guestNames = guestNames || [];
      }
      if (notes !== undefined) {
        registrations[index].notes = notes;
      }
      return NextResponse.json({
        success: true,
        message: 'Inscription mise à jour',
        data: registrations[index]
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Registrations PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
