/**
 * =============================================================================
 * SERVICE DE GESTION FINANCIÈRE AVANCÉE - MyChurchApp
 * =============================================================================
 * 
 * Fonctionnalités:
 * - Gestion des budgets
 * - Projets de financement
 * - Rapports fiscaux
 * - Promesses de dons
 * - Suivi des dépenses
 * - Réconciliation bancaire
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * @version 2.0.0
 * =============================================================================
 */

// Types
export interface Budget {
  id: string;
  name: string;
  description: string;
  fiscalYear: number;
  categories: BudgetCategory[];
  totalPlanned: number;
  totalActual: number;
  status: 'draft' | 'approved' | 'active' | 'closed';
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  plannedAmount: number;
  actualAmount: number;
  subcategories?: BudgetSubcategory[];
}

export interface BudgetSubcategory {
  id: string;
  name: string;
  plannedAmount: number;
  actualAmount: number;
}

export interface FundProject {
  id: string;
  name: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  startDate: Date;
  endDate?: Date;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  category: 'building' | 'mission' | 'equipment' | 'charity' | 'event' | 'other';
  image?: string;
  milestones: ProjectMilestone[];
  donors: ProjectDonor[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  targetAmount: number;
  description?: string;
  reachedAt?: Date;
}

export interface ProjectDonor {
  donorId: string;
  donorName: string;
  totalAmount: number;
  isAnonymous: boolean;
  lastDonation: Date;
}

export interface PledgeCommitment {
  id: string;
  memberId: string;
  memberName: string;
  projectId?: string;
  amount: number;
  frequency: 'once' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  fulfilledAmount: number;
  payments: PledgePayment[];
  nextDueDate?: Date;
  reminderEnabled: boolean;
  createdAt: Date;
}

export interface PledgePayment {
  id: string;
  amount: number;
  date: Date;
  transactionId?: string;
}

export interface TaxReceipt {
  id: string;
  receiptNumber: string;
  memberId: string;
  memberName: string;
  memberAddress: string;
  fiscalYear: number;
  totalAmount: number;
  donations: TaxReceiptDonation[];
  issuedAt: Date;
  downloadUrl?: string;
  emailSent: boolean;
  emailSentAt?: Date;
}

export interface TaxReceiptDonation {
  date: Date;
  amount: number;
  type: string;
  description?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  vendorName?: string;
  receiptUrl?: string;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  paymentMethod?: string;
  paymentDate?: Date;
  budgetId?: string;
  createdBy: string;
  createdAt: Date;
}

// ============================================================================
// SERVICE DE BUDGET
// ============================================================================

export class BudgetService {
  
