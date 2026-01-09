"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET - Liste des demandes
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const status = req.query.status;
        const type = req.query.type;
        const urgency = req.query.urgency;
        // Admin voit toutes les demandes, utilisateur voit les siennes
        const isAdmin = userRole === 'ADMIN' || userRole === 'PASTOR';
        const requests = await (0, database_1.default) `
      SELECT 
        hr.*,
        CASE WHEN hr.is_anonymous THEN 'Anonyme' ELSE u.name END as requester_name,
        CASE WHEN hr.is_anonymous THEN NULL ELSE u.email END as requester_email,
        assigned.name as assigned_to_name
      FROM help_requests hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN users assigned ON hr.assigned_to = assigned.id
      WHERE 1=1
      ${!isAdmin ? (0, database_1.default) `AND hr.user_id = ${userId}` : (0, database_1.default) ``}
      ${status ? (0, database_1.default) `AND hr.status = ${status}` : (0, database_1.default) ``}
      ${type ? (0, database_1.default) `AND hr.type = ${type}` : (0, database_1.default) ``}
      ${urgency ? (0, database_1.default) `AND hr.urgency = ${urgency}` : (0, database_1.default) ``}
      ORDER BY 
        CASE hr.urgency WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
        hr.created_at DESC
    `;
        res.json({
            success: true,
            data: requests,
            count: requests.length
        });
    }
    catch (error) {
        console.error('Error fetching help requests:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des demandes'
        });
    }
});
// GET - Détail d'une demande
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const isAdmin = userRole === 'ADMIN' || userRole === 'PASTOR';
        const [request] = await (0, database_1.default) `
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
      ${!isAdmin ? (0, database_1.default) `AND hr.user_id = ${userId}` : (0, database_1.default) ``}
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
    }
    catch (error) {
        console.error('Error fetching help request:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de la demande'
        });
    }
});
// POST - Créer une demande
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { type, title, description, urgency = 'medium', is_anonymous = false, contact_preference, phone, email } = req.body;
        if (!type || !title || !description) {
            return res.status(400).json({
                success: false,
                error: 'Le type, titre et description sont requis'
            });
        }
        const [newRequest] = await (0, database_1.default) `
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
    }
    catch (error) {
        console.error('Error creating help request:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'envoi de la demande'
        });
    }
});
// PUT - Modifier une demande (utilisateur peut modifier si pending)
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { title, description, urgency, contact_preference, phone, email } = req.body;
        // Vérifier que c'est sa demande et qu'elle est encore pending
        const [existing] = await (0, database_1.default) `
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
        const [updated] = await (0, database_1.default) `
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
    }
    catch (error) {
        console.error('Error updating help request:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la modification'
        });
    }
});
// DELETE - Annuler une demande (soft delete - change status)
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const [updated] = await (0, database_1.default) `
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
    }
    catch (error) {
        console.error('Error cancelling help request:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'annulation'
        });
    }
});
// PUT - Assigner une demande (admin)
router.put('/:id/assign', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { assigned_to } = req.body;
        // Récupérer le nom de la personne assignée
        let assignedName = null;
        if (assigned_to) {
            const [user] = await (0, database_1.default) `SELECT name FROM users WHERE id = ${assigned_to}`;
            assignedName = user?.name;
        }
        const [updated] = await (0, database_1.default) `
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
    }
    catch (error) {
        console.error('Error assigning help request:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'assignation'
        });
    }
});
// PUT - Répondre à une demande (admin)
router.put('/:id/respond', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { response, status = 'in_progress' } = req.body;
        const [updated] = await (0, database_1.default) `
      UPDATE help_requests SET
        response = ${response},
        status = ${status},
        resolved_at = ${status === 'completed' ? (0, database_1.default) `NOW()` : (0, database_1.default) `NULL`},
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
    }
    catch (error) {
        console.error('Error responding to help request:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'envoi de la réponse'
        });
    }
});
// GET - Statistiques (admin)
router.get('/admin/stats', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const [stats] = await (0, database_1.default) `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE urgency = 'high' AND status != 'completed') as urgent_pending
      FROM help_requests
    `;
        // Répartition par type
        const byType = await (0, database_1.default) `
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
//# sourceMappingURL=helpRequests.js.map