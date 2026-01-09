/**
 * API Routes - Event Check-in Management
 * 
 * GET  /api/events/check-in - Liste des présences
 * POST /api/events/check-in - Effectuer un check-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { CheckInService } from '@/lib/services/event-service';

// Stockage temporaire
let attendances: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const memberId = searchParams.get('memberId');
    const checkedIn = searchParams.get('checkedIn');

    let filteredAttendances = [...attendances];

    if (eventId) {
      filteredAttendances = filteredAttendances.filter(a => a.eventId === eventId);
    }

    if (memberId) {
      filteredAttendances = filteredAttendances.filter(a => a.memberId === memberId);
    }

    if (checkedIn !== null) {
      filteredAttendances = filteredAttendances.filter(a => 
        checkedIn === 'true' ? !!a.checkInTime : !a.checkInTime
      );
    }

    // Ajouter les durées et statuts
    const attendancesWithStatus = filteredAttendances.map(att => ({
      ...att,
      duration: CheckInService.calculateDuration(att),
      statusInfo: CheckInService.getAttendanceStatus(att)
    }));

    // Trier par heure de check-in
    attendancesWithStatus.sort((a, b) => {
      if (!a.checkInTime) return 1;
      if (!b.checkInTime) return -1;
      return new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
    });

    return NextResponse.json({
      success: true,
      data: attendancesWithStatus,
      total: attendancesWithStatus.length,
      stats: {
        checkedIn: attendancesWithStatus.filter(a => a.checkInTime && !a.checkOutTime).length,
        checkedOut: attendancesWithStatus.filter(a => a.checkOutTime).length,
        byMethod: attendancesWithStatus.reduce((acc: Record<string, number>, a) => {
          acc[a.method] = (acc[a.method] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('[Check-in GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des présences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, memberId, memberName, method, checkedInBy, code } = body;

    if (!eventId || !memberId || !memberName) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Vérifier si déjà présent
    const existingAttendance = attendances.find(
      a => a.eventId === eventId && a.memberId === memberId && a.checkInTime && !a.checkOutTime
    );

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, error: 'Cette personne est déjà enregistrée comme présente' },
        { status: 409 }
      );
    }

    const attendance = CheckInService.performCheckIn(
      eventId,
      memberId,
      memberName,
      method || 'manual',
      checkedInBy
    );

    attendances.push({
      ...attendance,
      checkInTime: attendance.checkInTime?.toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `${memberName} enregistré(e) avec succès`,
      data: {
        ...attendance,
        checkInTime: attendance.checkInTime?.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[Check-in POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du check-in' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { attendanceId, action } = body;

    const index = attendances.findIndex(a => a.id === attendanceId);
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Enregistrement non trouvé' },
        { status: 404 }
      );
    }

    if (action === 'checkout') {
      if (attendances[index].checkOutTime) {
        return NextResponse.json(
          { success: false, error: 'Cette personne a déjà effectué son check-out' },
          { status: 409 }
        );
      }

      attendances[index].checkOutTime = new Date().toISOString();
      
      return NextResponse.json({
        success: true,
        message: 'Check-out effectué',
        data: {
          ...attendances[index],
          duration: CheckInService.calculateDuration(attendances[index]),
          statusInfo: CheckInService.getAttendanceStatus(attendances[index])
        }
      });
    }

    if (action === 'cancel') {
      // Annuler le check-in
      const removed = attendances.splice(index, 1)[0];
      
      return NextResponse.json({
        success: true,
        message: 'Check-in annulé',
        data: removed
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Check-in PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
