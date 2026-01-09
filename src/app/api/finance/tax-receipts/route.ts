/**
 * API Routes - Tax Receipts Management
 * 
 * GET  /api/finance/tax-receipts - Liste des reçus fiscaux
 * POST /api/finance/tax-receipts - Générer un reçu fiscal
 */

import { NextRequest, NextResponse } from 'next/server';
import { TaxReceiptService } from '@/lib/services/finance-service';

// Stockage temporaire
let taxReceipts: any[] = [];
let receiptSequence = 1;

// Initialiser avec des reçus de démonstration
if (taxReceipts.length === 0) {
  const currentYear = new Date().getFullYear();
  
  taxReceipts = [
    {
      id: 'receipt_1',
      receiptNumber: TaxReceiptService.generateReceiptNumber(currentYear - 1, 1),
      memberId: 'member_1',
      memberName: 'Jean Mukendi',
      memberAddress: 'Avenue Kalemie 45, Commune de Limete, Kinshasa, RD Congo',
      fiscalYear: currentYear - 1,
      totalAmount: 2400000,
      donations: [
        { date: new Date(currentYear - 1, 0, 15).toISOString(), amount: 200, type: 'Dîme' },
        { date: new Date(currentYear - 1, 1, 15).toISOString(), amount: 200, type: 'Dîme' },
        { date: new Date(currentYear - 1, 2, 15).toISOString(), amount: 200, type: 'Dîme' },
        { date: new Date(currentYear - 1, 3, 15).toISOString(), amount: 200, type: 'Dîme' },
        { date: new Date(currentYear - 1, 4, 15).toISOString(), amount: 200, type: 'Dîme' },
        { date: new Date(currentYear - 1, 5, 15).toISOString(), amount: 200, type: 'Dîme' },
        { date: new Date(currentYear - 1, 6, 15).toISOString(), amount: 200, type: 'Dîme' },
        { date: new Date(currentYear - 1, 7, 15).toISOString(), amount: 200, type: 'Dîme' },
        { date: new Date(currentYear - 1, 8, 15).toISOString(), amount: 200, type: 'Dîme' },
        { date: new Date(currentYear - 1, 9, 15).toISOString(), amount: 200, type: 'Dîme' },
        { date: new Date(currentYear - 1, 10, 15).toISOString(), amount: 200, type: 'Dîme' },
        { date: new Date(currentYear - 1, 11, 15).toISOString(), amount: 200, type: 'Dîme' }
      ],
      issuedAt: new Date(currentYear, 0, 15).toISOString(),
      emailSent: true,
      emailSentAt: new Date(currentYear, 0, 15).toISOString()
    }
  ];
  receiptSequence = 2;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const fiscalYear = searchParams.get('fiscalYear');

    let filteredReceipts = [...taxReceipts];

    if (memberId) {
      filteredReceipts = filteredReceipts.filter(r => r.memberId === memberId);
    }

    if (fiscalYear) {
      filteredReceipts = filteredReceipts.filter(r => r.fiscalYear === parseInt(fiscalYear));
    }

    // Trier par année (plus récent d'abord)
    filteredReceipts.sort((a, b) => b.fiscalYear - a.fiscalYear);

    // Ajouter les calculs de déduction fiscale
    const receiptsWithTax = filteredReceipts.map(receipt => ({
      ...receipt,
      taxBenefit: TaxReceiptService.calculateTaxDeductibleAmount(receipt.totalAmount)
    }));

    return NextResponse.json({
      success: true,
      data: receiptsWithTax,
      total: receiptsWithTax.length,
      availableYears: Array.from(new Set(taxReceipts.map(r => r.fiscalYear))).sort((a, b) => b - a)
    });
  } catch (error) {
    console.error('[Tax Receipts GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des reçus' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, memberName, memberAddress, fiscalYear, donations } = body;

    if (!memberId || !memberName || !memberAddress || !fiscalYear || !donations) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Vérifier si un reçu existe déjà pour ce membre et cette année
    const existing = taxReceipts.find(
      r => r.memberId === memberId && r.fiscalYear === fiscalYear
    );

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Un reçu existe déjà pour ce membre et cette année' },
        { status: 409 }
      );
    }

    // Calculer le total
    const totalAmount = donations.reduce((sum: number, d: any) => sum + d.amount, 0);

    const newReceipt = {
      id: `receipt_${Date.now()}`,
      receiptNumber: TaxReceiptService.generateReceiptNumber(fiscalYear, receiptSequence++),
      memberId,
      memberName,
      memberAddress,
      fiscalYear,
      totalAmount,
      donations: TaxReceiptService.aggregateDonationsForReceipt(donations, fiscalYear),
      issuedAt: new Date().toISOString(),
      emailSent: false
    };

    // Valider le reçu
    const validation = TaxReceiptService.validateReceipt(newReceipt as any);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Reçu invalide', details: validation.errors },
        { status: 400 }
      );
    }

    taxReceipts.push(newReceipt);

    return NextResponse.json({
      success: true,
      message: 'Reçu fiscal généré avec succès',
      data: {
        ...newReceipt,
        taxBenefit: TaxReceiptService.calculateTaxDeductibleAmount(totalAmount)
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[Tax Receipts POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du reçu' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiptId, action } = body;

    const index = taxReceipts.findIndex(r => r.id === receiptId);
    
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Reçu non trouvé' },
        { status: 404 }
      );
    }

    if (action === 'send_email') {
      // Simuler l'envoi d'email
      taxReceipts[index].emailSent = true;
      taxReceipts[index].emailSentAt = new Date().toISOString();

      return NextResponse.json({
        success: true,
        message: 'Reçu envoyé par email',
        data: taxReceipts[index]
      });
    }

    if (action === 'regenerate') {
      // Régénérer le reçu (par exemple après mise à jour des dons)
      const newReceiptNumber = TaxReceiptService.generateReceiptNumber(
        taxReceipts[index].fiscalYear,
        receiptSequence++
      );
      
      taxReceipts[index].receiptNumber = newReceiptNumber;
      taxReceipts[index].issuedAt = new Date().toISOString();
      taxReceipts[index].emailSent = false;
      delete taxReceipts[index].emailSentAt;

      return NextResponse.json({
        success: true,
        message: 'Reçu régénéré',
        data: taxReceipts[index]
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Tax Receipts PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
