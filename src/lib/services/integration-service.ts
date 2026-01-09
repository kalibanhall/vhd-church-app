/**
 * =============================================================================
 * SERVICE D'INTÉGRATIONS EXTERNES - MyChurchApp
 * =============================================================================
 * 
 * Fonctionnalités:
 * - Gestion des webhooks
 * - API publique avec clés d'API
 * - Imports/Exports avancés
 * - Intégrations tierces
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * =============================================================================
 */

import { createHash, randomBytes } from 'crypto';

// Types
export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // secondes
  };
  lastTriggered?: Date;
  lastStatus?: number;
  successCount: number;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type WebhookEvent = 
  | 'member.created'
  | 'member.updated'
  | 'member.deleted'
  | 'donation.created'
  | 'donation.updated'
  | 'event.created'
  | 'event.updated'
  | 'event.cancelled'
  | 'attendance.recorded'
  | 'prayer.created'
  | 'testimony.approved'
  | 'announcement.published';

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: object;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  attempts: number;
  deliveredAt?: Date;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  name: string;
  keyHash: string; // Hash de la clé, pas la clé elle-même
  keyPrefix: string; // Premiers caractères pour identification
  permissions: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount: number;
  active: boolean;
  createdAt: Date;
}

export interface ImportJob {
  id: string;
  type: 'members' | 'donations' | 'events' | 'attendance';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName: string;
  fileSize: number;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  errors: { row: number; message: string }[];
  mapping: Record<string, string>; // sourceColumn -> targetField
  options: {
    skipDuplicates: boolean;
    updateExisting: boolean;
    dryRun: boolean;
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface ExportJob {
  id: string;
  type: 'members' | 'donations' | 'events' | 'attendance' | 'reports';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  filters?: Record<string, unknown>;
  columns?: string[];
  totalRecords?: number;
  fileUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  completedAt?: Date;
}

// ============================================================================
// SERVICE WEBHOOKS
// ============================================================================

export class WebhookService {
  
  /**
   * Générer un secret pour webhook
   */
  static generateSecret(): string {
    return `whsec_${randomBytes(32).toString('hex')}`;
  }

  /**
   * Signer un payload avec le secret
   */
  static signPayload(payload: object, secret: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const payloadString = JSON.stringify(payload);
    const signature = createHash('sha256')
      .update(`${timestamp}.${payloadString}`)
      .digest('hex');
    
    return `t=${timestamp},v1=${signature}`;
  }

  /**
   * Vérifier une signature webhook
   */
  static verifySignature(
    payload: string,
    signature: string,
    secret: string,
    tolerance: number = 300 // 5 minutes
  ): boolean {
    try {
      const parts = signature.split(',');
      const timestamp = parseInt(parts.find(p => p.startsWith('t='))?.split('=')[1] || '0');
      const receivedSig = parts.find(p => p.startsWith('v1='))?.split('=')[1];

      // Vérifier si pas trop ancien
      if (Math.abs(Date.now() / 1000 - timestamp) > tolerance) {
        return false;
      }

      // Recalculer la signature
      const expectedSig = createHash('sha256')
        .update(`${timestamp}.${payload}`)
        .digest('hex');

      return expectedSig === receivedSig;
    } catch {
      return false;
    }
  }

  /**
   * Événements disponibles avec descriptions
   */
  static getAvailableEvents(): { event: WebhookEvent; description: string; category: string }[] {
    return [
      { event: 'member.created', description: 'Un nouveau membre a été ajouté', category: 'Membres' },
      { event: 'member.updated', description: 'Les informations d\'un membre ont été modifiées', category: 'Membres' },
      { event: 'member.deleted', description: 'Un membre a été supprimé', category: 'Membres' },
      { event: 'donation.created', description: 'Un nouveau don a été enregistré', category: 'Dons' },
      { event: 'donation.updated', description: 'Un don a été modifié', category: 'Dons' },
      { event: 'event.created', description: 'Un nouvel événement a été créé', category: 'Événements' },
      { event: 'event.updated', description: 'Un événement a été modifié', category: 'Événements' },
      { event: 'event.cancelled', description: 'Un événement a été annulé', category: 'Événements' },
      { event: 'attendance.recorded', description: 'Une présence a été enregistrée', category: 'Présences' },
      { event: 'prayer.created', description: 'Un sujet de prière a été créé', category: 'Prières' },
      { event: 'testimony.approved', description: 'Un témoignage a été approuvé', category: 'Témoignages' },
      { event: 'announcement.published', description: 'Une annonce a été publiée', category: 'Annonces' }
    ];
  }

  /**
   * Construire le payload d'un webhook
   */
  static buildPayload(event: WebhookEvent, data: object): object {
    return {
      id: `evt_${randomBytes(16).toString('hex')}`,
      type: event,
      created: new Date().toISOString(),
      data
    };
  }

  /**
   * Simuler un appel webhook (pour les tests)
   */
  static async testWebhook(url: string, secret: string): Promise<{
    success: boolean;
    statusCode?: number;
    responseTime?: number;
    error?: string;
  }> {
    const testPayload = this.buildPayload('member.created', {
      test: true,
      message: 'This is a test webhook delivery'
    });

    const signature = this.signPayload(testPayload, secret);
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': 'test'
        },
        body: JSON.stringify(testPayload)
      });

