/**
 * API Routes - Audit Logs
 * 
 * GET  /api/security/audit-logs - Liste des journaux d'audit
 * POST /api/security/audit-logs - Créer une entrée d'audit
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/lib/services/security-service';

// Stockage temporaire
let auditLogs: any[] = [];

// Initialiser avec des logs de démonstration
if (auditLogs.length === 0) {
  auditLogs = [
    {
      id: 'audit_1',
      userId: 'admin_1',
      userName: 'Admin Papy',
      action: 'login',
      resource: 'auth',
      details: { method: 'password' },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      status: 'success',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'audit_2',
      userId: 'admin_1',
      userName: 'Admin Papy',
      action: 'member_created',
      resource: 'members',
      resourceId: 'member_123',
      details: { memberName: 'Jean Dupont' },
      ipAddress: '192.168.1.1',
      status: 'success',
      timestamp: new Date(Date.now() - 3000000).toISOString()
    },
    {
      id: 'audit_3',
      userId: null,
      userName: null,
      action: 'login_failed',
      resource: 'auth',
      details: { email: 'unknown@email.com', reason: 'invalid_credentials' },
      ipAddress: '45.67.89.123',
      status: 'failure',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredLogs = [...auditLogs];

    if (userId) {
      filteredLogs = filteredLogs.filter(l => l.userId === userId);
    }

    if (action) {
      filteredLogs = filteredLogs.filter(l => l.action === action);
    }

    if (resource) {
      filteredLogs = filteredLogs.filter(l => l.resource === resource);
    }

    if (status) {
      filteredLogs = filteredLogs.filter(l => l.status === status);
    }

    if (startDate) {
      filteredLogs = filteredLogs.filter(l => 
        new Date(l.timestamp) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(l => 
        new Date(l.timestamp) <= new Date(endDate)
      );
    }

    // Trier par timestamp décroissant
    filteredLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Ajouter les descriptions
    const logsWithDescriptions = filteredLogs.map(log => ({
      ...log,
      actionDescription: AuditService.getActionDescription(log.action),
      severity: AuditService.getActionSeverity(log.action)
    }));

    // Pagination
    const paginatedLogs = logsWithDescriptions.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedLogs,
      total: filteredLogs.length,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < filteredLogs.length
      },
      stats: {
        total: auditLogs.length,
        success: auditLogs.filter(l => l.status === 'success').length,
        failure: auditLogs.filter(l => l.status === 'failure').length,
        warning: auditLogs.filter(l => l.status === 'warning').length,
        byAction: auditLogs.reduce((acc: Record<string, number>, l) => {
          acc[l.action] = (acc[l.action] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('[Audit Logs GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, resource, details, userId, userName, resourceId, ipAddress, userAgent, status } = body;

    if (!action || !resource || !ipAddress) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes: action, resource et ipAddress sont requis' },
        { status: 400 }
      );
    }

    const auditLog = AuditService.createAuditLog(
      action,
      resource,
      details || {},
      {
        userId,
        userName,
        resourceId,
        ipAddress,
        userAgent,
        status
      }
    );

    auditLogs.push({
      ...auditLog,
      timestamp: auditLog.timestamp.toISOString()
    });

    // Limiter la taille du log (garder les 10000 derniers)
    if (auditLogs.length > 10000) {
      auditLogs = auditLogs.slice(-10000);
    }

    return NextResponse.json({
      success: true,
      message: 'Log d\'audit créé',
      data: {
        ...auditLog,
        timestamp: auditLog.timestamp.toISOString(),
        actionDescription: AuditService.getActionDescription(action),
        severity: AuditService.getActionSeverity(action)
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[Audit Logs POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du log' },
      { status: 500 }
    );
  }
}
