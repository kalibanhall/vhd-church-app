/**
 * =============================================================================
 * SERVICE D'ADMINISTRATION AVANCÉE - MyChurchApp
 * =============================================================================
 * 
 * Fonctionnalités:
 * - Gestion des rôles et permissions personnalisés
 * - Paramètres de l'église
 * - Configuration des modules
 * - Personnalisation de l'interface
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * =============================================================================
 */

// Types
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault: boolean;
  isSystemRole: boolean;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'manage')[];
}

export interface ChurchSettings {
  general: GeneralSettings;
  contact: ContactSettings;
  worship: WorshipSettings;
  modules: ModuleSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface GeneralSettings {
  churchName: string;
  denomination?: string;
  foundedYear?: number;
  timezone: string;
  language: string;
  currency: string;
  fiscalYearStart: number; // Mois (1-12)
  logoUrl?: string;
  faviconUrl?: string;
}

export interface ContactSettings {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  email: string;
  website?: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
}

export interface WorshipSettings {
  services: ServiceSchedule[];
  defaultServiceDuration: number; // minutes
  allowOnlineAttendance: boolean;
  streamingUrl?: string;
}

export interface ServiceSchedule {
  id: string;
  name: string;
  dayOfWeek: number; // 0=Dimanche
  startTime: string; // HH:MM
  endTime: string;
  isDefault: boolean;
}

export interface ModuleSettings {
  facialRecognition: {
    enabled: boolean;
    requireConsent: boolean;
    retentionDays: number;
  };
  donations: {
    enabled: boolean;
    allowRecurring: boolean;
    allowAnonymous: boolean;
    minimumAmount: number;
    taxReceiptsEnabled: boolean;
  };
  events: {
    enabled: boolean;
    requireRegistration: boolean;
    allowWaitlist: boolean;
    maxCapacity?: number;
  };
  messaging: {
    enabled: boolean;
    allowDirectMessages: boolean;
    allowGroupChats: boolean;
    maxGroupSize: number;
  };
  prayers: {
    enabled: boolean;
    allowPublic: boolean;
    moderationRequired: boolean;
  };
  testimonies: {
    enabled: boolean;
    requireApproval: boolean;
  };
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  customCSS?: string;
}

export interface NotificationSettings {
  emailNotifications: {
    enabled: boolean;
    welcomeEmail: boolean;
    birthdayWishes: boolean;
    eventReminders: boolean;
    donationReceipts: boolean;
    weeklyDigest: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    newEvents: boolean;
    prayerRequests: boolean;
    announcements: boolean;
    messages: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    urgentOnly: boolean;
  };
}

export interface PrivacySettings {
  memberDirectoryPublic: boolean;
  showBirthdays: boolean;
  showAnniversaries: boolean;
  allowMemberSearch: boolean;
  dataRetentionYears: number;
  gdprCompliant: boolean;
}

// ============================================================================
// SERVICE DE RÔLES
// ============================================================================

export class RoleService {
  