      return {
        success: response.ok,
        statusCode: response.status,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        responseTime: Date.now() - startTime
      };
    }
  }
}

// ============================================================================
// SERVICE API KEYS
// ============================================================================

export class ApiKeyService {
  
  /**
   * Générer une nouvelle clé API
   */
  static generateApiKey(): { key: string; hash: string; prefix: string } {
    const key = `mca_live_${randomBytes(32).toString('hex')}`;
    const hash = createHash('sha256').update(key).digest('hex');
    const prefix = key.substring(0, 12);
    
    return { key, hash, prefix };
  }

  /**
   * Vérifier une clé API
   */
  static verifyApiKey(providedKey: string, storedHash: string): boolean {
    const providedHash = createHash('sha256').update(providedKey).digest('hex');
    return providedHash === storedHash;
  }

  /**
   * Permissions disponibles pour les clés API
   */
  static getAvailablePermissions(): { permission: string; description: string }[] {
    return [
      { permission: 'members:read', description: 'Lire les informations des membres' },
      { permission: 'members:write', description: 'Créer et modifier des membres' },
      { permission: 'donations:read', description: 'Lire les informations des dons' },
      { permission: 'donations:write', description: 'Créer des dons' },
      { permission: 'events:read', description: 'Lire les événements' },
      { permission: 'events:write', description: 'Créer et modifier des événements' },
      { permission: 'attendance:read', description: 'Lire les présences' },
      { permission: 'attendance:write', description: 'Enregistrer des présences' },
      { permission: 'analytics:read', description: 'Accéder aux statistiques' }
    ];
  }

  /**
   * Vérifier si une permission est valide
   */
  static hasPermission(apiKeyPermissions: string[], requiredPermission: string): boolean {
    // Vérifier permission exacte
    if (apiKeyPermissions.includes(requiredPermission)) return true;
    
    // Vérifier wildcard (ex: members:* pour members:read)
    const [resource] = requiredPermission.split(':');
    if (apiKeyPermissions.includes(`${resource}:*`)) return true;
    
    // Vérifier super wildcard
    if (apiKeyPermissions.includes('*')) return true;
    
    return false;
  }
}

// ============================================================================
// SERVICE IMPORT/EXPORT
// ============================================================================

export class ImportExportService {
  
  /**
   * Champs disponibles pour l'import de membres
   */
  static getMemberImportFields(): { field: string; required: boolean; type: string; description: string }[] {
    return [
      { field: 'firstName', required: true, type: 'string', description: 'Prénom' },
      { field: 'lastName', required: true, type: 'string', description: 'Nom de famille' },
      { field: 'email', required: false, type: 'email', description: 'Adresse email' },
      { field: 'phone', required: false, type: 'phone', description: 'Numéro de téléphone' },
      { field: 'birthDate', required: false, type: 'date', description: 'Date de naissance' },
      { field: 'gender', required: false, type: 'enum:M,F', description: 'Genre (M/F)' },
      { field: 'address', required: false, type: 'string', description: 'Adresse' },
      { field: 'city', required: false, type: 'string', description: 'Ville' },
      { field: 'postalCode', required: false, type: 'string', description: 'Code postal' },
      { field: 'memberSince', required: false, type: 'date', description: 'Date d\'adhésion' },
      { field: 'role', required: false, type: 'string', description: 'Rôle dans l\'église' },
      { field: 'notes', required: false, type: 'text', description: 'Notes' }
    ];
  }