  /**
   * Créer un budget par défaut pour une nouvelle année
   */
  static createDefaultBudget(fiscalYear: number): Omit<Budget, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      name: `Budget ${fiscalYear}`,
      description: `Budget prévisionnel pour l'année ${fiscalYear}`,
      fiscalYear,
      categories: [
        {
          id: 'income_tithes',
          name: 'Dîmes',
          type: 'income',
          plannedAmount: 0,
          actualAmount: 0
        },
        {
          id: 'income_offerings',
          name: 'Offrandes',
          type: 'income',
          plannedAmount: 0,
          actualAmount: 0
        },
        {
          id: 'income_donations',
          name: 'Dons spéciaux',
          type: 'income',
          plannedAmount: 0,
          actualAmount: 0
        },
        {
          id: 'expense_salaries',
          name: 'Salaires et charges',
          type: 'expense',
          plannedAmount: 0,
          actualAmount: 0,
          subcategories: [
            { id: 'sub_pastor', name: 'Pasteur', plannedAmount: 0, actualAmount: 0 },
            { id: 'sub_staff', name: 'Personnel', plannedAmount: 0, actualAmount: 0 },
            { id: 'sub_charges', name: 'Charges sociales', plannedAmount: 0, actualAmount: 0 }
          ]
        },
        {
          id: 'expense_building',
          name: 'Bâtiment et locaux',
          type: 'expense',
          plannedAmount: 0,
          actualAmount: 0,
          subcategories: [
            { id: 'sub_rent', name: 'Loyer', plannedAmount: 0, actualAmount: 0 },
            { id: 'sub_utilities', name: 'Charges', plannedAmount: 0, actualAmount: 0 },
            { id: 'sub_maintenance', name: 'Entretien', plannedAmount: 0, actualAmount: 0 }
          ]
        },
        {
          id: 'expense_ministry',
          name: 'Ministères',
          type: 'expense',
          plannedAmount: 0,
          actualAmount: 0,
          subcategories: [
            { id: 'sub_worship', name: 'Louange', plannedAmount: 0, actualAmount: 0 },
            { id: 'sub_youth', name: 'Jeunesse', plannedAmount: 0, actualAmount: 0 },
            { id: 'sub_children', name: 'Enfants', plannedAmount: 0, actualAmount: 0 }
          ]
        },
        {
          id: 'expense_missions',
          name: 'Missions',
          type: 'expense',
          plannedAmount: 0,
          actualAmount: 0
        },
        {
          id: 'expense_admin',
          name: 'Administration',
          type: 'expense',
          plannedAmount: 0,
          actualAmount: 0
        }
      ],
      totalPlanned: 0,
      totalActual: 0,
      status: 'draft'
    };
  }

  /**
   * Calculer les totaux du budget
   */
  static calculateBudgetTotals(budget: Budget): {
    totalIncomePlanned: number;
    totalIncomeActual: number;
    totalExpensePlanned: number;
    totalExpenseActual: number;
    balancePlanned: number;
    balanceActual: number;
    completionRate: number;
  } {
    let totalIncomePlanned = 0;
    let totalIncomeActual = 0;
    let totalExpensePlanned = 0;
    let totalExpenseActual = 0;

    for (const category of budget.categories) {
      if (category.type === 'income') {
        totalIncomePlanned += category.plannedAmount;
        totalIncomeActual += category.actualAmount;
      } else {
        totalExpensePlanned += category.plannedAmount;
        totalExpenseActual += category.actualAmount;
      }
    }

    return {
      totalIncomePlanned,
      totalIncomeActual,
      totalExpensePlanned,
      totalExpenseActual,
      balancePlanned: totalIncomePlanned - totalExpensePlanned,
      balanceActual: totalIncomeActual - totalExpenseActual,
      completionRate: totalIncomePlanned > 0 
        ? Math.round((totalIncomeActual / totalIncomePlanned) * 100) 
        : 0
    };
  }

  /**
   * Analyser les écarts budgétaires
   */
  static analyzeBudgetVariances(budget: Budget): Array<{
    category: string;
    type: 'income' | 'expense';
    planned: number;
    actual: number;
    variance: number;
    variancePercent: number;
    status: 'under' | 'on-track' | 'over';
  }> {
    return budget.categories.map(cat => {
      const variance = cat.actualAmount - cat.plannedAmount;
      const variancePercent = cat.plannedAmount > 0 
        ? (variance / cat.plannedAmount) * 100 
        : 0;

      let status: 'under' | 'on-track' | 'over';
      if (cat.type === 'income') {
        status = variancePercent < -10 ? 'under' : variancePercent > 10 ? 'over' : 'on-track';
      } else {
        status = variancePercent > 10 ? 'over' : variancePercent < -10 ? 'under' : 'on-track';
      }

      return {
        category: cat.name,
        type: cat.type,
        planned: cat.plannedAmount,
        actual: cat.actualAmount,
        variance,
        variancePercent: Math.round(variancePercent * 10) / 10,
        status
      };
    });
  }
}

// ============================================================================
// SERVICE DE PROJETS DE FINANCEMENT
// ============================================================================

export class FundProjectService {
  
  /**
   * Calculer la progression d'un projet
   */
  static calculateProgress(project: FundProject): {
    percentage: number;
    remaining: number;
    daysRemaining: number | null;
    averageDailyDonation: number;
    projectedCompletion: Date | null;
  } {
    const percentage = Math.min(100, Math.round((project.raisedAmount / project.goalAmount) * 100));
    const remaining = Math.max(0, project.goalAmount - project.raisedAmount);
    
    let daysRemaining: number | null = null;
    if (project.endDate) {
      const now = new Date();
      const end = new Date(project.endDate);
      daysRemaining = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Calculer la moyenne quotidienne
    const projectStart = new Date(project.startDate);
    const now = new Date();
    const daysActive = Math.max(1, Math.ceil((now.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));
    const averageDailyDonation = project.raisedAmount / daysActive;

    // Projection de complétion
    let projectedCompletion: Date | null = null;
    if (averageDailyDonation > 0 && remaining > 0) {
      const daysToComplete = remaining / averageDailyDonation;
      projectedCompletion = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000);
    }

    return {
      percentage,
      remaining,
      daysRemaining,
      averageDailyDonation: Math.round(averageDailyDonation * 100) / 100,
      projectedCompletion
    };
  }

  /**
   * Obtenir le statut visuel du projet
   */
  static getProjectStatus(project: FundProject): {
    color: string;
    label: string;
    icon: string;
  } {
    const statuses = {
      planning: { color: '#6b7280', label: 'En préparation', icon: '📋' },
      active: { color: '#10b981', label: 'En cours', icon: '🚀' },
      paused: { color: '#f59e0b', label: 'En pause', icon: '⏸️' },
      completed: { color: '#3b82f6', label: 'Terminé', icon: '✅' },
      cancelled: { color: '#ef4444', label: 'Annulé', icon: '❌' }
    };
    return statuses[project.status];
  }

  /**
   * Vérifier et mettre à jour les jalons
   */
  static checkMilestones(project: FundProject): ProjectMilestone[] {
    return project.milestones.map(milestone => {
      if (!milestone.reachedAt && project.raisedAmount >= milestone.targetAmount) {
        return { ...milestone, reachedAt: new Date() };
      }
      return milestone;
    });
  }
}

// ============================================================================
// SERVICE DE PROMESSES DE DONS
// ============================================================================

export class PledgeService {
  
