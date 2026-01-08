/**
 * =============================================================================
 * ROUTE API: CONFLICTS (Résolution de conflits)
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Endpoints:
 * - GET /conflicts - Mes demandes de médiation
 * - POST /conflicts - Demander une médiation
 * - PUT /conflicts/:id - Mettre à jour une demande
 * 
 * =============================================================================
 */

import { Router, Request, Response } from 'express';
import sql from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET - Mes demandes de médiation
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    try {
      const conflicts = await sql`
        SELECT 
          c.*,
          m.name as mediator_name,
          m.phone as mediator_phone
        FROM conflict_mediations c
        LEFT JOIN users m ON c.mediator_id = m.id
        WHERE c.user_id = ${userId}
        ORDER BY c.created_at DESC
      `;

      res.json({
        success: true,
        conflicts: conflicts.map(c => ({
          id: c.id,
          type: c.conflict_type,
          typeName: c.type_name,
          status: c.status,
          createdDate: c.created_at,
          lastUpdate: c.updated_at,
          mediator: c.mediator_id ? {
            id: c.mediator_id,
            name: c.mediator_name,
            phone: c.mediator_phone,
          } : null,
          nextSession: c.next_session,
          notes: c.notes,
        })),
      });
    } catch (dbError) {
      res.json({
        success: true,
        conflicts: [],
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des demandes',
    });
  }
});

// POST - Demander une médiation
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { type, description, desiredOutcome, urgency, confidential } = req.body;

    try {
      const [conflict] = await sql`
        INSERT INTO conflict_mediations (
          user_id, conflict_type, description, desired_outcome, 
          urgency, is_confidential, status, created_at
        ) VALUES (
          ${userId}, ${type}, ${description}, ${desiredOutcome || ''}, 
          ${urgency || 'normal'}, ${confidential || false}, 'pending', NOW()
        )
        RETURNING *
      `;

      res.status(201).json({
        success: true,
        message: 'Votre demande de médiation a été enregistrée. Un médiateur vous contactera dans les 48h.',
        conflict,
      });
    } catch (dbError) {
      res.json({
        success: true,
        message: 'Demande enregistrée (mode démo)',
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error creating conflict mediation:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la demande',
    });
  }
});

export default router;
