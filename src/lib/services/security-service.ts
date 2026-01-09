/**
 * =============================================================================
 * SERVICE DE SÉCURITÉ AVANCÉE - MyChurchApp
 * =============================================================================
 * 
 * Fonctionnalités:
 * - Authentification à deux facteurs (2FA)
 * - Gestion des sessions
 * - Journaux d'audit
 * - Protection contre les attaques
 * - Détection d'anomalies
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * =============================================================================
 */

import crypto from 'crypto';

// Types
export interface TwoFactorAuth {
  userId: string;
  secret: string;
  isEnabled: boolean;
  method: '2fa_totp' | '2fa_sms' | '2fa_email';
  backupCodes: string[];
  usedBackupCodes: string[];
  enabledAt?: Date;
  lastUsed?: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: GeoLocation;
  createdAt: Date;
  lastActive: Date;
  expiresAt: Date;
  isActive: boolean;
  isTrusted: boolean;
}

export interface DeviceInfo {
  userAgent: string;
  browser?: string;
  os?: string;
  device?: string;
  fingerprint?: string;
}

export interface GeoLocation {
  country?: string;
  city?: string;
  region?: string;
  timezone?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'warning';
  timestamp: Date;
}

export type AuditAction = 
  | 'login'
  | 'logout'
  | 'login_failed'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verified'
  | 'password_changed'
  | 'password_reset'
  | 'profile_updated'
  | 'member_created'
  | 'member_updated'
  | 'member_deleted'
  | 'donation_created'
  | 'donation_updated'
  | 'event_created'
  | 'event_updated'
  | 'permission_granted'
  | 'permission_revoked'
  | 'data_exported'
  | 'settings_changed'
  | 'suspicious_activity';

export interface SecurityAlert {
  id: string;
  type: 'brute_force' | 'suspicious_login' | 'unusual_activity' | 'data_breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ipAddress: string;
  description: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
}

export interface LoginAttempt {
  email: string;
  ipAddress: string;
  timestamp: Date;
  success: boolean;
  reason?: string;
}

// ============================================================================
// SERVICE 2FA
// ============================================================================

export class TwoFactorService {
  private static readonly TOTP_DIGITS = 6;
  private static readonly TOTP_PERIOD = 30; // secondes
  private static readonly BACKUP_CODES_COUNT = 10;

  /**
   * Générer un secret TOTP
   */
  static generateSecret(): string {
    return crypto.randomBytes(20).toString('base64').replace(/[+/=]/g, '').substring(0, 32);
  }

  /**
   * Générer des codes de secours
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.substring(0, 4)}-${code.substring(4)}`);
    }
    return codes;
  }

  /**
   * Générer un code TOTP (simplifié - en production utiliser une vraie lib TOTP)
   */
  static generateTOTP(secret: string): string {
    const time = Math.floor(Date.now() / 1000 / this.TOTP_PERIOD);
    const hmac = crypto.createHmac('sha1', secret);
    hmac.update(Buffer.from(time.toString()));
    const hash = hmac.digest();
    const offset = hash[hash.length - 1] & 0xf;
    const code = ((hash[offset] & 0x7f) << 24 |
                  (hash[offset + 1] & 0xff) << 16 |
                  (hash[offset + 2] & 0xff) << 8 |
                  (hash[offset + 3] & 0xff)) % Math.pow(10, this.TOTP_DIGITS);
    return code.toString().padStart(this.TOTP_DIGITS, '0');
  }

