/**
 * ============================================================================
 * SERVICE D'AUTHENTIFICATION À DEUX FACTEURS (2FA) - MyChurchApp
 * ============================================================================
 * Sécurité renforcée avec TOTP et codes de récupération
 * 
 * Fonctionnalités:
 * - TOTP (Time-based One-Time Password)
 * - Codes de récupération
 * - Envoi par Email/SMS
 * - Logs d'audit
 * - Détection d'activités suspectes
 * - Gestion des sessions
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * ============================================================================
 */

import { EmailService, SMSService } from './notification-service';

// Types
export interface TwoFactorConfig {
  userId: string;
  secret: string;
  enabled: boolean;
  method: '2fa_app' | '2fa_email' | '2fa_sms';
  backupCodes: string[];
  usedBackupCodes: string[];
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityAuditLog {
  id: string;
  userId: string;
  action: SecurityAction;
  ipAddress: string;
  userAgent: string;
  location?: string;
  success: boolean;
  details?: string;
  timestamp: Date;
}

export type SecurityAction = 
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_change'
  | 'password_reset'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verified'
  | '2fa_failed'
  | 'backup_code_used'
  | 'suspicious_activity'
  | 'session_revoked'
  | 'profile_updated'
  | 'role_changed';

export interface SessionInfo {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  location?: string;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
  is2FAVerified: boolean;
}

export interface SuspiciousActivityReport {
  userId: string;
  type: 'multiple_failed_logins' | 'unusual_location' | 'unusual_time' | 'brute_force' | 'session_hijack';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  timestamp: Date;
  blocked: boolean;
}

// ============================================================================
// TOTP (Time-based One-Time Password) - Implémentation RFC 6238
// ============================================================================

export class TOTPService {
  private static readonly DIGITS = 6;
  private static readonly PERIOD = 30; // secondes
  private static readonly ALGORITHM = 'SHA-1';

  /**
   * Générer une clé secrète Base32
   */
  static generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    const array = new Uint8Array(20);
    crypto.getRandomValues(array);
    for (let i = 0; i < 20; i++) {
      secret += chars[array[i] % 32];
    }
    return secret;
  }

  /**
   * Convertir Base32 en bytes
   */
  private static base32ToBytes(base32: string): Uint8Array {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (const char of base32.toUpperCase()) {
      const val = chars.indexOf(char);
      if (val === -1) continue;
      bits += val.toString(2).padStart(5, '0');
    }
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
    }
    return bytes;
  }

  /**
   * HMAC-SHA1
   */
  private static async hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
    // Créer des ArrayBuffers propres pour éviter les problèmes de type avec SharedArrayBuffer
    const keyBuffer = new ArrayBuffer(key.length);
    new Uint8Array(keyBuffer).set(key);
    
    const messageArrayBuffer = new ArrayBuffer(message.length);
    new Uint8Array(messageArrayBuffer).set(message);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageArrayBuffer);
    return new Uint8Array(signature);
  }

  /**
   * Générer un code TOTP
   */
  static async generateCode(secret: string, timestamp?: number): Promise<string> {
    const time = timestamp || Math.floor(Date.now() / 1000);
    const counter = Math.floor(time / this.PERIOD);
    
    // Convertir le compteur en 8 bytes big-endian
    const counterBytes = new Uint8Array(8);
    let temp = counter;
    for (let i = 7; i >= 0; i--) {
      counterBytes[i] = temp & 0xff;
      temp = Math.floor(temp / 256);
    }

    const key = this.base32ToBytes(secret);
    const hmac = await this.hmacSha1(key, counterBytes);

    // Dynamic truncation
    const offset = hmac[19] & 0x0f;
    const code = (
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)
    ) % Math.pow(10, this.DIGITS);

    return code.toString().padStart(this.DIGITS, '0');
  }

  /**
   * Vérifier un code TOTP (avec fenêtre de tolérance)
   */
  static async verifyCode(secret: string, code: string, window: number = 1): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = -window; i <= window; i++) {
      const timestamp = now + (i * this.PERIOD);
      const expectedCode = await this.generateCode(secret, timestamp);
      if (code === expectedCode) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Générer l'URL pour l'application authenticator (QR code)
   */
  static generateAuthenticatorURL(
    secret: string,
    accountName: string,
    issuer: string = 'MyChurchApp'
  ): string {
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedAccount = encodeURIComponent(accountName);
    return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=${this.DIGITS}&period=${this.PERIOD}`;
  }

  /**
   * Générer un QR code en SVG
   */
  static generateQRCodeSVG(data: string, size: number = 200): string {
    // Implémentation simplifiée - en production, utiliser une lib QR
    // Ceci génère un placeholder
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="50%" font-family="monospace" font-size="10" text-anchor="middle" fill="#333">
          Scannez avec votre app
        </text>
        <text x="50%" y="60%" font-family="monospace" font-size="8" text-anchor="middle" fill="#666">
          Authenticator
        </text>
      </svg>
    `;
  }
}

