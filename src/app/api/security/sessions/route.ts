/**
 * API Routes - Session Management
 * 
 * GET    /api/security/sessions - Liste des sessions actives
 * DELETE /api/security/sessions - Révoquer une session
 */

import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/services/security-service';

// Stockage temporaire
let sessions: any[] = [];

// Initialiser avec des sessions de démonstration
if (sessions.length === 0) {
  sessions = [
    {
      id: 'sess_current',
      userId: 'admin_1',
      token: 'current_token',
      deviceInfo: {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        browser: 'Chrome',
        os: 'Windows',
        device: 'Desktop'
      },
      ipAddress: '192.168.1.1',
      location: { country: 'RD Congo', city: 'Kinshasa' },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lastActive: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      isTrusted: true,
      isCurrent: true
    },
    {
      id: 'sess_mobile',
      userId: 'admin_1',
      token: 'mobile_token',
      deviceInfo: {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        browser: 'Safari',
        os: 'iOS',
        device: 'Mobile'
      },
      ipAddress: '10.0.0.1',
      location: { country: 'RD Congo', city: 'Lubumbashi' },
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      lastActive: new Date(Date.now() - 7200000).toISOString(),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      isTrusted: false,
      isCurrent: false
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId est requis' },
        { status: 400 }
      );
    }

    let userSessions = sessions.filter(s => s.userId === userId);

    if (activeOnly) {
      userSessions = userSessions.filter(s => 
        s.isActive && new Date(s.expiresAt) > new Date()
      );
    }

    // Trier par dernière activité
    userSessions.sort((a, b) => 
      new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
    );

    return NextResponse.json({
      success: true,
      data: userSessions.map(s => ({
        ...s,
        isValid: SessionService.isSessionValid(s)
      })),
      total: userSessions.length
    });
  } catch (error) {
    console.error('[Sessions GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ipAddress, userAgent, deviceFingerprint } = body;

    if (!userId || !ipAddress || !userAgent) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const session = SessionService.createSession(
      userId,
      ipAddress,
      userAgent,
      deviceFingerprint
    );

    sessions.push({
      ...session,
      createdAt: session.createdAt.toISOString(),
      lastActive: session.lastActive.toISOString(),
      expiresAt: session.expiresAt.toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Session créée',
      data: {
        ...session,
        createdAt: session.createdAt.toISOString(),
        lastActive: session.lastActive.toISOString(),
        expiresAt: session.expiresAt.toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[Sessions POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const revokeAll = searchParams.get('revokeAll') === 'true';
    const exceptCurrent = searchParams.get('exceptCurrent') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId est requis' },
        { status: 400 }
      );
    }

    if (revokeAll) {
      // Révoquer toutes les sessions
      let sessionsToRevoke = sessions.filter(s => s.userId === userId);
      
      if (exceptCurrent) {
        sessionsToRevoke = sessionsToRevoke.filter(s => !s.isCurrent);
      }

      sessionsToRevoke.forEach(s => {
        s.isActive = false;
      });

      return NextResponse.json({
        success: true,
        message: `${sessionsToRevoke.length} session(s) révoquée(s)`,
        revokedCount: sessionsToRevoke.length
      });
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId est requis' },
        { status: 400 }
      );
    }

    const index = sessions.findIndex(s => s.id === sessionId && s.userId === userId);
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    if (sessions[index].isCurrent) {
      return NextResponse.json(
        { success: false, error: 'Impossible de révoquer la session courante' },
        { status: 400 }
      );
    }

    sessions[index].isActive = false;

    return NextResponse.json({
      success: true,
      message: 'Session révoquée',
      data: sessions[index]
    });
  } catch (error) {
    console.error('[Sessions DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la révocation' },
      { status: 500 }
    );
  }
}
