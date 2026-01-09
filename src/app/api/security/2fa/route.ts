/**
 * API Routes - Two-Factor Authentication
 * 
 * GET  /api/security/2fa - Obtenir le statut 2FA
 * POST /api/security/2fa - Activer/Désactiver 2FA
 */

import { NextRequest, NextResponse } from 'next/server';
import { TwoFactorService } from '@/lib/services/security-service';

// Stockage temporaire
const twoFactorConfigs: Map<string, any> = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId est requis' },
        { status: 400 }
      );
    }

    const config = twoFactorConfigs.get(userId);

    if (!config) {
      return NextResponse.json({
        success: true,
        data: {
          isEnabled: false,
          method: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        isEnabled: config.isEnabled,
        method: config.method,
        enabledAt: config.enabledAt,
        lastUsed: config.lastUsed,
        backupCodesRemaining: config.backupCodes.length - config.usedBackupCodes.length
      }
    });
  } catch (error) {
    console.error('[2FA GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du statut 2FA' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, method, code } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'userId et action sont requis' },
        { status: 400 }
      );
    }

    if (action === 'setup') {
      // Générer une nouvelle configuration 2FA
      const secret = TwoFactorService.generateSecret();
      const backupCodes = TwoFactorService.generateBackupCodes();

      const config = {
        userId,
        secret,
        isEnabled: false, // Pas encore activé
        method: method || '2fa_totp',
        backupCodes,
        usedBackupCodes: [],
        setupAt: new Date().toISOString()
      };

      twoFactorConfigs.set(userId, config);

      // Générer l'URL pour le QR code (ne pas exposer le secret en production)
      const qrUrl = TwoFactorService.generateQRCodeURL(
        secret,
        `user_${userId}@mychurchapp.com`
      );

      return NextResponse.json({
        success: true,
        message: 'Configuration 2FA initialisée',
        data: {
          secret, // En production, ne jamais exposer directement
          qrUrl,
          backupCodes
        }
      });
    }

    if (action === 'enable') {
      const config = twoFactorConfigs.get(userId);
      
      if (!config) {
        return NextResponse.json(
          { success: false, error: 'Veuillez d\'abord initialiser la configuration 2FA' },
          { status: 400 }
        );
      }

      if (!code) {
        return NextResponse.json(
          { success: false, error: 'Code de vérification requis' },
          { status: 400 }
        );
      }

      // Vérifier le code
      const isValid = TwoFactorService.verifyTOTP(config.secret, code);
      
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Code invalide' },
          { status: 400 }
        );
      }

      config.isEnabled = true;
      config.enabledAt = new Date().toISOString();
      twoFactorConfigs.set(userId, config);

      return NextResponse.json({
        success: true,
        message: '2FA activé avec succès'
      });
    }

    if (action === 'disable') {
      const config = twoFactorConfigs.get(userId);
      
      if (!config || !config.isEnabled) {
        return NextResponse.json(
          { success: false, error: '2FA n\'est pas activé' },
          { status: 400 }
        );
      }

      if (!code) {
        return NextResponse.json(
          { success: false, error: 'Code de vérification requis pour désactiver' },
          { status: 400 }
        );
      }

      // Vérifier le code ou le code de secours
      const isTOTPValid = TwoFactorService.verifyTOTP(config.secret, code);
      const isBackupValid = TwoFactorService.verifyBackupCode(
        config.backupCodes,
        config.usedBackupCodes,
        code
      );

      if (!isTOTPValid && !isBackupValid) {
        return NextResponse.json(
          { success: false, error: 'Code invalide' },
          { status: 400 }
        );
      }

      twoFactorConfigs.delete(userId);

      return NextResponse.json({
        success: true,
        message: '2FA désactivé avec succès'
      });
    }

    if (action === 'verify') {
      const config = twoFactorConfigs.get(userId);
      
      if (!config || !config.isEnabled) {
        return NextResponse.json(
          { success: false, error: '2FA n\'est pas activé' },
          { status: 400 }
        );
      }

      if (!code) {
        return NextResponse.json(
          { success: false, error: 'Code requis' },
          { status: 400 }
        );
      }

      // Vérifier le code TOTP
      let isValid = TwoFactorService.verifyTOTP(config.secret, code);
      let usedBackup = false;

      // Si le code TOTP n'est pas valide, essayer les codes de secours
      if (!isValid) {
        isValid = TwoFactorService.verifyBackupCode(
          config.backupCodes,
          config.usedBackupCodes,
          code
        );
        
        if (isValid) {
          usedBackup = true;
          config.usedBackupCodes.push(code.toUpperCase());
          twoFactorConfigs.set(userId, config);
        }
      }

      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Code invalide' },
          { status: 400 }
        );
      }

      config.lastUsed = new Date().toISOString();
      twoFactorConfigs.set(userId, config);

      return NextResponse.json({
        success: true,
        message: 'Vérification réussie',
        data: {
          usedBackupCode: usedBackup,
          backupCodesRemaining: usedBackup 
            ? config.backupCodes.length - config.usedBackupCodes.length 
            : undefined
        }
      });
    }

    if (action === 'regenerate_backup') {
      const config = twoFactorConfigs.get(userId);
      
      if (!config || !config.isEnabled) {
        return NextResponse.json(
          { success: false, error: '2FA n\'est pas activé' },
          { status: 400 }
        );
      }

      const newBackupCodes = TwoFactorService.generateBackupCodes();
      config.backupCodes = newBackupCodes;
      config.usedBackupCodes = [];
      twoFactorConfigs.set(userId, config);

      return NextResponse.json({
        success: true,
        message: 'Codes de secours régénérés',
        data: {
          backupCodes: newBackupCodes
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[2FA POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'opération 2FA' },
      { status: 500 }
    );
  }
}
