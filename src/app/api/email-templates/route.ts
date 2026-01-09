/**
 * API Routes - Email Templates Management
 * 
 * GET  /api/email-templates - Liste les templates d'emails
 * POST /api/email-templates - Créer un nouveau template
 */

import { NextRequest, NextResponse } from 'next/server';
import { EMAIL_TEMPLATES, WorkflowService } from '@/lib/services/workflow-service';

// Templates personnalisés (en plus des prédéfinis)
let customTemplates: any[] = [];
let templateIdCounter = 100;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeBuiltIn = searchParams.get('includeBuiltIn') !== 'false';

    let templates: any[] = [];

    // Templates prédéfinis
    if (includeBuiltIn) {
      templates = Object.entries(EMAIL_TEMPLATES).map(([key, template]) => ({
        ...template,
        key,
        isBuiltIn: true
      }));
    }

    // Templates personnalisés
    templates = [...templates, ...customTemplates.map(t => ({ ...t, isBuiltIn: false }))];

    // Filtrer par catégorie
    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    return NextResponse.json({
      success: true,
      data: templates,
      total: templates.length,
      categories: ['welcome', 'reminder', 'notification', 'report', 'celebration']
    });
  } catch (error) {
    console.error('[Email Templates GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name || !body.subject || !body.htmlContent) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes: name, subject et htmlContent sont requis' },
        { status: 400 }
      );
    }

    // Extraire les variables du template
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    while ((match = variableRegex.exec(body.htmlContent)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    const newTemplate = {
      id: `custom_template_${templateIdCounter++}`,
      name: body.name,
      subject: body.subject,
      htmlContent: body.htmlContent,
      textContent: body.textContent || null,
      variables,
      category: body.category || 'notification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    customTemplates.push(newTemplate);

    return NextResponse.json({
      success: true,
      message: 'Template créé avec succès',
      data: newTemplate
    }, { status: 201 });
  } catch (error) {
    console.error('[Email Templates POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du template' },
      { status: 500 }
    );
  }
}
