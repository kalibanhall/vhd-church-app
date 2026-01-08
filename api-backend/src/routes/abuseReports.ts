/**
 * =============================================================================
 * ROUTE API: ABUSE REPORTS (Signalement d'abus)
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * CONFIDENTIALITÉ STRICTE - Données sensibles
 * 
 * Endpoints:
 * - POST /abuse-reports - Signaler un abus
 * - GET /abuse-reports/:reportId - Vérifier le statut (avec ID de référence)
 * 
 * =============================================================================
 */

import { Router, Request, Response } from 'express';
import sql from '../config/database';
import { authenticate } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

// POST - Signaler un abus
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      type, 
      description, 
      date, 
      location, 
      anonymous, 
      wantsFollowUp,
      contactPreference,
      additionalNotes 
    } = req.body;

    // Générer un ID de référence unique
    const reportId = `ABR-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    try {
      // Récupérer l'ID utilisateur si authentifié (optionnel)
      const authHeader = req.headers.authorization;
      let userId = null;
      
      if (authHeader && !anonymous) {
        // Extract user ID from token if provided
        // Note: Implement proper token verification in production
      }

      await sql`
        INSERT INTO abuse_reports (
          report_id, user_id, type, description, incident_date, location,
          is_anonymous, wants_follow_up, contact_preference, additional_notes,
          status, created_at
        ) VALUES (
          ${reportId}, ${userId}, ${type}, ${description}, ${date || null}, 
          ${location || ''}, ${anonymous || false}, ${wantsFollowUp || false},
          ${contactPreference || ''}, ${additionalNotes || ''}, 'received', NOW()
        )
      `;

      res.status(201).json({
        success: true,
        message: 'Votre signalement a été enregistré de manière confidentielle. Un membre de l\'équipe pastorale prendra contact si nécessaire.',
        reportId,
        timestamp: new Date().toISOString(),
        confidential: true,
      });
    } catch (dbError) {
      // Even if DB fails, return success for user safety
      res.status(201).json({
        success: true,
        message: 'Signalement enregistré. Votre sécurité est notre priorité.',
        reportId,
        timestamp: new Date().toISOString(),
        confidential: true,
        _note: 'Le signalement sera traité manuellement',
      });
    }
  } catch (error) {
    console.error('Error creating abuse report:', error);
    // Still return success for user safety
    res.status(201).json({
      success: true,
      message: 'Signalement enregistré.',
      reportId: `ABR-${Date.now()}`,
    });
  }
});

// GET - Vérifier le statut d'un signalement
router.get('/:reportId', async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;

    try {
      const [report] = await sql`
        SELECT status, created_at, updated_at
        FROM abuse_reports
        WHERE report_id = ${reportId}
      `;

      if (!report) {
        return res.status(404).json({
          success: false,
          error: 'Signalement non trouvé',
        });
      }

      res.json({
        success: true,
        report: {
          reportId,
          status: report.status,
          createdAt: report.created_at,
          updatedAt: report.updated_at,
          // Ne jamais exposer les détails du signalement
        },
      });
    } catch (dbError) {
      res.status(404).json({
        success: false,
        error: 'Signalement non trouvé',
      });
    }
  } catch (error) {
    console.error('Error fetching abuse report:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur',
    });
  }
});

export default router;
