/**
 * API Routes - Email Template Preview
 * 
 * POST /api/email-templates/preview - Prévisualiser un template avec des données
 */

import { NextRequest, NextResponse } from 'next/server';
import { EMAIL_TEMPLATES, WorkflowService } from '@/lib/services/workflow-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, variables, customTemplate } = body;

    let result;

    if (customTemplate) {
      // Prévisualiser un template personnalisé
      result = {
        subject: WorkflowService.replaceVariables(customTemplate.subject, variables || {}),
        html: WorkflowService.replaceVariables(customTemplate.htmlContent, variables || {}),
        text: customTemplate.textContent 
          ? WorkflowService.replaceVariables(customTemplate.textContent, variables || {})
          : undefined
      };
    } else if (templateId) {
      // Prévisualiser un template existant
      result = WorkflowService.generateEmail(templateId, variables || {});
      
      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Template non trouvé' },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'templateId ou customTemplate requis' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Email Preview POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la prévisualisation' },
      { status: 500 }
    );
  }
}
