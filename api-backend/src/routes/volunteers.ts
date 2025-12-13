/**
 * =============================================================================
 * ROUTE API: VOLUNTEERS (Bénévolat/Service)
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Endpoints:
 * - GET /volunteers/teams - Liste des équipes de service
 * - GET /volunteers/teams/:id - Détail d'une équipe
 * - POST /volunteers/teams - Créer une équipe (admin)
 * - PUT /volunteers/teams/:id - Modifier une équipe (admin)
 * - DELETE /volunteers/teams/:id - Supprimer une équipe (admin)
 * - POST /volunteers/register - S'inscrire comme bénévole
 * - GET /volunteers/registrations - Liste des inscriptions (admin)
 * - PUT /volunteers/registrations/:id - Approuver/Rejeter inscription (admin)
 * - GET /volunteers/my-registrations - Mes inscriptions
 * 
 * =============================================================================
 */

import { Router, Request, Response } from 'express';
import sql from '../config/database';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// GET - Liste des équipes de service
router.get('/teams', async (req: Request, res: Response) => {
  try {
    const teams = await sql`
      SELECT 
        st.*,
        u.name as leader_name,
        (SELECT COUNT(*) FROM volunteer_registrations vr 
         WHERE vr.team_id = st.id AND vr.status IN ('approved', 'active')) as member_count
      FROM service_teams st
      LEFT JOIN users u ON st.leader_id = u.id
      WHERE st.is_active = true
      ORDER BY st.name ASC
    `;

    res.json({
      success: true,
      data: teams,
      count: teams.length
    });
  } catch (error) {
    console.error('Error fetching service teams:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des équipes'
    });
  }
});

// GET - Détail d'une équipe
router.get('/teams/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [team] = await sql`
      SELECT 
        st.*,
        u.name as leader_name,
        u.email as leader_email
      FROM service_teams st
      LEFT JOIN users u ON st.leader_id = u.id
      WHERE st.id = ${id}
    `;

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Équipe non trouvée'
      });
    }

    // Récupérer les membres actifs
    const members = await sql`
      SELECT 
        vr.*,
        u.name as user_name,
        u.email as user_email
      FROM volunteer_registrations vr
      JOIN users u ON vr.user_id = u.id
      WHERE vr.team_id = ${id} AND vr.status IN ('approved', 'active')
      ORDER BY vr.approved_at DESC
    `;

    res.json({
      success: true,
      data: {
        ...team,
        members
      }
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'équipe'
    });
  }
});

// POST - Créer une équipe (admin)
router.post('/teams', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      icon,
      color,
      leader_id,
      max_members,
      meeting_schedule,
      requirements
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Le nom de l\'équipe est requis'
      });
    }

    const [newTeam] = await sql`
      INSERT INTO service_teams (
        name, description, icon, color, leader_id,
        max_members, meeting_schedule, requirements
      ) VALUES (
        ${name}, ${description}, ${icon}, ${color}, ${leader_id},
        ${max_members}, ${meeting_schedule}, ${requirements}
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      data: newTeam,
      message: 'Équipe créée avec succès'
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'équipe'
    });
  }
});

// PUT - Modifier une équipe (admin)
router.put('/teams/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      icon,
      color,
      leader_id,
      max_members,
      meeting_schedule,
      requirements,
      is_active
    } = req.body;

    const [updated] = await sql`
      UPDATE service_teams SET
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        icon = COALESCE(${icon}, icon),
        color = COALESCE(${color}, color),
        leader_id = COALESCE(${leader_id}, leader_id),
        max_members = COALESCE(${max_members}, max_members),
        meeting_schedule = COALESCE(${meeting_schedule}, meeting_schedule),
        requirements = COALESCE(${requirements}, requirements),
        is_active = COALESCE(${is_active}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Équipe non trouvée'
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Équipe modifiée avec succès'
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification de l\'équipe'
    });
  }
});

// DELETE - Supprimer une équipe (admin)
router.delete('/teams/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete - désactiver plutôt que supprimer
    const [deleted] = await sql`
      UPDATE service_teams SET is_active = false, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Équipe non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Équipe supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'équipe'
    });
  }
});

