/**
 * API Routes - API Keys Management
 * 
 * GET    /api/integrations/api-keys - Liste des clés API
 * POST   /api/integrations/api-keys - Créer une clé API
 * DELETE /api/integrations/api-keys - Révoquer une clé API
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiKeyService, ApiKey } from '@/lib/services/integration-service';

// Stockage temporaire
let apiKeys: ApiKey[] = [];
let keyIdCounter = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Obtenir les permissions disponibles
    if (action === 'permissions') {
      return NextResponse.json({
        success: true,
        data: ApiKeyService.getAvailablePermissions()
      });
    }

    // Liste des clés API (sans exposer les hash)
    const safeKeys = apiKeys.map(k => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.keyPrefix,
      permissions: k.permissions,
      rateLimit: k.rateLimit,
      expiresAt: k.expiresAt,
      lastUsedAt: k.lastUsedAt,
      usageCount: k.usageCount,
      active: k.active,
      createdAt: k.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: safeKeys,
      total: apiKeys.length,
      stats: {
        active: apiKeys.filter(k => k.active).length,
        expired: apiKeys.filter(k => k.expiresAt && new Date(k.expiresAt) < new Date()).length,
        totalUsage: apiKeys.reduce((acc, k) => acc + k.usageCount, 0)
      }
    });
  } catch (error) {
    console.error('[API Keys GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des clés API' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Vérifier une clé API
    if (action === 'verify') {
      const { key } = body;
      
      if (!key) {
        return NextResponse.json(
          { success: false, error: 'key est requise' },
          { status: 400 }
        );
      }

      // Trouver la clé par son préfixe
      const prefix = key.substring(0, 12);
      const apiKey = apiKeys.find(k => k.keyPrefix === prefix);

      if (!apiKey) {
        return NextResponse.json({
          success: false,
          valid: false,
          reason: 'Clé non trouvée'
        });
      }

      // Vérifier si active
      if (!apiKey.active) {
        return NextResponse.json({
          success: false,
          valid: false,
          reason: 'Clé désactivée'
        });
      }

      // Vérifier expiration
      if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
        return NextResponse.json({
          success: false,
          valid: false,
          reason: 'Clé expirée'
        });
      }

      // Vérifier le hash
      const isValid = ApiKeyService.verifyApiKey(key, apiKey.keyHash);
      
      if (isValid) {
        // Mettre à jour les stats d'utilisation
        apiKey.lastUsedAt = new Date();
        apiKey.usageCount++;
      }

      return NextResponse.json({
        success: true,
        valid: isValid,
        permissions: isValid ? apiKey.permissions : [],
        rateLimit: isValid ? apiKey.rateLimit : null
      });
    }

    // Créer une nouvelle clé API
    const { name, permissions, rateLimit, expiresInDays } = body;

    if (!name || !permissions || permissions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'name et permissions sont requis' },
        { status: 400 }
      );
    }

    // Valider les permissions
    const availablePermissions = ApiKeyService.getAvailablePermissions().map(p => p.permission);
    const allPermissions = [...availablePermissions, '*', 'members:*', 'donations:*', 'events:*', 'attendance:*', 'analytics:*'];
    const invalidPermissions = permissions.filter((p: string) => !allPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return NextResponse.json(
        { success: false, error: `Permissions invalides: ${invalidPermissions.join(', ')}` },
        { status: 400 }
      );
    }

    // Générer la clé
    const { key, hash, prefix } = ApiKeyService.generateApiKey();

    const newApiKey: ApiKey = {
      id: `key_${keyIdCounter++}`,
      name,
      keyHash: hash,
      keyPrefix: prefix,
      permissions,
      rateLimit: rateLimit || { requestsPerMinute: 60, requestsPerDay: 10000 },
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : undefined,
      usageCount: 0,
      active: true,
      createdAt: new Date()
    };

    apiKeys.push(newApiKey);

    return NextResponse.json({
      success: true,
      message: 'Clé API créée avec succès',
      data: {
        id: newApiKey.id,
        name: newApiKey.name,
        // La clé complète n'est montrée QU'UNE SEULE FOIS à la création
        key: key,
        keyPrefix: prefix,
        permissions: newApiKey.permissions,
        rateLimit: newApiKey.rateLimit,
        expiresAt: newApiKey.expiresAt,
        createdAt: newApiKey.createdAt
      },
      warning: 'Conservez cette clé en lieu sûr. Elle ne sera plus jamais affichée.'
    }, { status: 201 });
  } catch (error) {
    console.error('[API Keys POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'opération' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyId, name, permissions, rateLimit, active } = body;

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'keyId est requis' },
        { status: 400 }
      );
    }

    const index = apiKeys.findIndex(k => k.id === keyId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Clé API non trouvée' },
        { status: 404 }
      );
    }

    if (name !== undefined) apiKeys[index].name = name;
    if (permissions !== undefined) apiKeys[index].permissions = permissions;
    if (rateLimit !== undefined) apiKeys[index].rateLimit = rateLimit;
    if (active !== undefined) apiKeys[index].active = active;

    return NextResponse.json({
      success: true,
      message: 'Clé API mise à jour',
      data: {
        id: apiKeys[index].id,
        name: apiKeys[index].name,
        keyPrefix: apiKeys[index].keyPrefix,
        permissions: apiKeys[index].permissions,
        rateLimit: apiKeys[index].rateLimit,
        active: apiKeys[index].active
      }
    });
  } catch (error) {
    console.error('[API Keys PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'id est requis' },
        { status: 400 }
      );
    }

    const index = apiKeys.findIndex(k => k.id === keyId);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Clé API non trouvée' },
        { status: 404 }
      );
    }

    const deleted = apiKeys.splice(index, 1)[0];

    return NextResponse.json({
      success: true,
      message: 'Clé API révoquée',
      data: { id: deleted.id, name: deleted.name }
    });
  } catch (error) {
    console.error('[API Keys DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la révocation' },
      { status: 500 }
    );
  }
}
