/**
 * API Routes - Budget Management
 * 
 * GET  /api/finance/budgets - Liste des budgets
 * POST /api/finance/budgets - Créer un budget
 */

import { NextRequest, NextResponse } from 'next/server';
import { BudgetService } from '@/lib/services/finance-service';

// Stockage temporaire
let budgets: any[] = [];
let budgetIdCounter = 1;

// Initialiser avec un budget de démonstration
if (budgets.length === 0) {
  const currentYear = new Date().getFullYear();
  const demoBudget = {
    ...BudgetService.createDefaultBudget(currentYear),
    id: `budget_${budgetIdCounter++}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  };

  // Ajouter des valeurs de démonstration
  demoBudget.categories[0].plannedAmount = 84000; // Dîmes
  demoBudget.categories[0].actualAmount = 72500;
  demoBudget.categories[1].plannedAmount = 24000; // Offrandes
  demoBudget.categories[1].actualAmount = 21800;
  demoBudget.categories[2].plannedAmount = 12000; // Dons spéciaux
  demoBudget.categories[2].actualAmount = 15200;
  demoBudget.categories[3].plannedAmount = 48000; // Salaires
  demoBudget.categories[3].actualAmount = 44000;
  demoBudget.categories[4].plannedAmount = 24000; // Bâtiment
  demoBudget.categories[4].actualAmount = 22500;
  demoBudget.categories[5].plannedAmount = 18000; // Ministères
  demoBudget.categories[5].actualAmount = 14200;
  demoBudget.categories[6].plannedAmount = 12000; // Missions
  demoBudget.categories[6].actualAmount = 10800;
  demoBudget.categories[7].plannedAmount = 6000; // Admin
  demoBudget.categories[7].actualAmount = 5200;

  demoBudget.totalPlanned = 120000;
  demoBudget.totalActual = 109500;

  budgets.push(demoBudget);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear');
    const status = searchParams.get('status');

    let filteredBudgets = [...budgets];

    if (fiscalYear) {
      filteredBudgets = filteredBudgets.filter(b => b.fiscalYear === parseInt(fiscalYear));
    }

    if (status) {
      filteredBudgets = filteredBudgets.filter(b => b.status === status);
    }

    // Calculer les totaux pour chaque budget
    const budgetsWithTotals = filteredBudgets.map(budget => ({
      ...budget,
      totals: BudgetService.calculateBudgetTotals(budget),
      variances: BudgetService.analyzeBudgetVariances(budget)
    }));

    return NextResponse.json({
      success: true,
      data: budgetsWithTotals,
      total: budgetsWithTotals.length
    });
  } catch (error) {
    console.error('[Budgets GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, fiscalYear, description, categories } = body;

    if (!fiscalYear) {
      return NextResponse.json(
        { success: false, error: 'L\'année fiscale est requise' },
        { status: 400 }
      );
    }

    // Vérifier si un budget existe déjà pour cette année
    if (budgets.some(b => b.fiscalYear === fiscalYear)) {
      return NextResponse.json(
        { success: false, error: 'Un budget existe déjà pour cette année' },
        { status: 409 }
      );
    }

    const defaultBudget = BudgetService.createDefaultBudget(fiscalYear);
    
    const newBudget = {
      ...defaultBudget,
      id: `budget_${budgetIdCounter++}`,
      name: name || defaultBudget.name,
      description: description || defaultBudget.description,
      categories: categories || defaultBudget.categories,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    budgets.push(newBudget);

    return NextResponse.json({
      success: true,
      message: 'Budget créé avec succès',
      data: newBudget
    }, { status: 201 });
  } catch (error) {
    console.error('[Budgets POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du budget' },
      { status: 500 }
    );
  }
}
