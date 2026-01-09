/**
 * ============================================================================
 * SERVICE DE NOTIFICATIONS - MyChurchApp
 * ============================================================================
 * Gestion complète des notifications: Push Web, Email, SMS, In-App
 * 
 * Fonctionnalités:
 * - Web Push Notifications (Service Worker)
 * - Email transactionnels (SendGrid/SMTP)
 * - SMS Notifications (Twilio)
 * - Notifications In-App
 * - Rappels automatiques
 * - Templates personnalisables
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * ============================================================================
 */

// Types pour les notifications
export type NotificationType = 'push' | 'email' | 'sms' | 'in-app';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationCategory = 
  | 'welcome' 
  | 'appointment' 
  | 'donation' 
  | 'event' 
  | 'prayer' 
  | 'birthday' 
  | 'announcement' 
  | 'reminder'
  | 'security';

export interface NotificationPayload {
  id?: string;
  userId?: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  imageUrl?: string;
  actionUrl?: string;
  scheduledAt?: Date;
  expiresAt?: Date;
}

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  body?: string; // Fallback pour text
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: string;
    type: string;
  }>;
  replyTo?: string;
}

export interface SMSPayload {
  to: string;
  body: string;
  mediaUrl?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Configuration
const config = {
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@mychurchapp.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'MyChurchApp',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  webPush: {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    subject: process.env.VAPID_SUBJECT || 'mailto:contact@mychurchapp.com',
  },
};

// ============================================================================
// EMAIL SERVICE
// ============================================================================

export class EmailService {
  private static instance: EmailService;
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  private constructor() {
    this.apiKey = config.sendgrid.apiKey;
    this.fromEmail = config.sendgrid.fromEmail;
    this.fromName = config.sendgrid.fromName;
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Envoyer un email via SendGrid
   */
  async send(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: Array.isArray(payload.to) 
              ? payload.to.map(email => ({ email })) 
              : [{ email: payload.to }],
            dynamic_template_data: payload.templateData,
          }],
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          reply_to: payload.replyTo ? { email: payload.replyTo } : undefined,
          subject: payload.subject,
          content: [
            { type: 'text/plain', value: payload.text || payload.body },
            { type: 'text/html', value: payload.html },
          ],
          template_id: payload.templateId,
          attachments: payload.attachments?.map(att => ({
            content: att.content,
            filename: att.filename,
            type: att.type,
            disposition: 'attachment',
          })),
        }),
      });

      if (response.ok) {
        const messageId = response.headers.get('X-Message-Id') || undefined;
        return { success: true, messageId };
      } else {
        const error = await response.text();
        console.error('SendGrid Error:', error);
        return { success: false, error };
      }
    } catch (error: any) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Email de bienvenue pour nouveaux membres
   */
  async sendWelcomeEmail(user: { email: string; firstName: string; lastName: string }): Promise<boolean> {
    const html = EmailTemplates.welcome(user.firstName, user.lastName);
    const result = await this.send({
      to: user.email,
      subject: '🎉 Bienvenue dans notre communauté - MyChurchApp',
      html,
      text: `Bienvenue ${user.firstName}! Nous sommes ravis de vous accueillir.`,
    });
    return result.success;
  }

  /**
   * Email de confirmation de don
   */
  async sendDonationReceipt(data: {
    email: string;
    firstName: string;
    amount: number;
    currency: string;
    date: string;
    donationType: string;
    receiptNumber: string;
  }): Promise<boolean> {
    const html = EmailTemplates.donationReceipt(data);
    const result = await this.send({
      to: data.email,
      subject: `🙏 Reçu de don #${data.receiptNumber} - Merci pour votre générosité`,
      html,
      text: `Merci pour votre don de ${data.amount} ${data.currency}. Numéro de reçu: ${data.receiptNumber}`,
    });
    return result.success;
  }

  /**
   * Email de rappel de rendez-vous
   */
  async sendAppointmentReminder(data: {
    email: string;
    firstName: string;
    appointmentDate: string;
    appointmentTime: string;
    pastorName: string;
    location?: string;
  }): Promise<boolean> {
    const html = EmailTemplates.appointmentReminder(data);
    const result = await this.send({
      to: data.email,
      subject: `📅 Rappel: Rendez-vous avec ${data.pastorName} demain`,
      html,
      text: `Rappel: Vous avez un rendez-vous le ${data.appointmentDate} à ${data.appointmentTime} avec ${data.pastorName}.`,
    });
    return result.success;
  }

  /**
   * Email de notification d'événement
   */
  async sendEventNotification(data: {
    email: string;
    firstName: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    location: string;
    description?: string;
  }): Promise<boolean> {
    const html = EmailTemplates.eventNotification(data);
    const result = await this.send({
      to: data.email,
      subject: `🎊 Nouvel événement: ${data.eventTitle}`,
      html,
      text: `${data.eventTitle} le ${data.eventDate} à ${data.eventTime} - ${data.location}`,
    });
    return result.success;
  }

  /**
   * Email d'anniversaire
   */
  async sendBirthdayWish(data: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<boolean> {
    const html = EmailTemplates.birthday(data.firstName);
    const result = await this.send({
      to: data.email,
      subject: `🎂 Joyeux anniversaire ${data.firstName}!`,
      html,
      text: `Joyeux anniversaire ${data.firstName}! Que Dieu vous bénisse en ce jour spécial.`,
    });
    return result.success;
  }

  /**
   * Email de réinitialisation de mot de passe
   */
  async sendPasswordReset(data: {
    email: string;
    firstName: string;
    resetLink: string;
    expiresIn: string;
  }): Promise<boolean> {
    const html = EmailTemplates.passwordReset(data);
    const result = await this.send({
      to: data.email,
      subject: '🔐 Réinitialisation de votre mot de passe',
      html,
      text: `Cliquez sur ce lien pour réinitialiser votre mot de passe: ${data.resetLink}. Ce lien expire dans ${data.expiresIn}.`,
    });
    return result.success;
  }

  /**
   * Email de code 2FA
   */
  async send2FACode(data: {
    email: string;
    firstName: string;
    code: string;
    expiresIn: string;
  }): Promise<boolean> {
    const html = EmailTemplates.twoFactorCode(data);
    const result = await this.send({
      to: data.email,
      subject: '🔒 Code de vérification MyChurchApp',
      html,
      text: `Votre code de vérification est: ${data.code}. Ce code expire dans ${data.expiresIn}.`,
    });
    return result.success;
  }

  /**
   * Email de rapport automatique
   */
  async sendAutomatedReport(data: {
    email: string;
    firstName: string;
    reportType: string;
    period: string;
    attachmentContent: string;
    attachmentFilename: string;
  }): Promise<boolean> {
    const html = EmailTemplates.automatedReport(data);
    const result = await this.send({
      to: data.email,
      subject: `📊 Rapport ${data.reportType} - ${data.period}`,
      html,
      text: `Votre rapport ${data.reportType} pour la période ${data.period} est disponible en pièce jointe.`,
      attachments: [{
        content: Buffer.from(data.attachmentContent).toString('base64'),
        filename: data.attachmentFilename,
        type: data.attachmentFilename.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }],
    });
    return result.success;
  }
}

