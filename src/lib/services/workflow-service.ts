/**
 * =============================================================================
 * SERVICE DE WORKFLOWS ET AUTOMATISATION - MyChurchApp
 * =============================================================================
 * 
 * Fonctionnalités:
 * - Automatisation de rappels
 * - Emails automatiques de bienvenue
 * - Suivi des nouveaux visiteurs
 * - Notifications anniversaires
 * - Workflow d'approbation
 * - Validation de témoignages
 * - Rappels de dons
 * - Automatisation de rapports
 * - Règles de notifications personnalisées
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * =============================================================================
 */

// Types
export interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
  executionCount: number;
}

export type WorkflowTrigger = 
  | { type: 'NEW_MEMBER'; }
  | { type: 'BIRTHDAY'; daysBeefore?: number; }
  | { type: 'ANNIVERSARY'; anniversaryType: 'membership' | 'baptism' | 'wedding'; daysBefore?: number; }
  | { type: 'DONATION'; minAmount?: number; donationType?: string; }
  | { type: 'PRAYER_SUBMITTED'; }
  | { type: 'TESTIMONY_SUBMITTED'; }
  | { type: 'EVENT_CREATED'; }
  | { type: 'ABSENCE_DETECTED'; consecutiveWeeks: number; }
  | { type: 'SCHEDULED'; cron: string; }
  | { type: 'MANUAL'; };

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export type WorkflowAction = 
  | { type: 'SEND_EMAIL'; templateId: string; recipientType: 'user' | 'admin' | 'pastor' | 'custom'; customEmail?: string; }
  | { type: 'SEND_SMS'; templateId: string; recipientType: 'user' | 'admin' | 'pastor'; }
  | { type: 'SEND_NOTIFICATION'; title: string; message: string; recipientType: 'user' | 'role' | 'all'; role?: string; }
  | { type: 'CREATE_TASK'; title: string; assignTo: string; dueInDays: number; }
  | { type: 'UPDATE_FIELD'; entity: string; field: string; value: any; }
  | { type: 'WEBHOOK'; url: string; method: 'GET' | 'POST'; headers?: Record<string, string>; }
  | { type: 'GENERATE_REPORT'; reportType: string; recipients: string[]; };

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
  category: 'welcome' | 'reminder' | 'notification' | 'report' | 'celebration';
}

export interface ScheduledTask {
  id: string;
  workflowId: string;
  scheduledFor: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  payload: any;
  result?: any;
  error?: string;
}