// ============================================================================
// CODES DE RÉCUPÉRATION
// ============================================================================

export class BackupCodesService {
  private static readonly CODE_LENGTH = 8;
  private static readonly CODE_COUNT = 10;

  /**
   * Générer des codes de récupération
   */
  static generateCodes(): string[] {
    const codes: string[] = [];
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 pour éviter confusion
    
    for (let i = 0; i < this.CODE_COUNT; i++) {
      let code = '';
      const array = new Uint8Array(this.CODE_LENGTH);
      crypto.getRandomValues(array);
      for (let j = 0; j < this.CODE_LENGTH; j++) {
        code += chars[array[j] % chars.length];
      }
      // Formater en XXXX-XXXX
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    
    return codes;
  }

  /**
   * Hasher un code de récupération
   */
  static async hashCode(code: string): Promise<string> {
    const normalizedCode = code.replace(/-/g, '').toUpperCase();
    const encoder = new TextEncoder();
    const data = encoder.encode(normalizedCode);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Vérifier un code de récupération
   */
  static async verifyCode(code: string, hashedCodes: string[]): Promise<{ valid: boolean; index: number }> {
    const codeHash = await this.hashCode(code);
    const index = hashedCodes.indexOf(codeHash);
    return { valid: index !== -1, index };
  }
}

// ============================================================================
// SERVICE D'AUDIT DE SÉCURITÉ
// ============================================================================

export class SecurityAuditService {
  private static instance: SecurityAuditService;
  private logs: SecurityAuditLog[] = [];

  private constructor() {}

  static getInstance(): SecurityAuditService {
    if (!SecurityAuditService.instance) {
      SecurityAuditService.instance = new SecurityAuditService();
    }
    return SecurityAuditService.instance;
  }

  /**
   * Enregistrer une action de sécurité
   */
  async logAction(data: {
    userId: string;
    action: SecurityAction;
    ipAddress: string;
    userAgent: string;
    success: boolean;
    details?: string;
  }): Promise<SecurityAuditLog> {
    const log: SecurityAuditLog = {
      id: crypto.randomUUID(),
      userId: data.userId,
      action: data.action,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      location: await this.getLocationFromIP(data.ipAddress),
      success: data.success,
      details: data.details,
      timestamp: new Date(),
    };

    this.logs.push(log);

    // En production: sauvegarder en base de données
    // await this.saveToDatabase(log);

    // Vérifier les activités suspectes
    await this.checkSuspiciousActivity(data.userId, data.action, data.ipAddress);

    return log;
  }

  /**
   * Obtenir les logs d'un utilisateur
   */
  async getUserLogs(userId: string, options?: {
    action?: SecurityAction;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<SecurityAuditLog[]> {
    let filtered = this.logs.filter(log => log.userId === userId);

    if (options?.action) {
      filtered = filtered.filter(log => log.action === options.action);
    }
    if (options?.startDate) {
      filtered = filtered.filter(log => log.timestamp >= options.startDate!);
    }
    if (options?.endDate) {
      filtered = filtered.filter(log => log.timestamp <= options.endDate!);
    }

    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Obtenir la localisation à partir de l'IP
   */
  private async getLocationFromIP(ip: string): Promise<string | undefined> {
    try {
      // En production: utiliser un service de géolocalisation IP
      // Exemple: ip-api.com, ipstack, MaxMind GeoIP2
      if (ip === '127.0.0.1' || ip === '::1') {
        return 'Local';
      }
      
      // const response = await fetch(`http://ip-api.com/json/${ip}`);
      // const data = await response.json();
      // return `${data.city}, ${data.country}`;
      
      return undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Vérifier les activités suspectes
   */
  private async checkSuspiciousActivity(
    userId: string,
    action: SecurityAction,
    ipAddress: string
  ): Promise<void> {
    // Vérifier les tentatives de connexion échouées
    if (action === 'login_failed') {
      const recentFailures = this.logs.filter(
        log =>
          log.userId === userId &&
          log.action === 'login_failed' &&
          log.timestamp > new Date(Date.now() - 15 * 60 * 1000) // 15 minutes
      );

      if (recentFailures.length >= 5) {
        await this.reportSuspiciousActivity({
          userId,
          type: 'multiple_failed_logins',
          severity: recentFailures.length >= 10 ? 'high' : 'medium',
          details: `${recentFailures.length} tentatives de connexion échouées en 15 minutes`,
          timestamp: new Date(),
          blocked: recentFailures.length >= 10,
        });
      }
    }

    // Vérifier les connexions depuis des emplacements inhabituels
    if (action === 'login') {
      const userLogins = this.logs.filter(
        log =>
          log.userId === userId &&
          log.action === 'login' &&
          log.success &&
          log.ipAddress !== ipAddress
      );

      if (userLogins.length > 0) {
        const knownIPs = new Set(userLogins.map(log => log.ipAddress));
        if (!knownIPs.has(ipAddress)) {
          await this.reportSuspiciousActivity({
            userId,
            type: 'unusual_location',
            severity: 'low',
            details: `Nouvelle connexion depuis IP: ${ipAddress}`,
            timestamp: new Date(),
            blocked: false,
          });
        }
      }
    }
  }

  /**
   * Signaler une activité suspecte
   */
  private async reportSuspiciousActivity(report: SuspiciousActivityReport): Promise<void> {
    console.warn('🚨 Activité suspecte détectée:', report);

    // En production: sauvegarder en base et notifier les admins
    // await this.saveReport(report);
    // await this.notifyAdmins(report);

    if (report.blocked) {
      // Bloquer temporairement l'utilisateur
      // await this.blockUser(report.userId, '15 minutes');
    }
  }

  /**
   * Générer un rapport de sécurité
   */
  async generateSecurityReport(userId: string): Promise<{
    totalLogins: number;
    failedLogins: number;
    passwordChanges: number;
    suspiciousActivities: number;
    lastLogin?: Date;
    lastPasswordChange?: Date;
    uniqueIPs: number;
    uniqueDevices: number;
  }> {
    const userLogs = await this.getUserLogs(userId);

    const logins = userLogs.filter(l => l.action === 'login' && l.success);
    const failedLogins = userLogs.filter(l => l.action === 'login_failed');
    const passwordChanges = userLogs.filter(l => l.action === 'password_change');
    const suspicious = userLogs.filter(l => l.action === 'suspicious_activity');

    return {
      totalLogins: logins.length,
      failedLogins: failedLogins.length,
      passwordChanges: passwordChanges.length,
      suspiciousActivities: suspicious.length,
      lastLogin: logins[0]?.timestamp,
      lastPasswordChange: passwordChanges[0]?.timestamp,
      uniqueIPs: new Set(userLogs.map(l => l.ipAddress)).size,
      uniqueDevices: new Set(userLogs.map(l => l.userAgent)).size,
    };
  }
}

// ============================================================================
// SERVICE DE GESTION DES SESSIONS
// ============================================================================

export class SessionService {
  private static instance: SessionService;
  private sessions: Map<string, SessionInfo> = new Map();

  private constructor() {}

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * Parser le User-Agent
   */
  private parseUserAgent(userAgent: string): {
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser: string;
    os: string;
  } {
    const ua = userAgent.toLowerCase();

    // Device type
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (/tablet|ipad|playbook|silk/.test(ua)) {
      deviceType = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) {
      deviceType = 'mobile';
    }

    // Browser
    let browser = 'Unknown';
    if (ua.includes('edg/')) browser = 'Edge';
    else if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('opera') || ua.includes('opr/')) browser = 'Opera';

    // OS
    let os = 'Unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return { deviceType, browser, os };
  }

  /**
   * Créer une nouvelle session
   */
  async createSession(data: {
    userId: string;
    token: string;
    ipAddress: string;
    userAgent: string;
    expiresIn?: number; // en secondes
  }): Promise<SessionInfo> {
    const { deviceType, browser, os } = this.parseUserAgent(data.userAgent);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (data.expiresIn || 7 * 24 * 60 * 60) * 1000);

    const session: SessionInfo = {
      id: crypto.randomUUID(),
      userId: data.userId,
      token: data.token,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      deviceType,
      browser,
      os,
      lastActivity: now,
      createdAt: now,
      expiresAt,
      is2FAVerified: false,
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Obtenir une session par ID
   */
  getSession(sessionId: string): SessionInfo | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Obtenir toutes les sessions d'un utilisateur
   */
  getUserSessions(userId: string): SessionInfo[] {
    const sessions: SessionInfo[] = [];
    this.sessions.forEach(session => {
      if (session.userId === userId && session.expiresAt > new Date()) {
        sessions.push(session);
      }
    });
    return sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  /**
   * Mettre à jour l'activité d'une session
   */
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  /**
   * Marquer une session comme vérifiée 2FA
   */
  mark2FAVerified(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.is2FAVerified = true;
    }
  }

  /**
   * Révoquer une session
   */
  revokeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Révoquer toutes les sessions d'un utilisateur (sauf la courante)
   */
  revokeAllUserSessions(userId: string, exceptSessionId?: string): number {
    let count = 0;
    this.sessions.forEach((session, id) => {
      if (session.userId === userId && id !== exceptSessionId) {
        this.sessions.delete(id);
        count++;
      }
    });
    return count;
  }

  /**
   * Nettoyer les sessions expirées
   */
  cleanExpiredSessions(): number {
    let count = 0;
    const now = new Date();
    this.sessions.forEach((session, id) => {
      if (session.expiresAt < now) {
        this.sessions.delete(id);
        count++;
      }
    });
    return count;
  }
}

// ============================================================================
// SERVICE 2FA PRINCIPAL
// ============================================================================

export class TwoFactorAuthService {
  private static instance: TwoFactorAuthService;
  private configs: Map<string, TwoFactorConfig> = new Map();
  private pendingCodes: Map<string, { code: string; expiresAt: Date }> = new Map();

  private constructor() {}

  static getInstance(): TwoFactorAuthService {
    if (!TwoFactorAuthService.instance) {
      TwoFactorAuthService.instance = new TwoFactorAuthService();
    }
    return TwoFactorAuthService.instance;
  }

  /**
   * Initier l'activation du 2FA
   */
  async initiateSetup(userId: string, method: TwoFactorConfig['method']): Promise<{
    secret: string;
    qrCodeUrl: string;
    qrCodeSvg: string;
    backupCodes: string[];
  }> {
    const secret = TOTPService.generateSecret();
    const backupCodes = BackupCodesService.generateCodes();
    
    // Stocker temporairement la configuration (non activée)
    const config: TwoFactorConfig = {
      userId,
      secret,
      enabled: false,
      method,
      backupCodes,
      usedBackupCodes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.configs.set(userId, config);

    // Générer l'URL pour l'app authenticator
    const qrCodeUrl = TOTPService.generateAuthenticatorURL(secret, userId, 'MyChurchApp');
    const qrCodeSvg = TOTPService.generateQRCodeSVG(qrCodeUrl);

    return {
      secret,
      qrCodeUrl,
      qrCodeSvg,
      backupCodes,
    };
  }

  /**
   * Vérifier et activer le 2FA
   */
  async activateSetup(userId: string, code: string): Promise<{ success: boolean; error?: string }> {
    const config = this.configs.get(userId);
    if (!config) {
      return { success: false, error: 'Configuration 2FA non trouvée' };
    }

    if (config.enabled) {
      return { success: false, error: '2FA déjà activé' };
    }

    const isValid = await TOTPService.verifyCode(config.secret, code);
    if (!isValid) {
      return { success: false, error: 'Code invalide' };
    }

    config.enabled = true;
    config.verifiedAt = new Date();
    config.updatedAt = new Date();
    this.configs.set(userId, config);

    // Log de sécurité
    await SecurityAuditService.getInstance().logAction({
      userId,
      action: '2fa_enabled',
      ipAddress: '0.0.0.0', // À récupérer du contexte
      userAgent: 'system',
      success: true,
    });

    return { success: true };
  }

  /**
   * Vérifier un code 2FA
   */
  async verifyCode(userId: string, code: string): Promise<{
    success: boolean;
    method?: 'totp' | 'backup';
    error?: string;
  }> {
    const config = this.configs.get(userId);
    if (!config || !config.enabled) {
      return { success: false, error: '2FA non activé pour cet utilisateur' };
    }

    // Vérifier si c'est un code TOTP
    const isTOTPValid = await TOTPService.verifyCode(config.secret, code);
    if (isTOTPValid) {
      await SecurityAuditService.getInstance().logAction({
        userId,
        action: '2fa_verified',
        ipAddress: '0.0.0.0',
        userAgent: 'system',
        success: true,
        details: 'TOTP',
      });
      return { success: true, method: 'totp' };
    }

    // Vérifier si c'est un code de récupération
    const hashedBackupCodes = await Promise.all(
      config.backupCodes
        .filter(c => !config.usedBackupCodes.includes(c))
        .map(c => BackupCodesService.hashCode(c))
    );
    const { valid, index } = await BackupCodesService.verifyCode(code, hashedBackupCodes);
    
    if (valid) {
      // Marquer le code comme utilisé
      const usedCode = config.backupCodes.filter(c => !config.usedBackupCodes.includes(c))[index];
      config.usedBackupCodes.push(usedCode);
      config.updatedAt = new Date();
      this.configs.set(userId, config);

      await SecurityAuditService.getInstance().logAction({
        userId,
        action: 'backup_code_used',
        ipAddress: '0.0.0.0',
        userAgent: 'system',
        success: true,
        details: `Code de récupération utilisé. Restants: ${config.backupCodes.length - config.usedBackupCodes.length}`,
      });

      return { success: true, method: 'backup' };
    }

    await SecurityAuditService.getInstance().logAction({
      userId,
      action: '2fa_failed',
      ipAddress: '0.0.0.0',
      userAgent: 'system',
      success: false,
    });

    return { success: false, error: 'Code invalide' };
  }

  /**
   * Envoyer un code 2FA par email
   */
  async sendEmailCode(userId: string, email: string, firstName: string): Promise<boolean> {
    // Générer un code aléatoire à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    this.pendingCodes.set(`email:${userId}`, { code, expiresAt });

    const emailService = EmailService.getInstance();
    return await emailService.send2FACode({
      email,
      firstName,
      code,
      expiresIn: '10 minutes',
    });
  }

  /**
   * Envoyer un code 2FA par SMS
   */
  async sendSMSCode(userId: string, phone: string): Promise<boolean> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    this.pendingCodes.set(`sms:${userId}`, { code, expiresAt });

    const smsService = SMSService.getInstance();
    return await smsService.send2FACode({ phone, code });
  }

  /**
   * Vérifier un code envoyé par email/SMS
   */
  async verifyEmailSMSCode(userId: string, code: string, type: 'email' | 'sms'): Promise<boolean> {
    const key = `${type}:${userId}`;
    const pending = this.pendingCodes.get(key);

    if (!pending) {
      return false;
    }

    if (pending.expiresAt < new Date()) {
      this.pendingCodes.delete(key);
      return false;
    }

    if (pending.code === code) {
      this.pendingCodes.delete(key);
      return true;
    }

    return false;
  }

  /**
   * Désactiver le 2FA
   */
  async disable2FA(userId: string, code: string): Promise<{ success: boolean; error?: string }> {
    const verification = await this.verifyCode(userId, code);
    if (!verification.success) {
      return { success: false, error: 'Code invalide' };
    }

    const config = this.configs.get(userId);
    if (config) {
      config.enabled = false;
      config.updatedAt = new Date();
      this.configs.set(userId, config);
    }

    await SecurityAuditService.getInstance().logAction({
      userId,
      action: '2fa_disabled',
      ipAddress: '0.0.0.0',
      userAgent: 'system',
      success: true,
    });

    return { success: true };
  }

  /**
   * Régénérer les codes de récupération
   */
  async regenerateBackupCodes(userId: string, code: string): Promise<{
    success: boolean;
    backupCodes?: string[];
    error?: string;
  }> {
    const verification = await this.verifyCode(userId, code);
    if (!verification.success) {
      return { success: false, error: 'Code invalide' };
    }

    const config = this.configs.get(userId);
    if (!config) {
      return { success: false, error: 'Configuration 2FA non trouvée' };
    }

    const newBackupCodes = BackupCodesService.generateCodes();
    config.backupCodes = newBackupCodes;
    config.usedBackupCodes = [];
    config.updatedAt = new Date();
    this.configs.set(userId, config);

    return { success: true, backupCodes: newBackupCodes };
  }

  /**
   * Vérifier si le 2FA est activé pour un utilisateur
   */
  is2FAEnabled(userId: string): boolean {
    const config = this.configs.get(userId);
    return config?.enabled || false;
  }

  /**
   * Obtenir le nombre de codes de récupération restants
   */
  getRemainingBackupCodes(userId: string): number {
    const config = this.configs.get(userId);
    if (!config) return 0;
    return config.backupCodes.length - config.usedBackupCodes.length;
  }
}

// Export des instances singleton
export const twoFactorAuthService = TwoFactorAuthService.getInstance();
export const securityAuditService = SecurityAuditService.getInstance();
export const sessionService = SessionService.getInstance();