// ============================================================================
// SMS SERVICE (Twilio)
// ============================================================================

export class SMSService {
  private static instance: SMSService;
  private accountSid: string;
  private authToken: string;
  private phoneNumber: string;

  private constructor() {
    this.accountSid = config.twilio.accountSid;
    this.authToken = config.twilio.authToken;
    this.phoneNumber = config.twilio.phoneNumber;
  }

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  /**
   * Envoyer un SMS via Twilio
   */
  async send(payload: SMSPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const authHeader = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: this.phoneNumber,
            To: payload.to,
            Body: payload.body,
            ...(payload.mediaUrl && { MediaUrl: payload.mediaUrl }),
          }),
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, messageId: data.sid };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error: any) {
      console.error('SMS send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * SMS de rappel de rendez-vous
   */
  async sendAppointmentReminder(data: {
    phone: string;
    firstName: string;
    appointmentDate: string;
    appointmentTime: string;
    pastorName: string;
  }): Promise<boolean> {
    const result = await this.send({
      to: data.phone,
      body: `🙏 Rappel MyChurchApp: ${data.firstName}, votre RDV avec ${data.pastorName} est prévu le ${data.appointmentDate} à ${data.appointmentTime}. À bientôt!`,
    });
    return result.success;
  }

  /**
   * SMS de code 2FA
   */
  async send2FACode(data: {
    phone: string;
    code: string;
  }): Promise<boolean> {
    const result = await this.send({
      to: data.phone,
      body: `🔒 MyChurchApp - Votre code de vérification: ${data.code}. Ce code expire dans 10 minutes.`,
    });
    return result.success;
  }

  /**
   * SMS d'alerte urgente
   */
  async sendUrgentAlert(data: {
    phone: string;
    message: string;
  }): Promise<boolean> {
    const result = await this.send({
      to: data.phone,
      body: `🚨 URGENT MyChurchApp: ${data.message}`,
    });
    return result.success;
  }
}

// ============================================================================
// WEB PUSH SERVICE
// ============================================================================

export class WebPushService {
  private static instance: WebPushService;
  private vapidPublicKey: string;
  private vapidPrivateKey: string;
  private vapidSubject: string;

  private constructor() {
    this.vapidPublicKey = config.webPush.publicKey;
    this.vapidPrivateKey = config.webPush.privateKey;
    this.vapidSubject = config.webPush.subject;
  }

  static getInstance(): WebPushService {
    if (!WebPushService.instance) {
      WebPushService.instance = new WebPushService();
    }
    return WebPushService.instance;
  }

  /**
   * Générer les clés VAPID (à exécuter une seule fois)
   */
  static generateVAPIDKeys(): { publicKey: string; privateKey: string } {
    // Note: En production, utiliser web-push.generateVAPIDKeys()
    // Ceci est un placeholder - les vraies clés doivent être générées côté serveur
    return {
      publicKey: 'GENERATED_PUBLIC_KEY',
      privateKey: 'GENERATED_PRIVATE_KEY',
    };
  }

  /**
   * Envoyer une notification push
   */
  async send(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Construction du JWT pour VAPID
      const header = { alg: 'ES256', typ: 'JWT' };
      const now = Math.floor(Date.now() / 1000);
      const jwtPayload = {
        aud: new URL(subscription.endpoint).origin,
        exp: now + 12 * 60 * 60, // 12 heures
        sub: this.vapidSubject,
      };

      // Note: En production, utiliser la bibliothèque web-push
      const response = await fetch(subscription.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Encoding': 'aes128gcm',
          'TTL': '86400',
        },
        body: JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          image: payload.imageUrl,
          data: {
            url: payload.actionUrl || '/',
            ...payload.data,
          },
          actions: [
            { action: 'open', title: 'Ouvrir' },
            { action: 'dismiss', title: 'Ignorer' },
          ],
        }),
      });

      return { success: response.ok };
    } catch (error: any) {
      console.error('Push notification error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer une notification à plusieurs utilisateurs
   */
  async sendToMultiple(
    subscriptions: PushSubscription[],
    payload: NotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    await Promise.all(
      subscriptions.map(async (sub) => {
        const result = await this.send(sub, payload);
        if (result.success) {
          sent++;
        } else {
          failed++;
        }
      })
    );

    return { sent, failed };
  }

  /**
   * Notification de nouvelle prière
   */
  async notifyNewPrayer(
    subscriptions: PushSubscription[],
    data: { title: string; requesterName: string }
  ): Promise<void> {
    await this.sendToMultiple(subscriptions, {
      type: 'push',
      category: 'prayer',
      title: '🙏 Nouvelle intention de prière',
      body: `${data.requesterName} a besoin de vos prières: ${data.title}`,
      actionUrl: '/prayers',
    });
  }

  /**
   * Notification d'événement imminent
   */
  async notifyUpcomingEvent(
    subscriptions: PushSubscription[],
    data: { eventTitle: string; startTime: string; location: string }
  ): Promise<void> {
    await this.sendToMultiple(subscriptions, {
      type: 'push',
      category: 'event',
      title: '📅 Événement dans 1 heure',
      body: `${data.eventTitle} commence à ${data.startTime} - ${data.location}`,
      actionUrl: '/events',
      priority: 'high',
    });
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export class EmailTemplates {
  private static baseStyles = `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
      .header h1 { color: white; margin: 0; font-size: 24px; }
      .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
      .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #6b7280; }
      .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      .button:hover { background: #1d4ed8; }
      .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; }
      .info-box { background: #eff6ff; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }
    </style>
  `;

  static welcome(firstName: string, lastName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Bienvenue ${firstName}!</h1>
          </div>
          <div class="content">
            <p>Cher(e) ${firstName} ${lastName},</p>
            <p>Nous sommes ravis de vous accueillir dans notre communauté MyChurchApp!</p>
            <p>Votre compte a été créé avec succès. Vous pouvez maintenant:</p>
            <ul>
              <li>📅 Prendre des rendez-vous avec les pasteurs</li>
              <li>🎬 Regarder les prédications en replay</li>
              <li>🙏 Partager vos intentions de prière</li>
              <li>💰 Faire des dons en toute sécurité</li>
              <li>📱 Recevoir les notifications importantes</li>
            </ul>
            <div class="info-box">
              <strong>Astuce:</strong> Complétez votre profil pour une meilleure expérience personnalisée!
            </div>
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.mychurchapp.com'}/profile" class="button">
                Compléter mon profil
              </a>
            </center>
            <p>Que Dieu vous bénisse!</p>
            <p>L'équipe MyChurchApp 🙏</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MyChurchApp - Tous droits réservés</p>
            <p>Cet email a été envoyé à ${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static donationReceipt(data: {
    firstName: string;
    amount: number;
    currency: string;
    date: string;
    donationType: string;
    receiptNumber: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🙏 Merci pour votre générosité!</h1>
          </div>
          <div class="content">
            <p>Cher(e) ${data.firstName},</p>
            <p>Nous avons bien reçu votre don et nous vous en remercions du fond du cœur.</p>
            
            <div class="highlight">
              <h3 style="margin-top:0">📝 Détails du don</h3>
              <table style="width:100%">
                <tr><td><strong>Numéro de reçu:</strong></td><td>${data.receiptNumber}</td></tr>
                <tr><td><strong>Montant:</strong></td><td><strong style="color:#059669">${data.amount} ${data.currency}</strong></td></tr>
                <tr><td><strong>Type:</strong></td><td>${data.donationType}</td></tr>
                <tr><td><strong>Date:</strong></td><td>${data.date}</td></tr>
              </table>
            </div>
            
            <div class="info-box">
              <strong>📄 Reçu fiscal:</strong> Ce reçu peut être utilisé pour votre déclaration d'impôts selon la législation en vigueur dans votre pays.
            </div>
            
            <p><em>"Chacun donne comme il l'a résolu en son cœur, sans tristesse ni contrainte; car Dieu aime celui qui donne avec joie."</em> - 2 Corinthiens 9:7</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.mychurchapp.com'}/donations" class="button">
                Voir mes dons
              </a>
            </center>
            
            <p>Que Dieu vous bénisse abondamment!</p>
            <p>L'équipe MyChurchApp</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MyChurchApp - Tous droits réservés</p>
            <p>Conservez ce reçu pour vos archives</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static appointmentReminder(data: {
    firstName: string;
    appointmentDate: string;
    appointmentTime: string;
    pastorName: string;
    location?: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Rappel de rendez-vous</h1>
          </div>
          <div class="content">
            <p>Cher(e) ${data.firstName},</p>
            <p>Ceci est un rappel pour votre rendez-vous prévu <strong>demain</strong>.</p>
            
            <div class="highlight">
              <h3 style="margin-top:0">📋 Détails du rendez-vous</h3>
              <p>📆 <strong>Date:</strong> ${data.appointmentDate}</p>
              <p>⏰ <strong>Heure:</strong> ${data.appointmentTime}</p>
              <p>👤 <strong>Avec:</strong> ${data.pastorName}</p>
              ${data.location ? `<p>📍 <strong>Lieu:</strong> ${data.location}</p>` : ''}
            </div>
            
            <div class="info-box">
              <strong>💡 Conseils:</strong>
              <ul style="margin-bottom:0">
                <li>Arrivez 5-10 minutes en avance</li>
                <li>Préparez les sujets que vous souhaitez aborder</li>
                <li>En cas d'empêchement, prévenez-nous dès que possible</li>
              </ul>
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.mychurchapp.com'}/appointments" class="button">
                Gérer mes rendez-vous
              </a>
            </center>
            
            <p>À très bientôt!</p>
            <p>L'équipe MyChurchApp</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MyChurchApp</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static eventNotification(data: {
    firstName: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    location: string;
    description?: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 Nouvel événement!</h1>
          </div>
          <div class="content">
            <p>Cher(e) ${data.firstName},</p>
            <p>Un nouvel événement a été programmé et nous serions ravis de vous y voir!</p>
            
            <div class="highlight">
              <h2 style="margin-top:0;color:#1d4ed8">${data.eventTitle}</h2>
              <p>📆 <strong>Date:</strong> ${data.eventDate}</p>
              <p>⏰ <strong>Heure:</strong> ${data.eventTime}</p>
              <p>📍 <strong>Lieu:</strong> ${data.location}</p>
              ${data.description ? `<p>📝 ${data.description}</p>` : ''}
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.mychurchapp.com'}/events" class="button">
                Voir tous les événements
              </a>
            </center>
            
            <p>On vous attend avec joie!</p>
            <p>L'équipe MyChurchApp</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MyChurchApp</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static birthday(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.baseStyles}</head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #ec4899 0%, #f97316 100%);">
            <h1>🎂 Joyeux anniversaire!</h1>
          </div>
          <div class="content">
            <p style="font-size:24px;text-align:center">Cher(e) <strong>${firstName}</strong>,</p>
            
            <div style="text-align:center;padding:30px">
              <p style="font-size:48px;margin:0">🎉🎂🎁</p>
              <h2 style="color:#ec4899">Joyeux anniversaire!</h2>
            </div>
            
            <p style="text-align:center;font-style:italic;font-size:18px">
              "Que l'Éternel te bénisse et te garde!<br>
              Que l'Éternel fasse luire sa face sur toi et t'accorde sa grâce!<br>
              Que l'Éternel tourne sa face vers toi et te donne la paix!"
            </p>
            <p style="text-align:center;color:#6b7280">— Nombres 6:24-26</p>
            
            <div class="highlight" style="text-align:center;background:#fce7f3">
              <p>Toute la communauté se joint à nous pour vous souhaiter une merveilleuse journée remplie de joie, d'amour et de bénédictions divines!</p>
            </div>
            
            <p style="text-align:center">Avec tout notre amour,</p>
            <p style="text-align:center"><strong>L'équipe MyChurchApp et toute la communauté 🙏</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MyChurchApp</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static passwordReset(data: {
    firstName: string;
    resetLink: string;
    expiresIn: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.baseStyles}</head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">
            <h1>🔐 Réinitialisation du mot de passe</h1>
          </div>
          <div class="content">
            <p>Cher(e) ${data.firstName},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            
            <div class="info-box" style="border-color:#dc2626;background:#fef2f2">
              <strong>⚠️ Important:</strong> Ce lien expire dans <strong>${data.expiresIn}</strong>.
            </div>
            
            <center>
              <a href="${data.resetLink}" class="button" style="background:#dc2626">
                Réinitialiser mon mot de passe
              </a>
            </center>
            
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe restera inchangé.</p>
            
            <p style="color:#6b7280;font-size:12px">
              Pour des raisons de sécurité, ce lien ne peut être utilisé qu'une seule fois.
            </p>
            
            <p>L'équipe MyChurchApp</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MyChurchApp - Sécurité</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static twoFactorCode(data: {
    firstName: string;
    code: string;
    expiresIn: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.baseStyles}</head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #059669 0%, #047857 100%);">
            <h1>🔒 Code de vérification</h1>
          </div>
          <div class="content">
            <p>Cher(e) ${data.firstName},</p>
            <p>Voici votre code de vérification à deux facteurs:</p>
            
            <div style="text-align:center;padding:30px;background:#f0fdf4;border-radius:10px;margin:20px 0">
              <p style="font-size:48px;font-weight:bold;letter-spacing:10px;color:#059669;margin:0">
                ${data.code}
              </p>
            </div>
            
            <div class="info-box" style="border-color:#059669;background:#f0fdf4">
              <strong>⏱️ Ce code expire dans ${data.expiresIn}</strong>
            </div>
            
            <p style="color:#6b7280;font-size:12px">
              Si vous n'avez pas tenté de vous connecter, quelqu'un essaie peut-être d'accéder à votre compte. 
              Nous vous recommandons de changer votre mot de passe immédiatement.
            </p>
            
            <p>L'équipe MyChurchApp</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MyChurchApp - Sécurité</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static automatedReport(data: {
    firstName: string;
    reportType: string;
    period: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>${this.baseStyles}</head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Rapport automatique</h1>
          </div>
          <div class="content">
            <p>Cher(e) ${data.firstName},</p>
            <p>Voici votre rapport <strong>${data.reportType}</strong> pour la période <strong>${data.period}</strong>.</p>
            
            <div class="info-box">
              <strong>📎 Pièce jointe:</strong> Le rapport détaillé est disponible en pièce jointe de cet email.
            </div>
            
            <p>Ce rapport a été généré automatiquement par MyChurchApp.</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.mychurchapp.com'}/analytics" class="button">
                Voir le tableau de bord
              </a>
            </center>
            
            <p>L'équipe MyChurchApp</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} MyChurchApp</p>
            <p>Rapport généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// ============================================================================
// NOTIFICATION MANAGER
// ============================================================================

export class NotificationManager {
  private static instance: NotificationManager;
  private emailService: EmailService;
  private smsService: SMSService;
  private webPushService: WebPushService;

  private constructor() {
    this.emailService = EmailService.getInstance();
    this.smsService = SMSService.getInstance();
    this.webPushService = WebPushService.getInstance();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Envoyer une notification multi-canal
   */
  async sendMultiChannel(options: {
    userId: string;
    channels: NotificationType[];
    payload: NotificationPayload;
    emailData?: EmailPayload;
    smsData?: SMSPayload;
    pushSubscription?: PushSubscription;
  }): Promise<{
    email?: { success: boolean; error?: string };
    sms?: { success: boolean; error?: string };
    push?: { success: boolean; error?: string };
  }> {
    const results: any = {};

    await Promise.all(
      options.channels.map(async (channel) => {
        switch (channel) {
          case 'email':
            if (options.emailData) {
              results.email = await this.emailService.send(options.emailData);
            }
            break;
          case 'sms':
            if (options.smsData) {
              results.sms = await this.smsService.send(options.smsData);
            }
            break;
          case 'push':
            if (options.pushSubscription) {
              results.push = await this.webPushService.send(
                options.pushSubscription,
                options.payload
              );
            }
            break;
        }
      })
    );

    return results;
  }

  // Accès direct aux services
  get email(): EmailService {
    return this.emailService;
  }

  get sms(): SMSService {
    return this.smsService;
  }

  get push(): WebPushService {
    return this.webPushService;
  }
}

// Export des instances singleton
export const notificationManager = NotificationManager.getInstance();
export const emailService = EmailService.getInstance();
export const smsService = SMSService.getInstance();
export const webPushService = WebPushService.getInstance();