  /**
   * Vérifier un code TOTP
   */
  static verifyTOTP(secret: string, code: string, window: number = 1): boolean {
    const time = Math.floor(Date.now() / 1000 / this.TOTP_PERIOD);
    
    for (let i = -window; i <= window; i++) {
      const testTime = time + i;
      const hmac = crypto.createHmac('sha1', secret);
      hmac.update(Buffer.from(testTime.toString()));
      const hash = hmac.digest();
      const offset = hash[hash.length - 1] & 0xf;
      const testCode = ((hash[offset] & 0x7f) << 24 |
                        (hash[offset + 1] & 0xff) << 16 |
                        (hash[offset + 2] & 0xff) << 8 |
                        (hash[offset + 3] & 0xff)) % Math.pow(10, this.TOTP_DIGITS);
      
      if (testCode.toString().padStart(this.TOTP_DIGITS, '0') === code) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Vérifier un code de secours
   */
  static verifyBackupCode(
    backupCodes: string[],
    usedCodes: string[],
    code: string
  ): boolean {
    const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const formattedCode = `${normalizedCode.substring(0, 4)}-${normalizedCode.substring(4)}`;
    
    return backupCodes.includes(formattedCode) && !usedCodes.includes(formattedCode);
  }

  /**
   * Générer l'URL pour QR code
   */
  static generateQRCodeURL(
    secret: string,
    email: string,
    issuer: string = 'MyChurchApp'
  ): string {
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedEmail = encodeURIComponent(email);
    return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&digits=${this.TOTP_DIGITS}&period=${this.TOTP_PERIOD}`;
  }
}

// ============================================================================
// SERVICE DE SESSIONS
// ============================================================================

export class SessionService {
  private static readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours
  private static readonly MAX_SESSIONS_PER_USER = 5;

  /**
   * Créer une nouvelle session
   */
  static createSession(
    userId: string,
    ipAddress: string,
    userAgent: string,
    deviceFingerprint?: string
  ): UserSession {
    const deviceInfo = this.parseUserAgent(userAgent);
    
    return {
      id: `sess_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`,
      userId,
      token: crypto.randomBytes(32).toString('hex'),
      deviceInfo: {
        ...deviceInfo,
        fingerprint: deviceFingerprint
      },
      ipAddress,
      createdAt: new Date(),
      lastActive: new Date(),
      expiresAt: new Date(Date.now() + this.SESSION_DURATION),
      isActive: true,
      isTrusted: false
    };
  }

  /**
   * Parser le User-Agent
   */
  static parseUserAgent(userAgent: string): DeviceInfo {
    // Parsing simplifié - en production utiliser une vraie lib
    const info: DeviceInfo = { userAgent };

    if (userAgent.includes('Chrome')) {
      info.browser = 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      info.browser = 'Firefox';
    } else if (userAgent.includes('Safari')) {
      info.browser = 'Safari';
    } else if (userAgent.includes('Edge')) {
      info.browser = 'Edge';
    }

    if (userAgent.includes('Windows')) {
      info.os = 'Windows';
    } else if (userAgent.includes('Mac')) {
      info.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      info.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      info.os = 'Android';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      info.os = 'iOS';
    }

    if (userAgent.includes('Mobile')) {
      info.device = 'Mobile';
    } else if (userAgent.includes('Tablet')) {
      info.device = 'Tablet';
    } else {
      info.device = 'Desktop';
    }

    return info;
  }

  /**
   * Vérifier si une session est valide
   */
  static isSessionValid(session: UserSession): boolean {
    if (!session.isActive) return false;
    if (new Date(session.expiresAt) < new Date()) return false;
    return true;
  }

  /**
   * Rafraîchir une session
   */
  static refreshSession(session: UserSession): UserSession {
    return {
      ...session,
      lastActive: new Date(),
      expiresAt: new Date(Date.now() + this.SESSION_DURATION)
    };
  }
}

// ============================================================================
// SERVICE D'AUDIT
// ============================================================================

export class AuditService {
  
  /**
   * Créer une entrée d'audit
   */
  static createAuditLog(
    action: AuditAction,
    resource: string,
    details: Record<string, any>,
    options: {
      userId?: string;
      userName?: string;
      resourceId?: string;
      ipAddress: string;
      userAgent?: string;
      status?: 'success' | 'failure' | 'warning';
    }
  ): AuditLog {
    return {
      id: `audit_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      userId: options.userId,
      userName: options.userName,
      action,
      resource,
      resourceId: options.resourceId,
      details,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      status: options.status || 'success',
      timestamp: new Date()
    };
  }

  /**
   * Obtenir la description d'une action
   */
  static getActionDescription(action: AuditAction): string {
    const descriptions: Record<AuditAction, string> = {
      login: 'Connexion réussie',
      logout: 'Déconnexion',
      login_failed: 'Tentative de connexion échouée',
      '2fa_enabled': 'Activation de l\'authentification à deux facteurs',
      '2fa_disabled': 'Désactivation de l\'authentification à deux facteurs',
      '2fa_verified': 'Vérification 2FA réussie',
      password_changed: 'Changement de mot de passe',
      password_reset: 'Réinitialisation du mot de passe',
      profile_updated: 'Mise à jour du profil',
      member_created: 'Création d\'un membre',
      member_updated: 'Modification d\'un membre',
      member_deleted: 'Suppression d\'un membre',
      donation_created: 'Enregistrement d\'un don',
      donation_updated: 'Modification d\'un don',
      event_created: 'Création d\'un événement',
      event_updated: 'Modification d\'un événement',
      permission_granted: 'Attribution de permissions',
      permission_revoked: 'Révocation de permissions',
      data_exported: 'Export de données',
      settings_changed: 'Modification des paramètres',
      suspicious_activity: 'Activité suspecte détectée'
    };
    return descriptions[action] || action;
  }

  /**
   * Obtenir la sévérité d'une action
   */
  static getActionSeverity(action: AuditAction): 'info' | 'warning' | 'critical' {
    const critical: AuditAction[] = [
      'member_deleted',
      'permission_granted',
      'permission_revoked',
      'data_exported',
      'suspicious_activity'
    ];
    
    const warning: AuditAction[] = [
      'login_failed',
      'password_changed',
      'password_reset',
      '2fa_disabled',
      'settings_changed'
    ];

    if (critical.includes(action)) return 'critical';
    if (warning.includes(action)) return 'warning';
    return 'info';
  }
}

// ============================================================================
// SERVICE DE PROTECTION
// ============================================================================

export class SecurityProtectionService {
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private static loginAttempts: Map<string, LoginAttempt[]> = new Map();