  /**
   * Rôles système par défaut
   */
  static getDefaultRoles(): Omit<Role, 'id' | 'createdAt' | 'updatedAt'>[] {
    return [
      {
        name: 'Super Administrateur',
        description: 'Accès complet à toutes les fonctionnalités',
        permissions: [
          { id: 'all', resource: '*', actions: ['create', 'read', 'update', 'delete', 'manage'] }
        ],
        isDefault: false,
        isSystemRole: true,
        color: '#ef4444',
        icon: '👑'
      },
      {
        name: 'Administrateur',
        description: 'Gestion des membres, événements et paramètres',
        permissions: [
          { id: 'members', resource: 'members', actions: ['create', 'read', 'update', 'delete'] },
          { id: 'events', resource: 'events', actions: ['create', 'read', 'update', 'delete'] },
          { id: 'donations', resource: 'donations', actions: ['read', 'update'] },
          { id: 'settings', resource: 'settings', actions: ['read', 'update'] },
          { id: 'reports', resource: 'reports', actions: ['read'] }
        ],
        isDefault: false,
        isSystemRole: true,
        color: '#f59e0b',
        icon: '⚙️'
      },
      {
        name: 'Pasteur',
        description: 'Accès pastoral et spirituel',
        permissions: [
          { id: 'members', resource: 'members', actions: ['read', 'update'] },
          { id: 'prayers', resource: 'prayers', actions: ['read', 'update'] },
          { id: 'testimonies', resource: 'testimonies', actions: ['read', 'update'] },
          { id: 'sermons', resource: 'sermons', actions: ['create', 'read', 'update', 'delete'] },
          { id: 'events', resource: 'events', actions: ['create', 'read', 'update'] },
          { id: 'announcements', resource: 'announcements', actions: ['create', 'read', 'update', 'delete'] }
        ],
        isDefault: false,
        isSystemRole: true,
        color: '#8b5cf6',
        icon: '✝️'
      },
      {
        name: 'Leader',
        description: 'Responsable de ministère ou petit groupe',
        permissions: [
          { id: 'members', resource: 'members', actions: ['read'] },
          { id: 'events', resource: 'events', actions: ['create', 'read', 'update'] },
          { id: 'attendance', resource: 'attendance', actions: ['create', 'read'] },
          { id: 'messages', resource: 'messages', actions: ['create', 'read'] }
        ],
        isDefault: false,
        isSystemRole: true,
        color: '#3b82f6',
        icon: '🌟'
      },
      {
        name: 'Membre',
        description: 'Membre actif de l\'église',
        permissions: [
          { id: 'profile', resource: 'profile', actions: ['read', 'update'] },
          { id: 'events', resource: 'events', actions: ['read'] },
          { id: 'donations', resource: 'donations', actions: ['create', 'read'] },
          { id: 'prayers', resource: 'prayers', actions: ['create', 'read'] },
          { id: 'testimonies', resource: 'testimonies', actions: ['create', 'read'] },
          { id: 'messages', resource: 'messages', actions: ['create', 'read'] }
        ],
        isDefault: true,
        isSystemRole: true,
        color: '#10b981',
        icon: '👤'
      },
      {
        name: 'Visiteur',
        description: 'Accès limité en lecture',
        permissions: [
          { id: 'events', resource: 'events', actions: ['read'] },
          { id: 'sermons', resource: 'sermons', actions: ['read'] }
        ],
        isDefault: false,
        isSystemRole: true,
        color: '#6b7280',
        icon: '👁️'
      }
    ];
  }

  /**
   * Vérifier si un rôle a une permission
   */
  static hasPermission(
    role: Role,
    resource: string,
    action: 'create' | 'read' | 'update' | 'delete' | 'manage'
  ): boolean {
    for (const permission of role.permissions) {
      // Wildcard pour toutes les ressources
      if (permission.resource === '*' && permission.actions.includes('manage')) {
        return true;
      }

      // Permission spécifique
      if (permission.resource === resource && permission.actions.includes(action)) {
        return true;
      }

      // Manage implique toutes les actions
      if (permission.resource === resource && permission.actions.includes('manage')) {
        return true;
      }
    }
    return false;
  }

  /**
   * Fusionner les permissions de plusieurs rôles
   */
  static mergePermissions(roles: Role[]): Permission[] {
    const permissionMap = new Map<string, Set<string>>();

    for (const role of roles) {
      for (const permission of role.permissions) {
        const existing = permissionMap.get(permission.resource) || new Set();
        permission.actions.forEach(a => existing.add(a));
        permissionMap.set(permission.resource, existing);
      }
    }

    return Array.from(permissionMap.entries()).map(([resource, actions]) => ({
      id: resource,
      resource,
      actions: Array.from(actions) as Permission['actions']
    }));
  }
}

// ============================================================================
// SERVICE DE PARAMÈTRES
// ============================================================================

export class SettingsService {
  
