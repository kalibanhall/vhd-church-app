import { Router, Response } from 'express';
import sql from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /members - Get all members (protected)
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const members = await sql`
      SELECT 
        id, nom, prenom, email, telephone, adresse, 
        ville, code_postal, pays, date_naissance, sexe,
        statut_matrimonial, profession, photo_url, role,
        date_adhesion, actif, created_at
      FROM membres
      WHERE actif = true
      ORDER BY nom, prenom
    `;

    res.json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des membres',
    });
  }
});

/**
 * GET /members/:id - Get member by ID
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const members = await sql`
      SELECT *
      FROM membres
      WHERE id = ${id}
      LIMIT 1
    `;

    if (members.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Membre non trouvé',
      });
      return;
    }

    res.json({
      success: true,
      data: members[0],
    });
  } catch (error: any) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du membre',
    });
  }
});

/**
 * POST /members - Create new member (admin only)
 */
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      nom, prenom, email, telephone, adresse,
      ville, code_postal, pays, date_naissance,
      sexe, statut_matrimonial, profession
    } = req.body;

    // Validation
    if (!nom || !prenom || !email) {
      res.status(400).json({
        success: false,
        error: 'Nom, prénom et email sont requis',
      });
      return;
    }

    const result = await sql`
      INSERT INTO membres (
        nom, prenom, email, telephone, adresse,
        ville, code_postal, pays, date_naissance,
        sexe, statut_matrimonial, profession, actif
      ) VALUES (
        ${nom}, ${prenom}, ${email}, ${telephone || null},
        ${adresse || null}, ${ville || null}, ${code_postal || null},
        ${pays || null}, ${date_naissance || null}, ${sexe || null},
        ${statut_matrimonial || null}, ${profession || null}, true
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      data: result[0],
      message: 'Membre créé avec succès',
    });
  } catch (error: any) {
    console.error('Error creating member:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du membre',
    });
  }
});

/**
 * PATCH /members/:id - Update member
 */
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Only admin can update other members
    if (req.user!.id !== id && req.user!.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Vous ne pouvez modifier que votre propre profil',
      });
      return;
    }

    const allowedFields = [
      'nom', 'prenom', 'email', 'telephone', 'adresse',
      'ville', 'code_postal', 'pays', 'date_naissance',
      'sexe', 'statut_matrimonial', 'profession', 'photo_url'
    ];

    const updates: Record<string, any> = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        error: 'Aucun champ valide à mettre à jour',
      });
      return;
    }

    const setClauses = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [id, ...Object.values(updates)];

    const result = await sql`
      UPDATE membres
      SET ${sql(updates)}
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Membre non trouvé',
      });
      return;
    }

    res.json({
      success: true,
      data: result[0],
      message: 'Membre mis à jour avec succès',
    });
  } catch (error: any) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du membre',
    });
  }
});

/**
 * DELETE /members/:id - Soft delete member (admin only)
 */
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await sql`
      UPDATE membres
      SET actif = false
      WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Membre non trouvé',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Membre désactivé avec succès',
    });
  } catch (error: any) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du membre',
    });
  }
});

export default router;