  /**
   * Calculer le prochain paiement dû
   */
  static calculateNextDueDate(pledge: PledgeCommitment): Date {
    const lastPayment = pledge.payments.length > 0 
      ? new Date(Math.max(...pledge.payments.map(p => new Date(p.date).getTime())))
      : new Date(pledge.startDate);

    const next = new Date(lastPayment);

    switch (pledge.frequency) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
      case 'once':
      default:
        break;
    }

    return next;
  }

  /**
   * Calculer le taux de réalisation
   */
  static calculateFulfillmentRate(pledge: PledgeCommitment): {
    rate: number;
    expectedAmount: number;
    onTrack: boolean;
  } {
    const now = new Date();
    const start = new Date(pledge.startDate);
    const monthsElapsed = Math.max(1, 
      (now.getFullYear() - start.getFullYear()) * 12 + 
      (now.getMonth() - start.getMonth())
    );

    let expectedAmount = 0;
    switch (pledge.frequency) {
      case 'weekly':
        expectedAmount = pledge.amount * Math.floor(monthsElapsed * 4.33);
        break;
      case 'monthly':
        expectedAmount = pledge.amount * monthsElapsed;
        break;
      case 'quarterly':
        expectedAmount = pledge.amount * Math.floor(monthsElapsed / 3);
        break;
      case 'yearly':
        expectedAmount = pledge.amount * Math.floor(monthsElapsed / 12);
        break;
      case 'once':
        expectedAmount = pledge.amount;
        break;
    }

    const rate = expectedAmount > 0 
      ? Math.round((pledge.fulfilledAmount / expectedAmount) * 100) 
      : 0;

    return {
      rate,
      expectedAmount,
      onTrack: rate >= 80
    };
  }

  /**
   * Obtenir les promesses en retard
   */
  static getOverduePledges(pledges: PledgeCommitment[]): PledgeCommitment[] {
    const now = new Date();
    return pledges.filter(pledge => {
      if (pledge.status !== 'active') return false;
      const nextDue = this.calculateNextDueDate(pledge);
      return nextDue < now;
    });
  }
}

// ============================================================================
// SERVICE DE REÇUS FISCAUX
// ============================================================================

export class TaxReceiptService {
  
  /**
   * Générer un numéro de reçu unique
   */
  static generateReceiptNumber(fiscalYear: number, sequence: number): string {
    return `RF${fiscalYear}-${String(sequence).padStart(5, '0')}`;
  }

  /**
   * Agréger les dons pour un reçu fiscal
   */
  static aggregateDonationsForReceipt(
    donations: Array<{ date: Date; amount: number; type: string; description?: string }>,
    fiscalYear: number
  ): TaxReceiptDonation[] {
    return donations
      .filter(d => new Date(d.date).getFullYear() === fiscalYear)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Calculer le total éligible aux déductions fiscales
   */
  static calculateTaxDeductibleAmount(
    totalDonations: number,
    taxRate: number = 0.66, // Réduction d'impôt de 66% en France
    maxDeductible: number = 0.20 // Plafond de 20% du revenu
  ): {
    totalDonations: number;
    taxReduction: number;
    effectiveCost: number;
    message: string;
  } {
    const taxReduction = totalDonations * taxRate;
    const effectiveCost = totalDonations - taxReduction;

    return {
      totalDonations,
      taxReduction: Math.round(taxReduction * 100) / 100,
      effectiveCost: Math.round(effectiveCost * 100) / 100,
      message: `Votre don de ${totalDonations.toLocaleString()} FC a été enregistré. Merci pour votre générosité !`
    };
  }

  /**
   * Vérifier la conformité du reçu
   */
  static validateReceipt(receipt: TaxReceipt): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!receipt.receiptNumber) {
      errors.push('Numéro de reçu manquant');
    }

    if (!receipt.memberName || receipt.memberName.trim().length < 2) {
      errors.push('Nom du donateur invalide');
    }

    if (!receipt.memberAddress || receipt.memberAddress.trim().length < 10) {
      errors.push('Adresse du donateur incomplète');
    }

    if (receipt.totalAmount <= 0) {
      errors.push('Montant total invalide');
    }

    if (receipt.donations.length === 0) {
      errors.push('Aucun don enregistré');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

const financeExports = {
  BudgetService,
  FundProjectService,
  PledgeService,
  TaxReceiptService
};

export default financeExports;
