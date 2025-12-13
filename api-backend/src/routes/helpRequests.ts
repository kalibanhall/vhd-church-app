/**
 * =============================================================================
 * ROUTE API: HELP REQUESTS (Demandes d'aide)
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Endpoints:
 * - GET /help-requests - Liste des demandes (admin: toutes, user: les siennes)
 * - GET /help-requests/:id - Détail d'une demande
 * - POST /help-requests - Créer une demande
 * - PUT /help-requests/:id - Modifier une demande
 * - DELETE /help-requests/:id - Annuler une demande
 * - PUT /help-requests/:id/assign - Assigner une demande (admin)
 * - PUT /help-requests/:id/respond - Répondre à une demande (admin)
 * 
 * =============================================================================
 */

import { Router, Request, Response } from 'express';
import sql from '../config/database';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// GET - Liste des demandes
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    const urgency = req.query.urgency as string | undefined;

    // Admin voit toutes les demandes, utilisateur voit les siennes
    const isAdmin = userRole === 'ADMIN' || userRole === 'PASTOR';

    const requests = await sql`
      SELECT 
        hr.*,
        CASE WHEN hr.is_anonymous THEN 'Anonyme' ELSE u.name END as requester_name,
        CASE WHEN hr.is_anonymous THEN NULL ELSE u.email END as requester_email,
        assigned.name as assigned_to_name
      FROM help_requests hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN users assigned ON hr.assigned_to = assigned.id
      WHERE 1=1
      ${!isAdmin ? sql`AND hr.user_id = ${userId}` : sql``}
      ${status ? sql`AND hr.status = ${status}` : sql``}
      ${type ? sql`AND hr.type = ${type}` : sql``}
      ${urgency ? sql`AND hr.urgency = ${urgency}` : sql``}
      ORDER BY 
        CASE hr.urgency WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        hr.created_at DESC
    `;

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Error fetching help requests:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des demandes'
    });
  }
});

// GET - Détail d'une demande
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const isAdmin = userRole === 'ADMIN' || userRole === 'PASTOR';

    const [request] = await sql`
      SELECT 
        hr.*,
        CASE WHEN hr.is_anonymous AND ${!isAdmin} THEN 'Anonyme' ELSE u.name END as requester_name,
        CASE WHEN hr.is_anonymous AND ${!isAdmin} THEN NULL ELSE u.email END as requester_email,
        CASE WHEN hr.is_anonymous AND ${!isAdmin} THEN NULL ELSE u.phone END as requester_phone,
        assigned.name as assigned_to_display_name
      FROM help_requests hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN users assigned ON hr.assigned_to = assigned.id
      WHERE hr.id = ${id}
      ${!isAdmin ? sql`AND hr.user_id = ${userId}` : sql``}
    `;

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching help request:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la demande'
    });
  }
});

// POST - Créer une demande
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      type,
      title,
      description,
      urgency = 'medium',
      is_anonymous = false,
      contact_preference,
      phone,
      email
    } = req.body;

    if (!type || !title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Le type, titre et description sont requis'
      });
    }

    const [newRequest] = await sql`
      INSERT INTO help_requests (
        user_id, type, title, description, urgency,
        is_anonymous, contact_preference, phone, email
      ) VALUES (
        ${userId}, ${type}, ${title}, ${description}, ${urgency},
        ${is_anonymous}, ${contact_preference}, ${phone}, ${email}
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      data: newRequest,
      message: 'Demande envoyée avec succès. Nous vous contacterons bientôt.'
    });
  } catch (error) {
    console.error('Error creating help request:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi de la demande'
    });
  }
});

// PUT - Modifier une demande (utilisateur peut modifier si pending)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const {
      title,
      description,
      urgency,
      contact_preference,
      phone,
      email
    } = req.body;

    // Vérifier que c'est sa demande et qu'elle est encore pending
    const [existing] = await sql`
      SELECT * FROM help_requests WHERE id = ${id} AND user_id = ${userId}
    `;

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }

    if (existing.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Impossible de modifier une demande déjà en cours de traitement'
      });
    }

    const [updated] = await sql`
      UPDATE help_requests SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        urgency = COALESCE(${urgency}, urgency),
        contact_preference = COALESCE(${contact_preference}, contact_preference),
        phone = COALESCE(${phone}, phone),
        email = COALESCE(${email}, email),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({
      success: true,
      data: updated,
      message: 'Demande modifiée avec succès'
    });
  } catch (error) {
    console.error('Error updating help request:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification'
    });
  }
});

// DELETE - Annuler une demande (soft delete - change status)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const [updated] = await sql`
      UPDATE help_requests SET
        status = 'cancelled',
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId} AND status = 'pending'
      RETURNING id
    `;

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée ou ne peut plus être annulée'
      });
    }

    res.json({
      success: true,
      message: 'Demande annulée'
    });
  } catch (error) {
    console.error('Error cancelling help request:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'annulation'
    });
  }
});

// PUT - Assigner une demande (admin)
router.put('/:id/assign', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assigned_to } = req.body;

    // Récupérer le nom de la personne assignée
    let assignedName = null;
    if (assigned_to) {
      const [user] = await sql`SELECT name FROM users WHERE id = ${assigned_to}`;
      assignedName = user?.name;
    }

    const [updated] = await sql`
      UPDATE help_requests SET
        assigned_to = ${assigned_to},
        assigned_to_name = ${assignedName},
        status = 'in_progress',
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Demande assignée avec succès'
    });
  } catch (error) {
    console.error('Error assigning help request:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'assignation'
    });
  }
});

// PUT - Répondre à une demande (admin)
router.put('/:id/respond', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { response, status = 'in_progress' } = req.body;

    const [updated] = await sql`
      UPDATE help_requests SET
        response = ${response},
        status = ${status},
        resolved_at = ${status === 'completed' ? sql`NOW()` : sql`NULL`},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Demande non trouvée'
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Réponse enregistrée'
    });
  } catch (error) {
    console.error('Error responding to help request:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi de la réponse'
    });
  }
});

// GET - Statistiques (admin)
router.get('/admin/stats', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const [stats] = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE urgency = 'high' AND status != 'completed') as urgent_pending
      FROM help_requests
    `;

    // Répartition par type
    const byType = await sql`
      SELECT type, COUNT(*) as count
      FROM help_requests
      GROUP BY type
      ORDER BY count DESC
    `;

    res.json({
      success: true,
      data: {
        ...stats,
        by_type: byType
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

export default router;
