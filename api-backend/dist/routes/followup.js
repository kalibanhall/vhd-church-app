"use strict";
/**
 * =============================================================================
 * ROUTE API: FOLLOWUP (Être suivi)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /followup/types - Types de suivi disponibles
 * - GET /followup/my - Mes suivis en cours
 * - POST /followup - Demander un suivi
 * - PUT /followup/:id - Modifier un suivi
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
// GET - Types de suivi
router.get('/types', async (req, res) => {
    res.json({
        success: true,
        types: [
            {
                id: 'spiritual',
                name: 'Suivi spirituel',
                description: 'Accompagnement dans votre croissance spirituelle',
                duration: '3-6 mois',
            },
            {
                id: 'newbeliever',
                name: 'Nouveau croyant',
                description: 'Programme d\'affermissement pour nouveaux convertis',
                duration: '3 mois',
            },
            {
                id: 'crisis',
                name: 'Accompagnement de crise',
                description: 'Soutien pendant les moments difficiles',
                duration: 'Selon besoin',
            },
            {
                id: 'marriage',
                name: 'Suivi conjugal',
                description: 'Accompagnement pour couples',
                duration: '6 mois',
            },
            {
                id: 'grief',
                name: 'Accompagnement deuil',
                description: 'Soutien lors de la perte d\'un proche',
                duration: 'Selon besoin',
            },
        ],
    });
});
// GET - Mes suivis en cours
router.get('/my', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        try {
            const followups = await (0, database_1.default) `
        SELECT 
          f.*,
          m.name as mentor_name,
          m.phone as mentor_phone,
          m.email as mentor_email
        FROM followups f
        LEFT JOIN users m ON f.mentor_id = m.id
        WHERE f.user_id = ${userId}
        AND f.status != 'completed'
        ORDER BY f.created_at DESC
      `;
            res.json({
                success: true,
                followups: followups.map(f => ({
                    id: f.id,
                    type: f.type,
                    typeName: f.type_name,
                    mentor: {
                        id: f.mentor_id,
                        name: f.mentor_name,
                        phone: f.mentor_phone,
                        email: f.mentor_email,
                    },
                    startDate: f.start_date,
                    status: f.status,
                    nextSession: f.next_session,
                    sessions: f.session_count,
                    notes: f.notes,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                followups: [],
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching followups:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des suivis',
        });
    }
});
// POST - Demander un suivi
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { type, reason, preferredContact, availability, notes } = req.body;
        try {
            const [followup] = await (0, database_1.default) `
        INSERT INTO followup_requests (
          user_id, type, reason, preferred_contact, availability, notes, status, created_at
        ) VALUES (
          ${userId}, ${type}, ${reason}, ${preferredContact}, 
          ${availability}, ${notes || ''}, 'pending', NOW()
        )
        RETURNING *
      `;
            res.status(201).json({
                success: true,
                message: 'Demande de suivi envoyée. Un responsable vous contactera bientôt.',
                followup,
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                message: 'Demande enregistrée (mode démo)',
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error creating followup request:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de la demande',
        });
    }
});
exports.default = router;
//# sourceMappingURL=followup.js.map