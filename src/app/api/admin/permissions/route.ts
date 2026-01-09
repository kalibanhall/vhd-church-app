/**
 * API Routes - Permissions Management
 * 
 * GET  /api/admin/permissions - Liste de toutes les permissions disponibles
 * POST /api/admin/permissions/check - Vérifier si un rôle a une permission
 */

import { NextRequest, NextResponse } from 'next/server';
import { RoleService, Permission, Role } from '@/lib/services/admin-service';

// Liste de toutes les permissions disponibles dans le système
const AVAILABLE_PERMISSIONS: { resource: string; actions: string[]; description: string }[] = [
  { resource: 'members', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Gestion des membres' },
  { resource: 'donations', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Gestion des dons' },
  { resource: 'events', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Gestion des événements' },
  { resource: 'attendance', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Gestion des présences' },
  { resource: 'sermons', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Gestion des prédications' },
  { resource: 'prayers', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Sujets de prière' },
  { resource: 'testimonies', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Témoignages' },
  { resource: 'announcements', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Annonces' },
  { resource: 'messages', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Messagerie' },
  { resource: 'reports', actions: ['read', 'manage'], description: 'Rapports et statistiques' },
  { resource: 'settings', actions: ['read', 'update', 'manage'], description: 'Paramètres' },
  { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Gestion des rôles' },
  { resource: 'profile', actions: ['read', 'update'], description: 'Profil personnel' },
  { resource: 'facialRecognition', actions: ['read', 'manage'], description: 'Reconnaissance faciale' },
  { resource: 'workflows', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Workflows automatisés' },
  { resource: 'finance', actions: ['create', 'read', 'update', 'delete', 'manage'], description: 'Gestion financière' },
  { resource: 'security', actions: ['read', 'manage'], description: 'Paramètres de sécurité' },
  { resource: 'audit', actions: ['read'], description: 'Journaux d\'audit' }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');

    let permissions = AVAILABLE_PERMISSIONS;

    // Filtrer par ressource si spécifié
    if (resource) {
      permissions = permissions.filter(p => p.resource === resource);
    }

    // Organiser par catégorie
    const categorizedPermissions = {
      members: permissions.filter(p => ['members', 'profile', 'attendance'].includes(p.resource)),
      content: permissions.filter(p => ['sermons', 'prayers', 'testimonies', 'announcements'].includes(p.resource)),
      communication: permissions.filter(p => ['messages'].includes(p.resource)),
      finance: permissions.filter(p => ['donations', 'finance'].includes(p.resource)),
      events: permissions.filter(p => ['events'].includes(p.resource)),
      administration: permissions.filter(p => ['settings', 'roles', 'security', 'audit', 'facialRecognition', 'workflows', 'reports'].includes(p.resource))
    };

    return NextResponse.json({
      success: true,
      data: {
        all: permissions,
        categorized: categorizedPermissions,
        total: permissions.length
      }
    });
  } catch (error) {
    console.error('[Permissions GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des permissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action: checkAction } = body;

    // Vérifier une permission
    if (checkAction === 'check') {
      const { role, resource, action } = body;

      if (!role || !resource || !action) {
        return NextResponse.json(
          { success: false, error: 'role, resource et action sont requis' },
          { status: 400 }
        );
      }

      // Construire un objet Role minimal pour la vérification
      const roleObj: Role = {
        id: 'check',
        name: 'Check',
        description: '',
        permissions: role.permissions || [],
        isDefault: false,
        isSystemRole: false,
        color: '#000',
        icon: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const hasPermission = RoleService.hasPermission(roleObj, resource, action);

      return NextResponse.json({
        success: true,
        hasPermission,
        resource,
        action
      });
    }

    // Fusionner les permissions de plusieurs rôles
    if (checkAction === 'merge') {
      const { roles } = body;

      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Un tableau de rôles est requis' },
          { status: 400 }
        );
      }

      // Convertir en objets Role
      const roleObjects: Role[] = roles.map((r: { permissions: Permission[] }) => ({
        id: 'merge',
        name: 'Merge',
        description: '',
        permissions: r.permissions || [],
        isDefault: false,
        isSystemRole: false,
        color: '#000',
        icon: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const mergedPermissions = RoleService.mergePermissions(roleObjects);

      return NextResponse.json({
        success: true,
        mergedPermissions,
        totalPermissions: mergedPermissions.length
      });
    }

    // Vérifier plusieurs permissions d'un coup
    if (checkAction === 'checkMultiple') {
      const { role, checks } = body;

      if (!role || !checks || !Array.isArray(checks)) {
        return NextResponse.json(
          { success: false, error: 'role et checks sont requis' },
          { status: 400 }
        );
      }

      const roleObj: Role = {
        id: 'check',
        name: 'Check',
        description: '',
        permissions: role.permissions || [],
        isDefault: false,
        isSystemRole: false,
        color: '#000',
        icon: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const results = checks.map((check: { resource: string; action: 'create' | 'read' | 'update' | 'delete' | 'manage' }) => ({
        resource: check.resource,
        action: check.action,
        hasPermission: RoleService.hasPermission(roleObj, check.resource, check.action)
      }));

      return NextResponse.json({
        success: true,
        results,
        allGranted: results.every((r: { hasPermission: boolean }) => r.hasPermission)
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Permissions POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification des permissions' },
      { status: 500 }
    );
  }
}