// POST - S'inscrire comme bénévole
router.post('/register', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { team_id, availability, motivation, experience } = req.body;

    if (!team_id) {
      return res.status(400).json({
        success: false,
        error: 'L\'équipe est requise'
      });
    }

    // Vérifier si l'équipe existe
    const [team] = await sql`SELECT * FROM service_teams WHERE id = ${team_id} AND is_active = true`;
    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Équipe non trouvée'
      });
    }

    // Vérifier si déjà inscrit
    const [existing] = await sql`
      SELECT * FROM volunteer_registrations 
      WHERE team_id = ${team_id} AND user_id = ${userId}
    `;

    if (existing && existing.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        error: 'Vous êtes déjà inscrit ou en attente pour cette équipe'
      });
    }

    // Créer ou mettre à jour l'inscription
    const [registration] = await sql`
      INSERT INTO volunteer_registrations (
        team_id, user_id, availability, motivation, experience, status
      ) VALUES (
        ${team_id}, ${userId}, ${availability || []}, ${motivation}, ${experience}, 'pending'
      )
      ON CONFLICT (team_id, user_id) 
      DO UPDATE SET 
        availability = ${availability || []},
        motivation = ${motivation},
        experience = ${experience},
        status = 'pending',
        applied_at = NOW()
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      data: registration,
      message: 'Demande d\'inscription envoyée avec succès'
    });
  } catch (error) {
    console.error('Error registering as volunteer:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'inscription'
    });
  }
});

// GET - Liste des inscriptions (admin)
router.get('/registrations', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const team_id = req.query.team_id as string | undefined;

    const registrations = await sql`
      SELECT 
        vr.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        st.name as team_name,
        approver.name as approver_name
      FROM volunteer_registrations vr
      JOIN users u ON vr.user_id = u.id
      JOIN service_teams st ON vr.team_id = st.id
      LEFT JOIN users approver ON vr.approved_by = approver.id
      WHERE 1=1
      ${status ? sql`AND vr.status = ${status}` : sql``}
      ${team_id ? sql`AND vr.team_id = ${team_id}` : sql``}
      ORDER BY vr.applied_at DESC
    `;

    res.json({
      success: true,
      data: registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des inscriptions'
    });
  }
});

// PUT - Approuver/Rejeter une inscription (admin)
router.put('/registrations/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = (req as any).user?.id;

    if (!['approved', 'rejected', 'active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Statut invalide'
      });
    }

    const [updated] = await sql`
      UPDATE volunteer_registrations SET
        status = ${status},
        notes = COALESCE(${notes}, notes),
        approved_at = ${status === 'approved' ? sql`NOW()` : sql`approved_at`},
        approved_by = ${status === 'approved' ? adminId : sql`approved_by`}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Inscription non trouvée'
      });
    }

    // Mettre à jour le compteur de l'équipe
    await sql`
      UPDATE service_teams SET current_members = (
        SELECT COUNT(*) FROM volunteer_registrations 
        WHERE team_id = ${updated.team_id} AND status IN ('approved', 'active')
      ) WHERE id = ${updated.team_id}
    `;

    res.json({
      success: true,
      data: updated,
      message: status === 'approved' ? 'Inscription approuvée' : 'Inscription mise à jour'
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour'
    });
  }
});

// GET - Mes inscriptions bénévoles
router.get('/my-registrations', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const registrations = await sql`
      SELECT 
        vr.*,
        st.name as team_name,
        st.description as team_description,
        st.icon as team_icon,
        st.color as team_color
      FROM volunteer_registrations vr
      JOIN service_teams st ON vr.team_id = st.id
      WHERE vr.user_id = ${userId}
      ORDER BY vr.applied_at DESC
    `;

    res.json({
      success: true,
      data: registrations
    });
  } catch (error) {
    console.error('Error fetching my registrations:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de vos inscriptions'
    });
  }
});

export default router;
