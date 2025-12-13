/**
 * =============================================================================
 * ROUTE API: NOTES (Notes personnelles)
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Endpoints:
 * - GET /notes - Liste des notes de l'utilisateur
 * - GET /notes/:id - Détail d'une note
 * - POST /notes - Créer une note
 * - PUT /notes/:id - Modifier une note
 * - DELETE /notes/:id - Supprimer une note
 * - PUT /notes/:id/favorite - Toggle favori
 * 
 * =============================================================================
 */

import { Router, Request, Response } from 'express';
import sql from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// GET - Liste des notes de l'utilisateur
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const type = req.query.type as string | undefined;
    const favorite = req.query.favorite as string | undefined;
    const search = req.query.search as string | undefined;
    const limit = Number(req.query.limit) || 50;

    const notes = await sql`
      SELECT * FROM user_notes
      WHERE user_id = ${userId}
      ${type ? sql`AND type = ${type}` : sql``}
      ${favorite === 'true' ? sql`AND is_favorite = true` : sql``}
      ${search ? sql`AND (title ILIKE ${'%' + search + '%'} OR content ILIKE ${'%' + search + '%'})` : sql``}
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `;

    res.json({
      success: true,
      data: notes,
      count: notes.length
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des notes'
    });
  }
});

// GET - Détail d'une note
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const [note] = await sql`
      SELECT * FROM user_notes
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note non trouvée'
      });
    }

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la note'
    });
  }
});

// POST - Créer une note
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      title,
      content,
      type = 'personal',
      sermon_id,
      sermon_title,
      preacher,
      tags = []
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Le titre est requis'
      });
    }

    const [newNote] = await sql`
      INSERT INTO user_notes (
        user_id, title, content, type, sermon_id,
        sermon_title, preacher, tags
      ) VALUES (
        ${userId}, ${title}, ${content}, ${type}, ${sermon_id},
        ${sermon_title}, ${preacher}, ${tags}
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      data: newNote,
      message: 'Note créée avec succès'
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la note'
    });
  }
});

// PUT - Modifier une note
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const {
      title,
      content,
      type,
      sermon_id,
      sermon_title,
      preacher,
      tags
    } = req.body;

    const [updated] = await sql`
      UPDATE user_notes SET
        title = COALESCE(${title}, title),
        content = COALESCE(${content}, content),
        type = COALESCE(${type}, type),
        sermon_id = COALESCE(${sermon_id}, sermon_id),
        sermon_title = COALESCE(${sermon_title}, sermon_title),
        preacher = COALESCE(${preacher}, preacher),
        tags = COALESCE(${tags}, tags),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Note non trouvée'
      });
    }

    res.json({
      success: true,
      data: updated,
      message: 'Note modifiée avec succès'
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la modification de la note'
    });
  }
});

// DELETE - Supprimer une note
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const [deleted] = await sql`
      DELETE FROM user_notes
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING id
    `;

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Note non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Note supprimée avec succès'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de la note'
    });
  }
});

// PUT - Toggle favori
router.put('/:id/favorite', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const [updated] = await sql`
      UPDATE user_notes SET
        is_favorite = NOT is_favorite,
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Note non trouvée'
      });
    }

    res.json({
      success: true,
      data: updated,
      message: updated.is_favorite ? 'Ajouté aux favoris' : 'Retiré des favoris'
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour'
    });
  }
});

// GET - Statistiques des notes
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const [stats] = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE type = 'sermon') as sermon_notes,
        COUNT(*) FILTER (WHERE type = 'bible_study') as bible_study_notes,
        COUNT(*) FILTER (WHERE type = 'personal') as personal_notes,
        COUNT(*) FILTER (WHERE is_favorite = true) as favorites
      FROM user_notes
      WHERE user_id = ${userId}
    `;

    res.json({
      success: true,
      data: stats
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
