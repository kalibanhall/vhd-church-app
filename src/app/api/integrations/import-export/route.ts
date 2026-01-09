/**
 * API Routes - Import/Export Management
 * 
 * GET  /api/integrations/import-export - Statuts et templates
 * POST /api/integrations/import-export - Lancer import/export
 */

import { NextRequest, NextResponse } from 'next/server';
import { ImportExportService, ImportJob, ExportJob } from '@/lib/services/integration-service';

// Stockage temporaire
let importJobs: ImportJob[] = [];
let exportJobs: ExportJob[] = [];
let jobIdCounter = 1;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const jobId = searchParams.get('jobId');
    const jobType = searchParams.get('type'); // 'import' ou 'export'

    // Obtenir les templates d'export
    if (action === 'templates') {
      return NextResponse.json({
        success: true,
        data: ImportExportService.getExportTemplates()
      });
    }

    // Obtenir les champs d'import pour membres
    if (action === 'importFields') {
      const type = searchParams.get('dataType') || 'members';
      if (type === 'members') {
        return NextResponse.json({
          success: true,
          data: ImportExportService.getMemberImportFields()
        });
      }
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Obtenir le statut d'un job spécifique
    if (jobId) {
      const job = jobType === 'export' 
        ? exportJobs.find(j => j.id === jobId)
        : importJobs.find(j => j.id === jobId);
      
      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: job
      });
    }

    // Liste des jobs
    return NextResponse.json({
      success: true,
      data: {
        imports: importJobs.slice(-20), // 20 derniers
        exports: exportJobs.slice(-20)
      },
      stats: {
        totalImports: importJobs.length,
        totalExports: exportJobs.length,
        pendingJobs: [...importJobs, ...exportJobs].filter(j => j.status === 'processing').length
      }
    });
  } catch (error) {
    console.error('[Import/Export GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Lancer un import
    if (action === 'import') {
      const { type, data, mapping, options } = body;

      if (!type || !data || !mapping) {
        return NextResponse.json(
          { success: false, error: 'type, data et mapping sont requis' },
          { status: 400 }
        );
      }

      // Valider le mapping
      if (type === 'members') {
        const requiredFields = ImportExportService.getMemberImportFields()
          .filter(f => f.required)
          .map(f => f.field);
        
        const mappedTargets = Object.values(mapping) as string[];
        const missingRequired = requiredFields.filter(f => !mappedTargets.includes(f));
        
        if (missingRequired.length > 0) {
          return NextResponse.json(
            { success: false, error: `Champs requis non mappés: ${missingRequired.join(', ')}` },
            { status: 400 }
          );
        }
      }

      const importJob: ImportJob = {
        id: `imp_${jobIdCounter++}`,
        type,
        status: 'processing',
        fileName: body.fileName || 'import.csv',
        fileSize: JSON.stringify(data).length,
        totalRows: Array.isArray(data) ? data.length : 0,
        processedRows: 0,
        successRows: 0,
        errorRows: 0,
        errors: [],
        mapping,
        options: options || { skipDuplicates: true, updateExisting: false, dryRun: false },
        createdAt: new Date()
      };

      importJobs.push(importJob);

      // Simuler le traitement (dans un vrai scénario, ce serait asynchrone)
      const processedData: Array<{ success: boolean; row: number; error?: string }> = [];
      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          const row = data[i] as Record<string, string>;
          const validation = ImportExportService.validateImportRow(row, mapping, type);
          
          if (validation.valid) {
            processedData.push({ success: true, row: i + 1 });
            importJob.successRows++;
          } else {
            processedData.push({ success: false, row: i + 1, error: validation.errors.join('; ') });
            importJob.errorRows++;
            importJob.errors.push({ row: i + 1, message: validation.errors.join('; ') });
          }
          importJob.processedRows++;
        }
      }

      importJob.status = importJob.errorRows === importJob.totalRows ? 'failed' : 'completed';
      importJob.completedAt = new Date();

      return NextResponse.json({
        success: true,
        message: importJob.options.dryRun ? 'Simulation terminée' : 'Import terminé',
        data: {
          jobId: importJob.id,
          status: importJob.status,
          totalRows: importJob.totalRows,
          successRows: importJob.successRows,
          errorRows: importJob.errorRows,
          errors: importJob.errors.slice(0, 10) // Limiter les erreurs retournées
        }
      });
    }

    // Lancer un export
    if (action === 'export') {
      const { type, format, filters, columns, templateId } = body;

      if (!type || !format) {
        return NextResponse.json(
          { success: false, error: 'type et format sont requis' },
          { status: 400 }
        );
      }

      // Si un template est spécifié, utiliser ses colonnes
      let exportColumns = columns;
      if (templateId) {
        const template = ImportExportService.getExportTemplates().find(t => t.id === templateId);
        if (template) {
          exportColumns = template.columns;
        }
      }

      const exportJob: ExportJob = {
        id: `exp_${jobIdCounter++}`,
        type,
        status: 'processing',
        format,
        filters,
        columns: exportColumns,
        createdAt: new Date()
      };

      exportJobs.push(exportJob);

      // Simuler la génération de données d'export
      // Dans un vrai scénario, on irait chercher les données en base
      const sampleData = [
        { firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com', phone: '0612345678' },
        { firstName: 'Marie', lastName: 'Martin', email: 'marie@example.com', phone: '0623456789' },
        { firstName: 'Pierre', lastName: 'Durand', email: 'pierre@example.com', phone: '0634567890' }
      ];

      const exportData = ImportExportService.formatExportData(sampleData, format, exportColumns);
      
      exportJob.status = 'completed';
      exportJob.totalRecords = sampleData.length;
      exportJob.fileUrl = `/api/integrations/import-export/download?jobId=${exportJob.id}`;
      exportJob.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      exportJob.completedAt = new Date();

      return NextResponse.json({
        success: true,
        message: 'Export généré',
        data: {
          jobId: exportJob.id,
          status: exportJob.status,
          totalRecords: exportJob.totalRecords,
          format: exportJob.format,
          downloadUrl: exportJob.fileUrl,
          expiresAt: exportJob.expiresAt,
          // Pour le développement, inclure les données directement
          preview: exportData.substring(0, 500)
        }
      });
    }

    // Télécharger un export
    if (action === 'download') {
      const { jobId } = body;
      const job = exportJobs.find(j => j.id === jobId);

      if (!job) {
        return NextResponse.json(
          { success: false, error: 'Job non trouvé' },
          { status: 404 }
        );
      }

      if (job.status !== 'completed') {
        return NextResponse.json(
          { success: false, error: 'Export non terminé' },
          { status: 400 }
        );
      }

      if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Export expiré' },
          { status: 410 }
        );
      }

      // Générer le fichier
      const sampleData = [
        { firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com' },
        { firstName: 'Marie', lastName: 'Martin', email: 'marie@example.com' }
      ];

      const content = ImportExportService.formatExportData(sampleData, job.format, job.columns);
      
      return new NextResponse(content, {
        headers: {
          'Content-Type': job.format === 'json' ? 'application/json' : 'text/csv',
          'Content-Disposition': `attachment; filename="export-${job.type}-${job.id}.${job.format}"`
        }
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Import/Export POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'opération' },
      { status: 500 }
    );
  }
}