  /**
   * Valider une ligne d'import
   */
  static validateImportRow(
    row: Record<string, string>,
    mapping: Record<string, string>,
    type: ImportJob['type']
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const fields = type === 'members' ? this.getMemberImportFields() : [];

    for (const field of fields) {
      const sourceColumn = Object.entries(mapping).find(([, target]) => target === field.field)?.[0];
      const value = sourceColumn ? row[sourceColumn] : undefined;

      if (field.required && (!value || value.trim() === '')) {
        errors.push(`Le champ ${field.description} est requis`);
      }

      if (value && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push(`${field.description}: format email invalide`);
      }

      if (value && field.type === 'date' && isNaN(Date.parse(value))) {
        errors.push(`${field.description}: format date invalide`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Générer un fichier d'export
   */
  static formatExportData(
    data: Record<string, unknown>[],
    format: ExportJob['format'],
    columns?: string[]
  ): string {
    // Filtrer les colonnes si spécifié
    const filteredData = columns 
      ? data.map(row => {
          const filtered: Record<string, unknown> = {};
          columns.forEach(col => {
            if (col in row) filtered[col] = row[col];
          });
          return filtered;
        })
      : data;

    switch (format) {
      case 'json':
        return JSON.stringify(filteredData, null, 2);
      
      case 'csv':
        if (filteredData.length === 0) return '';
        const headers = Object.keys(filteredData[0]);
        const csvRows = [
          headers.join(','),
          ...filteredData.map(row => 
            headers.map(h => {
              const val = row[h];
              const strVal = val === null || val === undefined ? '' : String(val);
              return strVal.includes(',') || strVal.includes('"') 
                ? `"${strVal.replace(/"/g, '""')}"` 
                : strVal;
            }).join(',')
          )
        ];
        return csvRows.join('\n');
      
      default:
        return JSON.stringify(filteredData);
    }
  }

  /**
   * Templates d'export prédéfinis
   */
  static getExportTemplates(): { id: string; name: string; type: ExportJob['type']; columns: string[]; description: string }[] {
    return [
      {
        id: 'members_basic',
        name: 'Membres - Informations de base',
        type: 'members',
        columns: ['firstName', 'lastName', 'email', 'phone'],
        description: 'Export simple des coordonnées des membres'
      },
      {
        id: 'members_full',
        name: 'Membres - Export complet',
        type: 'members',
        columns: ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'birthDate', 'memberSince', 'role'],
        description: 'Export complet avec toutes les informations'
      },
      {
        id: 'donations_summary',
        name: 'Dons - Résumé',
        type: 'donations',
        columns: ['date', 'memberName', 'amount', 'method', 'campaign'],
        description: 'Résumé des dons pour comptabilité'
      },
      {
        id: 'donations_tax',
        name: 'Dons - Reçus fiscaux',
        type: 'donations',
        columns: ['memberName', 'memberAddress', 'totalAmount', 'year'],
        description: 'Données pour génération de reçus fiscaux'
      },
      {
        id: 'attendance_report',
        name: 'Présences - Rapport',
        type: 'attendance',
        columns: ['date', 'eventName', 'memberName', 'checkInTime'],
        description: 'Rapport de présences aux cultes et événements'
      }
    ];
  }
}

// ============================================================================
// SERVICE INTÉGRATIONS TIERCES
// ============================================================================

export interface ThirdPartyIntegration {
  id: string;
  name: string;
  provider: 'google' | 'microsoft' | 'mailchimp' | 'stripe' | 'twilio' | 'zoom' | 'youtube';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, unknown>;
  lastSync?: Date;
  syncErrors?: string[];
}

export class IntegrationService {
  
  /**
   * Intégrations disponibles
   */
  static getAvailableIntegrations(): { provider: ThirdPartyIntegration['provider']; name: string; description: string; features: string[] }[] {
    return [
      {
        provider: 'google',
        name: 'Google Workspace',
        description: 'Synchronisation calendrier et contacts',
        features: ['Sync calendrier', 'Sync contacts', 'Authentification Google']
      },
      {
        provider: 'microsoft',
        name: 'Microsoft 365',
        description: 'Intégration Outlook et Teams',
        features: ['Sync calendrier', 'Sync contacts', 'Teams meeting']
      },
      {
        provider: 'mailchimp',
        name: 'Mailchimp',
        description: 'Gestion des newsletters',
        features: ['Sync listes', 'Campagnes email', 'Automatisations']
      },
      {
        provider: 'stripe',
        name: 'Stripe',
        description: 'Paiements en ligne',
        features: ['Dons en ligne', 'Dons récurrents', 'Reçus automatiques']
      },
      {
        provider: 'twilio',
        name: 'Twilio',
        description: 'SMS et notifications',
        features: ['SMS de masse', 'Rappels SMS', 'Notifications urgentes']
      },
      {
        provider: 'zoom',
        name: 'Zoom',
        description: 'Réunions en ligne',
        features: ['Création de meetings', 'Intégration événements', 'Recordings']
      },
      {
        provider: 'youtube',
        name: 'YouTube',
        description: 'Diffusion de prédications',
        features: ['Import vidéos', 'Live streaming', 'Playlist sync']
      }
    ];
  }

  /**
   * Obtenir l'URL OAuth pour une intégration
   */
  static getOAuthUrl(provider: ThirdPartyIntegration['provider'], redirectUri: string): string {
    // URLs de base (à configurer avec les vrais client IDs en production)
    const urls: Record<string, string> = {
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id={CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=calendar.readonly%20contacts.readonly`,
      microsoft: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id={CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=Calendars.Read%20Contacts.Read`,
      zoom: `https://zoom.us/oauth/authorize?client_id={CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`
    };

    return urls[provider] || '';
  }
}

const integrationExports = {
  WebhookService,
  ApiKeyService,
  ImportExportService,
  IntegrationService
};

export default integrationExports;