  /**
   * Paramètres par défaut
   */
  static getDefaultSettings(): ChurchSettings {
    return {
      general: {
        churchName: 'Mon Église',
        timezone: 'Africa/Kinshasa',
        language: 'fr',
        currency: 'CDF',
        fiscalYearStart: 1
      },
      contact: {
        address: '',
        city: '',
        postalCode: '',
        country: 'RD Congo',
        email: '',
        socialMedia: {}
      },
      worship: {
        services: [
          {
            id: 'default_sunday',
            name: 'Culte du dimanche',
            dayOfWeek: 0,
            startTime: '10:00',
            endTime: '12:00',
            isDefault: true
          }
        ],
        defaultServiceDuration: 120,
        allowOnlineAttendance: true
      },
      modules: {
        facialRecognition: {
          enabled: true,
          requireConsent: true,
          retentionDays: 365
        },
        donations: {
          enabled: true,
          allowRecurring: true,
          allowAnonymous: true,
          minimumAmount: 1,
          taxReceiptsEnabled: true
        },
        events: {
          enabled: true,
          requireRegistration: false,
          allowWaitlist: true
        },
        messaging: {
          enabled: true,
          allowDirectMessages: true,
          allowGroupChats: true,
          maxGroupSize: 50
        },
        prayers: {
          enabled: true,
          allowPublic: true,
          moderationRequired: false
        },
        testimonies: {
          enabled: true,
          requireApproval: true
        }
      },
      appearance: {
        theme: 'light',
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        accentColor: '#f59e0b',
        fontFamily: 'Inter',
        borderRadius: 'medium'
      },
      notifications: {
        emailNotifications: {
          enabled: true,
          welcomeEmail: true,
          birthdayWishes: true,
          eventReminders: true,
          donationReceipts: true,
          weeklyDigest: false
        },
        pushNotifications: {
          enabled: true,
          newEvents: true,
          prayerRequests: true,
          announcements: true,
          messages: true
        },
        smsNotifications: {
          enabled: false,
          urgentOnly: true
        }
      },
      privacy: {
        memberDirectoryPublic: false,
        showBirthdays: true,
        showAnniversaries: true,
        allowMemberSearch: true,
        dataRetentionYears: 7,
        gdprCompliant: true
      }
    };
  }

  /**
   * Valider les paramètres
   */
  static validateSettings(settings: Partial<ChurchSettings>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (settings.general) {
      if (!settings.general.churchName || settings.general.churchName.length < 2) {
        errors.push('Le nom de l\'église est requis (minimum 2 caractères)');
      }
    }

    if (settings.contact) {
      if (settings.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contact.email)) {
        errors.push('L\'adresse email n\'est pas valide');
      }
    }

    if (settings.modules?.donations) {
      if (settings.modules.donations.minimumAmount < 0) {
        errors.push('Le montant minimum de don ne peut pas être négatif');
      }
    }

    if (settings.appearance) {
      if (settings.appearance.primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(settings.appearance.primaryColor)) {
        errors.push('La couleur principale n\'est pas valide (format: #RRGGBB)');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Générer les variables CSS depuis les paramètres d'apparence
   */
  static generateCSSVariables(appearance: AppearanceSettings): string {
    const borderRadiusValues = {
      none: '0',
      small: '0.25rem',
      medium: '0.5rem',
      large: '1rem'
    };

    return `
      :root {
        --color-primary: ${appearance.primaryColor};
        --color-secondary: ${appearance.secondaryColor};
        --color-accent: ${appearance.accentColor};
        --font-family: ${appearance.fontFamily}, sans-serif;
        --border-radius: ${borderRadiusValues[appearance.borderRadius]};
      }
    `;
  }
}

const adminExports = {
  RoleService,
  SettingsService
};

export default adminExports;
