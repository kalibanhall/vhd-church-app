"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent une authentification
router.use(auth_1.authenticate);
// GET - Liste des notes de l'utilisateur
router.get('/', async (req, res) => {
    try {
        const userId = req.user?.id;
        const type = req.query.type;
        const favorite = req.query.favorite;
        const search = req.query.search;
        const limit = Number(req.query.limit) || 50;
        const notes = await (0, database_1.default) `
      SELECT * FROM user_notes
      WHERE user_id = ${userId}
      ${type ? (0, database_1.default) `AND type = ${type}` : (0, database_1.default) ``}
      ${favorite === 'true' ? (0, database_1.default) `AND is_favorite = true` : (0, database_1.default) ``}
      ${search ? (0, database_1.default) `AND (title ILIKE ${'%' + search + '%'} OR content ILIKE ${'%' + search + '%'})` : (0, database_1.default) ``}
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `;
        res.json({
            success: true,
            data: notes,
            count: notes.length
        });
    }
    catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des notes'
        });
    }
});
// GET - Détail d'une note
router.get('/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const [note] = await (0, database_1.default) `
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
    }
    catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de la note'
        });
    }
});
// POST - Créer une note
router.post('/', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { title, content, type = 'personal', sermon_id, sermon_title, preacher, tags = [] } = req.body;
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Le titre est requis'
            });
        }
        const [newNote] = await (0, database_1.default) `
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
    }
    catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de la note'
        });
    }
});
// PUT - Modifier une note
router.put('/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { title, content, type, sermon_id, sermon_title, preacher, tags } = req.body;
        const [updated] = await (0, database_1.default) `
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
    }
    catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la modification de la note'
        });
    }
});
// DELETE - Supprimer une note
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const [deleted] = await (0, database_1.default) `
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
    }
    catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression de la note'
        });
    }
});
// PUT - Toggle favori
router.put('/:id/favorite', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const [updated] = await (0, database_1.default) `
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
    }
    catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour'
        });
    }
});
// GET - Statistiques des notes
router.get('/stats/summary', async (req, res) => {
    try {
        const userId = req.user?.id;
        const [stats] = await (0, database_1.default) `
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
    }
    catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des statistiques'
        });
    }
});
exports.default = router;
//# sourceMappingURL=notes.js.map