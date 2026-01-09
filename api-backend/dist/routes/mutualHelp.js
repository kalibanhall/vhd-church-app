"use strict";
/**
 * =============================================================================
 * ROUTE API: MUTUAL HELP (S'entraider)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /mutual-help - Liste des demandes/offres d'aide
 * - GET /mutual-help/:id - Détail d'une demande
 * - POST /mutual-help - Créer une demande/offre
 * - POST /mutual-help/:id/respond - Répondre à une demande
 * - PUT /mutual-help/:id - Modifier
 * - DELETE /mutual-help/:id - Supprimer
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
// GET - Liste des demandes/offres
router.get('/', async (req, res) => {
    try {
        const type = req.query.type;
        const category = req.query.category;
        try {
            const posts = await (0, database_1.default) `
        SELECT 
          mh.*,
          u.name as user_name,
          u.phone as user_phone,
          (SELECT COUNT(*) FROM mutual_help_responses WHERE help_id = mh.id) as response_count
        FROM mutual_help mh
        LEFT JOIN users u ON mh.user_id = u.id
        WHERE mh.status != 'closed'
        ${type && type !== 'all' ? (0, database_1.default) `AND mh.type = ${type}` : (0, database_1.default) ``}
        ${category ? (0, database_1.default) `AND mh.category = ${category}` : (0, database_1.default) ``}
        ORDER BY mh.is_urgent DESC, mh.created_at DESC
      `;
            res.json({
                success: true,
                posts: posts.map(p => ({
                    id: p.id,
                    type: p.type,
                    category: p.category,
                    title: p.title,
                    description: p.description,
                    author: {
                        id: p.user_id,
                        name: p.user_name,
                        phone: p.show_phone ? p.user_phone : undefined,
                    },
                    location: p.location,
                    urgent: p.is_urgent,
                    date: p.created_at,
                    responses: p.response_count,
                    status: p.status,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                posts: getMockPosts(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching mutual help:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération',
        });
    }
});
// POST - Créer une demande/offre
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { type, category, title, description, location, urgent, showPhone } = req.body;
        try {
            const [post] = await (0, database_1.default) `
        INSERT INTO mutual_help (
          user_id, type, category, title, description, location, 
          is_urgent, show_phone, status, created_at
        ) VALUES (
          ${userId}, ${type}, ${category}, ${title}, ${description}, 
          ${location || ''}, ${urgent || false}, ${showPhone || false}, 'open', NOW()
        )
        RETURNING *
      `;
            res.status(201).json({
                success: true,
                message: type === 'need'
                    ? 'Votre demande d\'aide a été publiée.'
                    : 'Votre offre d\'aide a été publiée. Merci!',
                post,
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                message: 'Publication enregistrée (mode démo)',
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error creating mutual help post:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création',
        });
    }
});
// POST - Répondre à une demande
router.post('/:id/respond', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { message } = req.body;
        try {
            await (0, database_1.default) `
        INSERT INTO mutual_help_responses (help_id, user_id, message, created_at)
        VALUES (${id}, ${userId}, ${message || ''}, NOW())
      `;
            res.json({
                success: true,
                message: 'Réponse envoyée. L\'auteur sera notifié.',
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                message: 'Réponse enregistrée (mode démo)',
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error responding to help:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'envoi',
        });
    }
});
// Mock data
function getMockPosts() {
    return [
        {
            id: '1',
            type: 'need',
            category: 'transport',
            title: 'Besoin de covoiturage pour le culte',
            description: 'Je cherche quelqu\'un pour m\'emmener au culte le dimanche.',
            author: { name: 'Marie L.' },
            location: 'Lemba, Kinshasa',
            urgent: false,
            date: new Date(Date.now() - 86400000).toISOString(),
            responses: 2,
            status: 'open',
        },
        {
            id: '2',
            type: 'offer',
            category: 'education',
            title: 'Cours de français gratuits',
            description: 'Prof de français à la retraite, je propose des cours gratuits.',
            author: { name: 'Jean P.' },
            location: 'Ngaliema, Kinshasa',
            urgent: false,
            date: new Date(Date.now() - 86400000 * 2).toISOString(),
            responses: 5,
            status: 'open',
        },
    ];
}
exports.default = router;
//# sourceMappingURL=mutualHelp.js.map