// ============================================================================
// TEMPLATES D'EMAILS PRÉDÉFINIS
// ============================================================================

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  WELCOME_NEW_MEMBER: {
    id: 'welcome_new_member',
    name: 'Bienvenue nouveau membre',
    subject: '🎉 Bienvenue dans notre église, {{firstName}} !',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏛️ Bienvenue !</h1>
    </div>
    <div class="content">
      <h2>Cher(e) {{firstName}} {{lastName}},</h2>
      <p>Nous sommes ravis de vous accueillir dans notre communauté !</p>
      <p>Votre inscription a été enregistrée avec succès. Voici vos informations :</p>
      <ul>
        <li><strong>Numéro de membre :</strong> {{membershipNumber}}</li>
        <li><strong>Email :</strong> {{email}}</li>
        <li><strong>Date d'inscription :</strong> {{membershipDate}}</li>
      </ul>
      <p>N'hésitez pas à explorer l'application pour découvrir toutes les fonctionnalités disponibles :</p>
      <ul>
        <li>📖 Écouter les prédications</li>
        <li>🙏 Partager vos intentions de prière</li>
        <li>📅 Consulter les événements à venir</li>
        <li>💬 Discuter avec la communauté</li>
      </ul>
      <center>
        <a href="{{appUrl}}" class="button">Accéder à l'application</a>
      </center>
      <p>Que Dieu vous bénisse,</p>
      <p><strong>L'équipe pastorale</strong></p>
    </div>
    <div class="footer">
      <p>{{churchName}} - {{churchAddress}}</p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['firstName', 'lastName', 'email', 'membershipNumber', 'membershipDate', 'appUrl', 'churchName', 'churchAddress'],
    category: 'welcome'
  },

  BIRTHDAY_WISH: {
    id: 'birthday_wish',
    name: 'Vœux d\'anniversaire',
    subject: '🎂 Joyeux anniversaire {{firstName}} !',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #fef3c7; padding: 30px; border-radius: 0 0 10px 10px; }
    .verse { background: white; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Joyeux Anniversaire ! 🎂</h1>
    </div>
    <div class="content">
      <h2>Cher(e) {{firstName}},</h2>
      <p>Toute la communauté se joint à nous pour vous souhaiter un <strong>très joyeux anniversaire</strong> !</p>
      <p>Aujourd'hui vous célébrez vos <strong>{{age}} ans</strong>. Que cette nouvelle année de vie soit remplie de bénédictions, de joie et de la grâce de Dieu.</p>
      <div class="verse">
        <p>"L'Éternel te bénisse et te garde ! L'Éternel fasse luire sa face sur toi et t'accorde sa grâce !"</p>
        <p><strong>- Nombres 6:24-25</strong></p>
      </div>
      <p>Nous prions pour vous et votre famille en ce jour spécial.</p>
      <p>Avec tout notre amour fraternel,</p>
      <p><strong>{{churchName}}</strong></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['firstName', 'age', 'churchName'],
    category: 'celebration'
  },

  DONATION_RECEIPT: {
    id: 'donation_receipt',
    name: 'Reçu de don',
    subject: '🙏 Merci pour votre don de {{amount}} {{currency}}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ecfdf5; padding: 30px; border-radius: 0 0 10px 10px; }
    .receipt-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .total { font-size: 1.5em; color: #059669; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🙏 Merci pour votre générosité !</h1>
    </div>
    <div class="content">
      <h2>Cher(e) {{firstName}},</h2>
      <p>Nous avons bien reçu votre don et nous vous en remercions du fond du cœur.</p>
      <div class="receipt-box">
        <h3>Reçu de don - N° {{receiptNumber}}</h3>
        <div class="receipt-row">
          <span>Date</span>
          <span>{{date}}</span>
        </div>
        <div class="receipt-row">
          <span>Type de don</span>
          <span>{{donationType}}</span>
        </div>
        <div class="receipt-row">
          <span>Méthode de paiement</span>
          <span>{{paymentMethod}}</span>
        </div>
        {{#if projectName}}
        <div class="receipt-row">
          <span>Projet</span>
          <span>{{projectName}}</span>
        </div>
        {{/if}}
        <div class="receipt-row">
          <span><strong>Montant</strong></span>
          <span class="total">{{amount}} {{currency}}</span>
        </div>
      </div>
      <p>"Donnez, et il vous sera donné : on versera dans votre sein une bonne mesure, serrée, secouée et qui déborde." - Luc 6:38</p>
      <p>Que Dieu vous bénisse abondamment,</p>
      <p><strong>{{churchName}}</strong></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['firstName', 'receiptNumber', 'date', 'donationType', 'paymentMethod', 'projectName', 'amount', 'currency', 'churchName'],
    category: 'notification'
  },

  ABSENCE_REMINDER: {
    id: 'absence_reminder',
    name: 'Rappel d\'absence',
    subject: '💙 Vous nous manquez, {{firstName}} !',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f5f3ff; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💙 Vous nous manquez !</h1>
    </div>
    <div class="content">
      <h2>Cher(e) {{firstName}},</h2>
      <p>Nous avons remarqué que vous n'avez pas participé aux cultes depuis <strong>{{weeksAbsent}} semaines</strong>.</p>
      <p>Votre présence est précieuse pour notre communauté et nous espérons que vous allez bien.</p>
      <p>Si vous traversez une période difficile ou si vous avez besoin de quoi que ce soit, n'hésitez pas à nous contacter. Nous sommes là pour vous soutenir.</p>
      <p>Voici les prochains événements auxquels nous serions ravis de vous voir :</p>
      <ul>
        {{#each upcomingEvents}}
        <li>{{this.name}} - {{this.date}}</li>
        {{/each}}
      </ul>
      <center>
        <a href="{{appUrl}}" class="button">Voir le calendrier</a>
      </center>
      <p>Avec tout notre amour,</p>
      <p><strong>L'équipe pastorale</strong></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['firstName', 'weeksAbsent', 'upcomingEvents', 'appUrl'],
    category: 'reminder'
  },

  PRAYER_ANSWERED: {
    id: 'prayer_answered',
    name: 'Prière exaucée',
    subject: '✨ Témoignage de prière exaucée',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ecfeff; padding: 30px; border-radius: 0 0 10px 10px; }
    .testimony-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Dieu est fidèle !</h1>
    </div>
    <div class="content">
      <h2>Bonne nouvelle !</h2>
      <p>Une prière de notre communauté a été exaucée :</p>
      <div class="testimony-box">
        <p><strong>{{prayerTitle}}</strong></p>
        <p>{{prayerContent}}</p>
        <p><em>— {{userName}}</em></p>
      </div>
      <p>Rendons grâce à Dieu pour cette bénédiction !</p>
      <p><strong>{{churchName}}</strong></p>
    </div>
  </div>
</body>
</html>
    `,
    variables: ['prayerTitle', 'prayerContent', 'userName', 'churchName'],
    category: 'notification'
  }
};

// ============================================================================
// SERVICE DE WORKFLOWS
// ============================================================================

export class WorkflowService {
  
  /**
   * Évaluer les conditions d'un workflow
   */
  static evaluateConditions(conditions: WorkflowCondition[], data: Record<string, any>): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every(condition => {
      const value = this.getNestedValue(data, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not_equals':
          return value !== condition.value;
        case 'contains':
          return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
        case 'greater_than':
          return Number(value) > Number(condition.value);
        case 'less_than':
          return Number(value) < Number(condition.value);
        case 'is_empty':
          return !value || value === '' || (Array.isArray(value) && value.length === 0);
        case 'is_not_empty':
          return value && value !== '' && (!Array.isArray(value) || value.length > 0);
        default:
          return false;
      }
    });
  }

  /**
   * Récupérer une valeur imbriquée
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  /**
   * Remplacer les variables dans un template
   */
  static replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, String(value ?? ''));
    }

    // Gérer les blocs conditionnels simples
    result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, content) => {
      return variables[varName] ? content : '';
    });

    // Gérer les boucles simples
    result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, varName, content) => {
      const array = variables[varName];
      if (!Array.isArray(array)) return '';
      return array.map(item => {
        let itemContent = content;
        if (typeof item === 'object') {
          for (const [key, val] of Object.entries(item)) {
            itemContent = itemContent.replace(new RegExp(`\\{\\{this\\.${key}\\}\\}`, 'g'), String(val));
          }
        } else {
          itemContent = itemContent.replace(/\{\{this\}\}/g, String(item));
        }
        return itemContent;
      }).join('');
    });

    return result;
  }

  /**
   * Générer un email à partir d'un template
   */
  static generateEmail(templateId: string, variables: Record<string, any>): { subject: string; html: string; text?: string } | null {
    const template = EMAIL_TEMPLATES[templateId];
    if (!template) return null;

    return {
      subject: this.replaceVariables(template.subject, variables),
      html: this.replaceVariables(template.htmlContent, variables),
      text: template.textContent ? this.replaceVariables(template.textContent, variables) : undefined
    };
  }

  /**
   * Créer les règles par défaut pour une nouvelle église
   */
  static getDefaultWorkflowRules(): Omit<WorkflowRule, 'id' | 'createdAt' | 'updatedAt'>[] {
    return [
      {
        name: 'Email de bienvenue',
        description: 'Envoyer un email de bienvenue aux nouveaux membres',
        trigger: { type: 'NEW_MEMBER' },
        conditions: [],
        actions: [
          { type: 'SEND_EMAIL', templateId: 'WELCOME_NEW_MEMBER', recipientType: 'user' },
          { type: 'SEND_NOTIFICATION', title: 'Nouveau membre', message: '{{firstName}} {{lastName}} a rejoint la communauté !', recipientType: 'role', role: 'ADMIN' }
        ],
        isActive: true,
        priority: 1,
        executionCount: 0
      },
      {
        name: 'Vœux d\'anniversaire',
        description: 'Envoyer des vœux d\'anniversaire automatiques',
        trigger: { type: 'BIRTHDAY', daysBeefore: 0 },
        conditions: [{ field: 'status', operator: 'equals', value: 'ACTIVE' }],
        actions: [
          { type: 'SEND_EMAIL', templateId: 'BIRTHDAY_WISH', recipientType: 'user' },
          { type: 'SEND_NOTIFICATION', title: '🎂 Anniversaire', message: 'C\'est l\'anniversaire de {{firstName}} !', recipientType: 'all' }
        ],
        isActive: true,
        priority: 2,
        executionCount: 0
      },
      {
        name: 'Reçu de don automatique',
        description: 'Envoyer un reçu par email après chaque don',
        trigger: { type: 'DONATION' },
        conditions: [{ field: 'status', operator: 'equals', value: 'COMPLETED' }],
        actions: [
          { type: 'SEND_EMAIL', templateId: 'DONATION_RECEIPT', recipientType: 'user' }
        ],
        isActive: true,
        priority: 1,
        executionCount: 0
      },
      {
        name: 'Rappel d\'absence',
        description: 'Contacter les membres absents depuis 3 semaines',
        trigger: { type: 'ABSENCE_DETECTED', consecutiveWeeks: 3 },
        conditions: [{ field: 'status', operator: 'equals', value: 'ACTIVE' }],
        actions: [
          { type: 'SEND_EMAIL', templateId: 'ABSENCE_REMINDER', recipientType: 'user' },
          { type: 'CREATE_TASK', title: 'Contacter {{firstName}} {{lastName}}', assignTo: 'PASTOR', dueInDays: 3 }
        ],
        isActive: true,
        priority: 3,
        executionCount: 0
      },
      {
        name: 'Notification nouveau témoignage',
        description: 'Notifier les administrateurs des nouveaux témoignages à valider',
        trigger: { type: 'TESTIMONY_SUBMITTED' },
        conditions: [],
        actions: [
          { type: 'SEND_NOTIFICATION', title: 'Nouveau témoignage', message: 'Un nouveau témoignage attend votre validation', recipientType: 'role', role: 'ADMIN' }
        ],
        isActive: true,
        priority: 2,
        executionCount: 0
      },
      {
        name: 'Notification nouvelle prière',
        description: 'Notifier la communauté des nouvelles intentions de prière',
        trigger: { type: 'PRAYER_SUBMITTED' },
        conditions: [{ field: 'isPublic', operator: 'equals', value: true }],
        actions: [
          { type: 'SEND_NOTIFICATION', title: '🙏 Nouvelle intention', message: '{{firstName}} a partagé une intention de prière', recipientType: 'all' }
        ],
        isActive: true,
        priority: 2,
        executionCount: 0
      }
    ];
  }
}

// ============================================================================
// SERVICE DE NOTIFICATIONS D'ANNIVERSAIRES
// ============================================================================

export class AnniversaryService {
  
  /**
   * Obtenir les anniversaires du jour
   */
  static getTodaysBirthdays(members: any[]): any[] {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    return members.filter(member => {
      if (!member.birthDate) return false;
      const birthDate = new Date(member.birthDate);
      return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay;
    });
  }

  /**
   * Obtenir les anniversaires à venir (prochains N jours)
   */
  static getUpcomingBirthdays(members: any[], days: number = 7): any[] {
    const today = new Date();
    const upcoming: any[] = [];

    for (const member of members) {
      if (!member.birthDate) continue;
      
      const birthDate = new Date(member.birthDate);
      const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
      
      // Si l'anniversaire est déjà passé cette année, prendre l'année prochaine
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }

      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil > 0 && daysUntil <= days) {
        upcoming.push({
          ...member,
          daysUntilBirthday: daysUntil,
          upcomingBirthday: thisYearBirthday,
          age: today.getFullYear() - birthDate.getFullYear() + (daysUntil === 0 ? 0 : 0)
        });
      }
    }

    return upcoming.sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
  }

  /**
   * Obtenir les anniversaires de membership du mois
   */
  static getMembershipAnniversaries(members: any[]): any[] {
    const today = new Date();
    const currentMonth = today.getMonth();

    return members.filter(member => {
      if (!member.membershipDate) return false;
      const joinDate = new Date(member.membershipDate);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() < today.getFullYear();
    }).map(member => {
      const joinDate = new Date(member.membershipDate);
      return {
        ...member,
        yearsOfMembership: today.getFullYear() - joinDate.getFullYear(),
        anniversaryDate: new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate())
      };
    });
  }

  /**
   * Calculer l'âge à partir de la date de naissance
   */
  static calculateAge(birthDate: Date | string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}

const workflowExports = {
  WorkflowService,
  AnniversaryService,
  EMAIL_TEMPLATES
};

export default workflowExports;