  /**
   * Enregistrer une tentative de connexion
   */
  static recordLoginAttempt(
    email: string,
    ipAddress: string,
    success: boolean,
    reason?: string
  ): void {
    const key = `${email}:${ipAddress}`;
    const attempts = this.loginAttempts.get(key) || [];
    
    attempts.push({
      email,
      ipAddress,
      timestamp: new Date(),
      success,
      reason
    });

    // Garder seulement les tentatives des 15 dernières minutes
    const cutoff = new Date(Date.now() - this.LOCKOUT_DURATION);
    const recentAttempts = attempts.filter(a => a.timestamp > cutoff);
    
    this.loginAttempts.set(key, recentAttempts);
  }

  /**
   * Vérifier si un compte est verrouillé
   */
  static isAccountLocked(email: string, ipAddress: string): {
    locked: boolean;
    attemptsRemaining: number;
    lockoutEndTime?: Date;
  } {
    const key = `${email}:${ipAddress}`;
    const attempts = this.loginAttempts.get(key) || [];
    
    const cutoff = new Date(Date.now() - this.LOCKOUT_DURATION);
    const recentFailedAttempts = attempts.filter(
      a => !a.success && a.timestamp > cutoff
    );

    if (recentFailedAttempts.length >= this.MAX_LOGIN_ATTEMPTS) {
      const lastAttempt = recentFailedAttempts[recentFailedAttempts.length - 1];
      return {
        locked: true,
        attemptsRemaining: 0,
        lockoutEndTime: new Date(lastAttempt.timestamp.getTime() + this.LOCKOUT_DURATION)
      };
    }

    return {
      locked: false,
      attemptsRemaining: this.MAX_LOGIN_ATTEMPTS - recentFailedAttempts.length
    };
  }

  /**
   * Détecter une activité suspecte
   */
  static detectSuspiciousActivity(
    userId: string,
    currentIP: string,
    currentLocation: GeoLocation | undefined,
    previousSessions: UserSession[]
  ): { suspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];

    // Vérifier les connexions depuis de nouvelles IP
    const knownIPs = new Set(previousSessions.map(s => s.ipAddress));
    if (!knownIPs.has(currentIP) && previousSessions.length > 0) {
      reasons.push('Connexion depuis une nouvelle adresse IP');
    }

    // Vérifier les connexions depuis de nouveaux pays
    if (currentLocation?.country) {
      const knownCountries = new Set(
        previousSessions
          .filter(s => s.location?.country)
          .map(s => s.location!.country)
      );
      if (!knownCountries.has(currentLocation.country) && knownCountries.size > 0) {
        reasons.push('Connexion depuis un nouveau pays');
      }
    }

    // Vérifier les connexions simultanées suspectes
    const activeSessions = previousSessions.filter(s => s.isActive);
    if (activeSessions.length >= 3) {
      reasons.push('Nombre élevé de sessions actives');
    }

    return {
      suspicious: reasons.length > 0,
      reasons
    };
  }

  /**
   * Valider la force du mot de passe
   */
  static validatePasswordStrength(password: string): {
    valid: boolean;
    score: number;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else suggestions.push('Le mot de passe doit contenir au moins 8 caractères');

    if (password.length >= 12) score += 1;

    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('Ajoutez des lettres minuscules');

    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('Ajoutez des lettres majuscules');

    if (/[0-9]/.test(password)) score += 1;
    else suggestions.push('Ajoutez des chiffres');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else suggestions.push('Ajoutez des caractères spéciaux');

    // Vérifier les patterns courants
    const commonPatterns = ['123456', 'password', 'qwerty', 'abc123'];
    if (commonPatterns.some(p => password.toLowerCase().includes(p))) {
      score -= 2;
      suggestions.push('Évitez les séquences communes');
    }

    return {
      valid: score >= 4,
      score: Math.max(0, Math.min(6, score)),
      suggestions
    };
  }
}

const securityExports = {
  TwoFactorService,
  SessionService,
  AuditService,
  SecurityProtectionService
};

export default securityExports;
