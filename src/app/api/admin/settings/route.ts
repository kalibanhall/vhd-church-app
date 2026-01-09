/**
 * API Routes - Church Settings Management
 * 
 * GET   /api/admin/settings - Récupérer les paramètres
 * PATCH /api/admin/settings - Mettre à jour les paramètres
 * POST  /api/admin/settings/reset - Réinitialiser les paramètres
 */

import { NextRequest, NextResponse } from 'next/server';
import { SettingsService, ChurchSettings } from '@/lib/services/admin-service';

// Stockage des paramètres de l'église
let churchSettings: ChurchSettings | null = null;

// Initialiser avec les paramètres par défaut
function getSettings(): ChurchSettings {
  if (!churchSettings) {
    churchSettings = SettingsService.getDefaultSettings();
  }
  return churchSettings;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    const settings = getSettings();

    // Si une section spécifique est demandée
    if (section) {
      const validSections = ['general', 'contact', 'worship', 'modules', 'appearance', 'notifications', 'privacy'];
      
      if (!validSections.includes(section)) {
        return NextResponse.json(
          { success: false, error: 'Section invalide' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        section,
        data: settings[section as keyof ChurchSettings]
      });
    }

    // Retourner tous les paramètres
    return NextResponse.json({
      success: true,
      data: settings,
      cssVariables: SettingsService.generateCSSVariables(settings.appearance),
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Settings GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, settings: newSettings } = body;

    if (!section || !newSettings) {
      return NextResponse.json(
        { success: false, error: 'Section et settings sont requis' },
        { status: 400 }
      );
    }

    const currentSettings = getSettings();

    // Valider les nouveaux paramètres
    const validationResult = SettingsService.validateSettings({ [section]: newSettings });
    if (!validationResult.valid) {
      return NextResponse.json(
        { success: false, errors: validationResult.errors },
        { status: 400 }
      );
    }

    // Mettre à jour la section spécifique
    switch (section) {
      case 'general':
        churchSettings = {
          ...currentSettings,
          general: { ...currentSettings.general, ...newSettings }
        };
        break;
      case 'contact':
        churchSettings = {
          ...currentSettings,
          contact: { ...currentSettings.contact, ...newSettings }
        };
        break;
      case 'worship':
        churchSettings = {
          ...currentSettings,
          worship: { ...currentSettings.worship, ...newSettings }
        };
        break;
      case 'modules':
        churchSettings = {
          ...currentSettings,
          modules: { ...currentSettings.modules, ...newSettings }
        };
        break;
      case 'appearance':
        churchSettings = {
          ...currentSettings,
          appearance: { ...currentSettings.appearance, ...newSettings }
        };
        break;
      case 'notifications':
        churchSettings = {
          ...currentSettings,
          notifications: { ...currentSettings.notifications, ...newSettings }
        };
        break;
      case 'privacy':
        churchSettings = {
          ...currentSettings,
          privacy: { ...currentSettings.privacy, ...newSettings }
        };
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Section invalide' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour',
      data: churchSettings,
      cssVariables: SettingsService.generateCSSVariables(churchSettings.appearance)
    });
  } catch (error) {
    console.error('[Settings PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'reset') {
      // Réinitialiser tous les paramètres
      churchSettings = SettingsService.getDefaultSettings();

      return NextResponse.json({
        success: true,
        message: 'Paramètres réinitialisés aux valeurs par défaut',
        data: churchSettings
      });
    }

    if (action === 'export') {
      // Exporter les paramètres
      const settings = getSettings();
      
      return NextResponse.json({
        success: true,
        data: {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          settings
        }
      });
    }

    if (action === 'import') {
      // Importer des paramètres
      const body = await request.json();
      const { settings: importedSettings } = body;

      if (!importedSettings) {
        return NextResponse.json(
          { success: false, error: 'Paramètres à importer requis' },
          { status: 400 }
        );
      }

      // Valider les paramètres importés
      const validationResult = SettingsService.validateSettings(importedSettings);
      if (!validationResult.valid) {
        return NextResponse.json(
          { success: false, errors: validationResult.errors },
          { status: 400 }
        );
      }

      // Fusionner avec les paramètres par défaut pour garantir la structure
      const defaults = SettingsService.getDefaultSettings();
      churchSettings = {
        general: { ...defaults.general, ...importedSettings.general },
        contact: { ...defaults.contact, ...importedSettings.contact },
        worship: { ...defaults.worship, ...importedSettings.worship },
        modules: { ...defaults.modules, ...importedSettings.modules },
        appearance: { ...defaults.appearance, ...importedSettings.appearance },
        notifications: { ...defaults.notifications, ...importedSettings.notifications },
        privacy: { ...defaults.privacy, ...importedSettings.privacy }
      };

      return NextResponse.json({
        success: true,
        message: 'Paramètres importés avec succès',
        data: churchSettings
      });
    }

    if (action === 'validate') {
      // Valider des paramètres sans les appliquer
      const body = await request.json();
      const result = SettingsService.validateSettings(body);

      return NextResponse.json({
        success: result.valid,
        valid: result.valid,
        errors: result.errors
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Settings POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'opération' },
      { status: 500 }
    );
  }
}
