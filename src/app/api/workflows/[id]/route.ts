/**
 * API Routes - Individual Workflow Management
 * 
 * GET    /api/workflows/[id] - Détails d'un workflow
 * PATCH  /api/workflows/[id] - Modifier un workflow
 * DELETE /api/workflows/[id] - Supprimer un workflow
 */

import { NextRequest, NextResponse } from 'next/server';

// Note: En production, ces données seraient en base de données
// Cette implémentation utilise un stockage partagé avec la route principale
import '@/app/api/workflows/route';

// Stockage temporaire partagé
const getWorkflows = (): any[] => {
  // @ts-expect-error - Stockage global temporaire
  return globalThis.__workflows || [];
};

const setWorkflows = (data: any[]) => {
  // @ts-expect-error - Stockage global temporaire
  globalThis.__workflows = data;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workflows = getWorkflows();
    const workflow = workflows.find(w => w.id === id);

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('[Workflow GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du workflow' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const workflows = getWorkflows();
    const index = workflows.findIndex(w => w.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Workflow non trouvé' },
        { status: 404 }
      );
    }

    // Mettre à jour le workflow
    const updatedWorkflow = {
      ...workflows[index],
      ...body,
      id: workflows[index].id, // Empêcher la modification de l'ID
      createdAt: workflows[index].createdAt, // Préserver la date de création
      updatedAt: new Date().toISOString()
    };

    workflows[index] = updatedWorkflow;
    setWorkflows(workflows);

    return NextResponse.json({
      success: true,
      message: 'Workflow mis à jour avec succès',
      data: updatedWorkflow
    });
  } catch (error) {
    console.error('[Workflow PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du workflow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workflows = getWorkflows();
    const index = workflows.findIndex(w => w.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Workflow non trouvé' },
        { status: 404 }
      );
    }

    const deleted = workflows.splice(index, 1)[0];
    setWorkflows(workflows);

    return NextResponse.json({
      success: true,
      message: 'Workflow supprimé avec succès',
      data: deleted
    });
  } catch (error) {
    console.error('[Workflow DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du workflow' },
      { status: 500 }
    );
  }
}
