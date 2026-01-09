/**
 * API Routes - Roles Management
 * 
 * GET  /api/admin/roles - Liste des rôles
 * POST /api/admin/roles - Créer un rôle
 */

import { NextRequest, NextResponse } from 'next/server';
import { RoleService } from '@/lib/services/admin-service';

// Stockage temporaire
let roles: any[] = [];
let roleIdCounter = 1;

// Initialiser avec les rôles par défaut
if (roles.length === 0) {
  const defaults = RoleService.getDefaultRoles();
  roles = defaults.map(role => ({
    ...role,
    id: `role_${roleIdCounter++}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSystem = searchParams.get('includeSystem') !== 'false';
    const name = searchParams.get('name');

    let filteredRoles = [...roles];

    if (!includeSystem) {
      filteredRoles = filteredRoles.filter(r => !r.isSystemRole);
    }

    if (name) {
      filteredRoles = filteredRoles.filter(r => 
        r.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredRoles,
      total: filteredRoles.length,
      stats: {
        system: roles.filter(r => r.isSystemRole).length,
        custom: roles.filter(r => !r.isSystemRole).length,
        default: roles.find(r => r.isDefault)?.name
      }
    });
  } catch (error) {
    console.error('[Roles GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des rôles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permissions, color, icon } = body;

    if (!name || !permissions || permissions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nom et permissions sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si le nom existe déjà
    if (roles.some(r => r.name.toLowerCase() === name.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: 'Un rôle avec ce nom existe déjà' },
        { status: 409 }
      );
    }

    const newRole = {
      id: `role_${roleIdCounter++}`,
      name,
      description: description || '',
      permissions,
      isDefault: false,
      isSystemRole: false,
      color: color || '#6b7280',
      icon: icon || '👤',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    roles.push(newRole);

    return NextResponse.json({
      success: true,
      message: 'Rôle créé avec succès',
      data: newRole
    }, { status: 201 });
  } catch (error) {
    console.error('[Roles POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du rôle' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { roleId, name, description, permissions, color, icon, isDefault } = body;

    const index = roles.findIndex(r => r.id === roleId);
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Rôle non trouvé' },
        { status: 404 }
      );
    }

    // Ne pas permettre la modification des rôles système critiques
    if (roles[index].isSystemRole && roles[index].name === 'Super Administrateur') {
      return NextResponse.json(
        { success: false, error: 'Ce rôle système ne peut pas être modifié' },
        { status: 403 }
      );
    }

    // Mettre à jour
    if (name !== undefined) roles[index].name = name;
    if (description !== undefined) roles[index].description = description;
    if (permissions !== undefined) roles[index].permissions = permissions;
    if (color !== undefined) roles[index].color = color;
    if (icon !== undefined) roles[index].icon = icon;
    
    // Si on définit ce rôle comme par défaut, retirer le flag des autres
    if (isDefault === true) {
      roles.forEach(r => r.isDefault = false);
      roles[index].isDefault = true;
    }

    roles[index].updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      message: 'Rôle mis à jour',
      data: roles[index]
    });
  } catch (error) {
    console.error('[Roles PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du rôle' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json(
        { success: false, error: 'roleId est requis' },
        { status: 400 }
      );
    }

    const index = roles.findIndex(r => r.id === roleId);
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Rôle non trouvé' },
        { status: 404 }
      );
    }

    if (roles[index].isSystemRole) {
      return NextResponse.json(
        { success: false, error: 'Les rôles système ne peuvent pas être supprimés' },
        { status: 403 }
      );
    }

    if (roles[index].isDefault) {
      return NextResponse.json(
        { success: false, error: 'Le rôle par défaut ne peut pas être supprimé' },
        { status: 403 }
      );
    }

    const deleted = roles.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Rôle supprimé',
      data: deleted
    });
  } catch (error) {
    console.error('[Roles DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
