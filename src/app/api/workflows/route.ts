/**
 * API Routes - Workflows Management
 * 
 * GET  /api/workflows - Liste les workflows
 * POST /api/workflows - Créer un nouveau workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { WorkflowService } from '@/lib/services/workflow-service';

// Stockage temporaire (en production, utiliser la base de données)
let workflows: any[] = [];
let workflowIdCounter = 1;

// Initialiser avec les workflows par défaut
if (workflows.length === 0) {
  const defaults = WorkflowService.getDefaultWorkflowRules();
  workflows = defaults.map(rule => ({
    ...rule,
    id: `workflow_${workflowIdCounter++}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const triggerType = searchParams.get('triggerType');

    let filteredWorkflows = [...workflows];

    // Filtrer par statut actif
    if (isActive !== null) {
      filteredWorkflows = filteredWorkflows.filter(w => w.isActive === (isActive === 'true'));
    }

    // Filtrer par type de déclencheur
    if (triggerType) {
      filteredWorkflows = filteredWorkflows.filter(w => w.trigger.type === triggerType);
    }

    // Trier par priorité
    filteredWorkflows.sort((a, b) => a.priority - b.priority);

    return NextResponse.json({
      success: true,
      data: filteredWorkflows,
      total: filteredWorkflows.length,
      stats: {
        total: workflows.length,
        active: workflows.filter(w => w.isActive).length,
        inactive: workflows.filter(w => !w.isActive).length,
        byTriggerType: workflows.reduce((acc: Record<string, number>, w) => {
          acc[w.trigger.type] = (acc[w.trigger.type] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('[Workflows GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des workflows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || !body.trigger || !body.actions || body.actions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes: name, trigger et actions sont requis' },
        { status: 400 }
      );
    }

    const newWorkflow = {
      id: `workflow_${workflowIdCounter++}`,
      name: body.name,
      description: body.description || '',
      trigger: body.trigger,
      conditions: body.conditions || [],
      actions: body.actions,
      isActive: body.isActive !== false,
      priority: body.priority || workflows.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0
    };

    workflows.push(newWorkflow);

    return NextResponse.json({
      success: true,
      message: 'Workflow créé avec succès',
      data: newWorkflow
    }, { status: 201 });
  } catch (error) {
    console.error('[Workflows POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du workflow' },
      { status: 500 }
    );
  }
}
