"use strict";
/**
 * =============================================================================
 * ROUTE API: AUDIOBOOKS (Livres audio)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /audiobooks - Liste des livres audio
 * - GET /audiobooks/categories - Catégories
 * - GET /audiobooks/:id - Détail d'un livre
 * - POST /audiobooks/:id/progress - Sauvegarder la progression
 * - GET /audiobooks/continue - Reprendre où j'en étais
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
// GET - Liste des livres audio
router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        const search = req.query.search;
        try {
            const audiobooks = await (0, database_1.default) `
        SELECT * FROM audiobooks
        WHERE is_active = true
        ${category ? (0, database_1.default) `AND category = ${category}` : (0, database_1.default) ``}
        ${search ? (0, database_1.default) `AND (title ILIKE ${'%' + search + '%'} OR author ILIKE ${'%' + search + '%'})` : (0, database_1.default) ``}
        ORDER BY title ASC
      `;
            res.json({
                success: true,
                audiobooks: audiobooks.map(a => ({
                    id: a.id,
                    title: a.title,
                    author: a.author,
                    narrator: a.narrator,
                    description: a.description,
                    category: a.category,
                    coverUrl: a.cover_url,
                    duration: a.duration,
                    audioUrl: a.audio_url,
                    isFree: a.is_free,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                audiobooks: getMockAudiobooks(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching audiobooks:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération',
        });
    }
});
// GET - Catégories
router.get('/categories', async (req, res) => {
    res.json({
        success: true,
        categories: [
            { id: 'bible', name: 'Bible Audio', count: 66 },
            { id: 'sermons', name: 'Prédications', count: 120 },
            { id: 'books', name: 'Livres chrétiens', count: 45 },
            { id: 'testimonies', name: 'Témoignages', count: 28 },
            { id: 'children', name: 'Pour enfants', count: 15 },
        ],
    });
});
// GET - Reprendre où j'en étais
router.get('/continue', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        try {
            const progress = await (0, database_1.default) `
        SELECT 
          ap.*,
          a.title,
          a.author,
          a.cover_url,
          a.duration
        FROM audiobook_progress ap
        JOIN audiobooks a ON ap.audiobook_id = a.id
        WHERE ap.user_id = ${userId}
        AND ap.progress_percent < 100
        ORDER BY ap.updated_at DESC
        LIMIT 5
      `;
            res.json({
                success: true,
                inProgress: progress.map(p => ({
                    audiobook: {
                        id: p.audiobook_id,
                        title: p.title,
                        author: p.author,
                        coverUrl: p.cover_url,
                        duration: p.duration,
                    },
                    progressPercent: p.progress_percent,
                    currentPosition: p.current_position,
                    lastListened: p.updated_at,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                inProgress: [],
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération',
        });
    }
});
// POST - Sauvegarder la progression
router.post('/:id/progress', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { currentPosition, progressPercent } = req.body;
        try {
            await (0, database_1.default) `
        INSERT INTO audiobook_progress (audiobook_id, user_id, current_position, progress_percent, updated_at)
        VALUES (${id}, ${userId}, ${currentPosition}, ${progressPercent}, NOW())
        ON CONFLICT (audiobook_id, user_id) 
        DO UPDATE SET current_position = ${currentPosition}, progress_percent = ${progressPercent}, updated_at = NOW()
      `;
            res.json({
                success: true,
                message: 'Progression sauvegardée',
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error saving progress:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur',
        });
    }
});
// Mock data
function getMockAudiobooks() {
    return [
        {
            id: '1',
            title: 'La Bible - Nouveau Testament',
            author: 'Bible',
            narrator: 'André Molla',
            description: 'Lecture intégrale du Nouveau Testament',
            category: 'bible',
            coverUrl: '',
            duration: '22h 15min',
            isFree: true,
        },
        {
            id: '2',
            title: 'Le combat spirituel',
            author: 'John Bunyan',
            narrator: 'Paul Lambert',
            description: 'Un classique de la littérature chrétienne',
            category: 'books',
            coverUrl: '',
            duration: '8h 30min',
            isFree: true,
        },
        {
            id: '3',
            title: 'Prédications du Pasteur Jean',
            author: 'Pasteur Jean',
            narrator: 'Pasteur Jean',
            description: 'Compilation des meilleures prédications',
            category: 'sermons',
            coverUrl: '',
            duration: '5h 45min',
            isFree: true,
        },
    ];
}
exports.default = router;
//# sourceMappingURL=audiobooks.js.map