"use strict";
/**
 * =============================================================================
 * ROUTE API: ACTIVITIES (Activités/Événements)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /activities - Liste des activités
 * - GET /activities/:id - Détail d'une activité
 * - POST /activities - Créer une activité (admin)
 * - PUT /activities/:id - Modifier une activité (admin)
 * - DELETE /activities/:id - Supprimer une activité (admin)
 * - POST /activities/:id/register - S'inscrire à une activité
 * - DELETE /activities/:id/register - Se désinscrire
 * - GET /activities/:id/registrations - Liste des inscriptions (admin)
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
// GET - Liste des activités
router.get('/', async (req, res) => {
    try {
        const type = req.query.type;
        const status = req.query.status;
        const upcoming = req.query.upcoming;
        const limit = Number(req.query.limit) || 50;
        let query = (0, database_1.default) `
      SELECT 
        a.*,
        u.name as creator_name,
        (SELECT COUNT(*) FROM activity_registrations ar WHERE ar.activity_id = a.id) as registration_count
      FROM activities a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE 1=1
    `;
        // Filtres
        const conditions = [];
        if (type) {
            conditions.push((0, database_1.default) `AND a.type = ${type}`);
        }
        if (status) {
            conditions.push((0, database_1.default) `AND a.status = ${status}`);
        }
        if (upcoming === 'true') {
            conditions.push((0, database_1.default) `AND a.start_date >= NOW()`);
        }
        // Construction de la requête finale
        const activities = await (0, database_1.default) `
      SELECT 
        a.*,
        u.name as creator_name,
        (SELECT COUNT(*) FROM activity_registrations ar WHERE ar.activity_id = a.id) as registration_count
      FROM activities a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE 1=1
      ${type ? (0, database_1.default) `AND a.type = ${type}` : (0, database_1.default) ``}
      ${status ? (0, database_1.default) `AND a.status = ${status}` : (0, database_1.default) ``}
      ${upcoming === 'true' ? (0, database_1.default) `AND a.start_date >= NOW()` : (0, database_1.default) ``}
      ORDER BY a.start_date ASC
      LIMIT ${limit}
    `;
        res.json({
            success: true,
            data: activities,
            count: activities.length
        });
    }
    catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des activités'
        });
    }
});
// GET - Détail d'une activité
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [activity] = await (0, database_1.default) `
      SELECT 
        a.*,
        u.name as creator_name,
        (SELECT COUNT(*) FROM activity_registrations ar WHERE ar.activity_id = a.id) as registration_count
      FROM activities a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = ${id}
    `;
        if (!activity) {
            return res.status(404).json({
                success: false,
                error: 'Activité non trouvée'
            });
        }
        res.json({
            success: true,
            data: activity
        });
    }
    catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de l\'activité'
        });
    }
});
// POST - Créer une activité (admin)
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { title, description, type = 'event', location, start_date, end_date, all_day = false, max_participants, image_url, is_recurring = false, recurrence_pattern, registration_required = false, registration_deadline } = req.body;
        if (!title || !start_date) {
            return res.status(400).json({
                success: false,
                error: 'Le titre et la date de début sont requis'
            });
        }
        const userId = req.user?.id;
        const [newActivity] = await (0, database_1.default) `
      INSERT INTO activities (
        title, description, type, location, start_date, end_date,
        all_day, max_participants, image_url, is_recurring,
        recurrence_pattern, registration_required, registration_deadline,
        created_by, status
      ) VALUES (
        ${title}, ${description}, ${type}, ${location}, ${start_date}, ${end_date},
        ${all_day}, ${max_participants}, ${image_url}, ${is_recurring},
        ${recurrence_pattern}, ${registration_required}, ${registration_deadline},
        ${userId}, 'upcoming'
      )
      RETURNING *
    `;
        res.status(201).json({
            success: true,
            data: newActivity,
            message: 'Activité créée avec succès'
        });
    }
    catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de l\'activité'
        });
    }
});
// PUT - Modifier une activité (admin)
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type, location, start_date, end_date, all_day, max_participants, image_url, is_recurring, recurrence_pattern, status, registration_required, registration_deadline } = req.body;
        const [updated] = await (0, database_1.default) `
      UPDATE activities SET
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        type = COALESCE(${type}, type),
        location = COALESCE(${location}, location),
        start_date = COALESCE(${start_date}, start_date),
        end_date = COALESCE(${end_date}, end_date),
        all_day = COALESCE(${all_day}, all_day),
        max_participants = COALESCE(${max_participants}, max_participants),
        image_url = COALESCE(${image_url}, image_url),
        is_recurring = COALESCE(${is_recurring}, is_recurring),
        recurrence_pattern = COALESCE(${recurrence_pattern}, recurrence_pattern),
        status = COALESCE(${status}, status),
        registration_required = COALESCE(${registration_required}, registration_required),
        registration_deadline = COALESCE(${registration_deadline}, registration_deadline),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
        if (!updated) {
            return res.status(404).json({
                success: false,
                error: 'Activité non trouvée'
            });
        }
        res.json({
            success: true,
            data: updated,
            message: 'Activité modifiée avec succès'
        });
    }
    catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la modification de l\'activité'
        });
    }
});
// DELETE - Supprimer une activité (admin)
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const [deleted] = await (0, database_1.default) `
      DELETE FROM activities WHERE id = ${id} RETURNING id
    `;
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Activité non trouvée'
            });
        }
        res.json({
            success: true,
            message: 'Activité supprimée avec succès'
        });
    }
    catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression de l\'activité'
        });
    }
});
// POST - S'inscrire à une activité
router.post('/:id/register', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        // Vérifier si l'activité existe et accepte les inscriptions
        const [activity] = await (0, database_1.default) `
      SELECT * FROM activities WHERE id = ${id}
    `;
        if (!activity) {
            return res.status(404).json({
                success: false,
                error: 'Activité non trouvée'
            });
        }
        // Vérifier le nombre max de participants
        if (activity.max_participants) {
            const [{ count }] = await (0, database_1.default) `
        SELECT COUNT(*) as count FROM activity_registrations 
        WHERE activity_id = ${id} AND status != 'cancelled'
      `;
            if (count >= activity.max_participants) {
                return res.status(400).json({
                    success: false,
                    error: 'Cette activité est complète'
                });
            }
        }
        // Créer l'inscription
        const [registration] = await (0, database_1.default) `
      INSERT INTO activity_registrations (activity_id, user_id, status)
      VALUES (${id}, ${userId}, 'registered')
      ON CONFLICT (activity_id, user_id) 
      DO UPDATE SET status = 'registered', registered_at = NOW()
      RETURNING *
    `;
        // Mettre à jour le compteur
        await (0, database_1.default) `
      UPDATE activities SET current_participants = (
        SELECT COUNT(*) FROM activity_registrations 
        WHERE activity_id = ${id} AND status = 'registered'
      ) WHERE id = ${id}
    `;
        res.json({
            success: true,
            data: registration,
            message: 'Inscription réussie'
        });
    }
    catch (error) {
        console.error('Error registering for activity:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'inscription'
        });
    }
});
// DELETE - Se désinscrire d'une activité
router.delete('/:id/register', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        await (0, database_1.default) `
      UPDATE activity_registrations 
      SET status = 'cancelled' 
      WHERE activity_id = ${id} AND user_id = ${userId}
    `;
        // Mettre à jour le compteur
        await (0, database_1.default) `
      UPDATE activities SET current_participants = (
        SELECT COUNT(*) FROM activity_registrations 
        WHERE activity_id = ${id} AND status = 'registered'
      ) WHERE id = ${id}
    `;
        res.json({
            success: true,
            message: 'Désinscription réussie'
        });
    }
    catch (error) {
        console.error('Error unregistering from activity:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la désinscription'
        });
    }
});
// GET - Liste des inscriptions d'une activité (admin)
router.get('/:id/registrations', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const registrations = await (0, database_1.default) `
      SELECT 
        ar.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM activity_registrations ar
      JOIN users u ON ar.user_id = u.id
      WHERE ar.activity_id = ${id}
      ORDER BY ar.registered_at DESC
    `;
        res.json({
            success: true,
            data: registrations,
            count: registrations.length
        });
    }
    catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des inscriptions'
        });
    }
});
// GET - Mes inscriptions
router.get('/user/registrations', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const registrations = await (0, database_1.default) `
      SELECT 
        ar.*,
        a.title as activity_title,
        a.type as activity_type,
        a.start_date,
        a.end_date,
        a.location
      FROM activity_registrations ar
      JOIN activities a ON ar.activity_id = a.id
      WHERE ar.user_id = ${userId}
      ORDER BY a.start_date DESC
    `;
        res.json({
            success: true,
            data: registrations
        });
    }
    catch (error) {
        console.error('Error fetching user registrations:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de vos inscriptions'
        });
    }
});
exports.default = router;
//# sourceMappingURL=activities.js.map