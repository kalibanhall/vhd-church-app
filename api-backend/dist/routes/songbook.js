"use strict";
/**
 * =============================================================================
 * ROUTE API: SONGBOOK (Cantiques)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /songbook - Liste des cantiques
 * - GET /songbook/categories - Catégories
 * - GET /songbook/:id - Détail d'un cantique (paroles, accords)
 * - POST /songbook/:id/favorite - Ajouter aux favoris
 * - GET /songbook/favorites - Mes favoris
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
// GET - Liste des cantiques
router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        const search = req.query.search;
        try {
            const songs = await (0, database_1.default) `
        SELECT * FROM songbook
        WHERE 1=1
        ${category ? (0, database_1.default) `AND category = ${category}` : (0, database_1.default) ``}
        ${search ? (0, database_1.default) `AND (title ILIKE ${'%' + search + '%'} OR author ILIKE ${'%' + search + '%'} OR first_line ILIKE ${'%' + search + '%'})` : (0, database_1.default) ``}
        ORDER BY number ASC, title ASC
      `;
            res.json({
                success: true,
                songs: songs.map(s => ({
                    id: s.id,
                    number: s.number,
                    title: s.title,
                    author: s.author,
                    category: s.category,
                    firstLine: s.first_line,
                    hasChords: s.has_chords,
                    hasAudio: s.has_audio,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                songs: getMockSongs(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching songbook:', error);
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
            { id: 'worship', name: 'Louange & Adoration', count: 85 },
            { id: 'hymns', name: 'Hymnes classiques', count: 120 },
            { id: 'christmas', name: 'Noël', count: 25 },
            { id: 'easter', name: 'Pâques', count: 18 },
            { id: 'communion', name: 'Sainte Cène', count: 15 },
            { id: 'children', name: 'Enfants', count: 30 },
        ],
    });
});
// GET - Détail d'un cantique
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        try {
            const [song] = await (0, database_1.default) `
        SELECT * FROM songbook WHERE id = ${id}
      `;
            if (!song) {
                return res.status(404).json({
                    success: false,
                    error: 'Cantique non trouvé',
                });
            }
            res.json({
                success: true,
                song: {
                    id: song.id,
                    number: song.number,
                    title: song.title,
                    author: song.author,
                    category: song.category,
                    lyrics: song.lyrics,
                    chordsLyrics: song.chords_lyrics,
                    audioUrl: song.audio_url,
                },
            });
        }
        catch (dbError) {
            // Return mock song
            res.json({
                success: true,
                song: {
                    id,
                    number: 1,
                    title: 'Cantique de louange',
                    author: 'Auteur inconnu',
                    category: 'worship',
                    lyrics: 'Paroles du cantique...\n\nVerset 1:\nLes paroles ici...\n\nRefrain:\nLe refrain ici...',
                    chordsLyrics: null,
                    audioUrl: null,
                },
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching song:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur',
        });
    }
});
// POST - Ajouter aux favoris
router.post('/:id/favorite', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        try {
            const [existing] = await (0, database_1.default) `
        SELECT id FROM songbook_favorites WHERE song_id = ${id} AND user_id = ${userId}
      `;
            if (existing) {
                await (0, database_1.default) `DELETE FROM songbook_favorites WHERE song_id = ${id} AND user_id = ${userId}`;
                res.json({ success: true, favorited: false });
            }
            else {
                await (0, database_1.default) `INSERT INTO songbook_favorites (song_id, user_id, created_at) VALUES (${id}, ${userId}, NOW())`;
                res.json({ success: true, favorited: true });
            }
        }
        catch (dbError) {
            res.json({ success: true, favorited: true, _mock: true });
        }
    }
    catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur',
        });
    }
});
// GET - Mes favoris
router.get('/favorites/list', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        try {
            const favorites = await (0, database_1.default) `
        SELECT s.* FROM songbook s
        JOIN songbook_favorites f ON s.id = f.song_id
        WHERE f.user_id = ${userId}
        ORDER BY s.title ASC
      `;
            res.json({
                success: true,
                songs: favorites,
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                songs: [],
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur',
        });
    }
});
// Mock data
function getMockSongs() {
    return [
        {
            id: '1',
            number: 1,
            title: 'À toi la gloire',
            author: 'Edmond Budry',
            category: 'hymns',
            firstLine: 'À toi la gloire, ô Ressuscité !',
            hasChords: true,
            hasAudio: true,
        },
        {
            id: '2',
            number: 2,
            title: 'Qu\'il est merveilleux',
            author: 'Charles H. Gabriel',
            category: 'worship',
            firstLine: 'Qu\'il est merveilleux de chanter les louanges...',
            hasChords: true,
            hasAudio: false,
        },
        {
            id: '3',
            number: 3,
            title: 'Jésus le bon berger',
            author: 'Traditionnel',
            category: 'children',
            firstLine: 'Jésus le bon berger veille sur moi',
            hasChords: false,
            hasAudio: true,
        },
    ];
}
exports.default = router;
//# sourceMappingURL=songbook.js.map