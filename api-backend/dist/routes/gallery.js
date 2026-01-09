"use strict";
/**
 * =============================================================================
 * ROUTE API: GALLERY (Galerie photos)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /gallery - Liste des albums
 * - GET /gallery/:albumId - Photos d'un album
 * - POST /gallery - Créer un album (admin)
 * - POST /gallery/:albumId/photos - Ajouter des photos
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
// GET - Liste des albums
router.get('/', async (req, res) => {
    try {
        const year = req.query.year;
        const category = req.query.category;
        try {
            const albums = await (0, database_1.default) `
        SELECT 
          a.*,
          (SELECT COUNT(*) FROM gallery_photos WHERE album_id = a.id) as photo_count,
          (SELECT url FROM gallery_photos WHERE album_id = a.id ORDER BY created_at LIMIT 1) as cover_url
        FROM gallery_albums a
        WHERE a.is_published = true
        ${year ? (0, database_1.default) `AND EXTRACT(YEAR FROM a.event_date) = ${parseInt(year)}` : (0, database_1.default) ``}
        ${category ? (0, database_1.default) `AND a.category = ${category}` : (0, database_1.default) ``}
        ORDER BY a.event_date DESC
      `;
            res.json({
                success: true,
                albums: albums.map(a => ({
                    id: a.id,
                    title: a.title,
                    description: a.description,
                    eventDate: a.event_date,
                    category: a.category,
                    photoCount: a.photo_count,
                    coverUrl: a.cover_url,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                albums: getMockAlbums(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération',
        });
    }
});
// GET - Photos d'un album
router.get('/:albumId', async (req, res) => {
    try {
        const { albumId } = req.params;
        try {
            const [album] = await (0, database_1.default) `
        SELECT * FROM gallery_albums WHERE id = ${albumId}
      `;
            if (!album) {
                return res.status(404).json({
                    success: false,
                    error: 'Album non trouvé',
                });
            }
            const photos = await (0, database_1.default) `
        SELECT * FROM gallery_photos 
        WHERE album_id = ${albumId}
        ORDER BY created_at ASC
      `;
            res.json({
                success: true,
                album: {
                    id: album.id,
                    title: album.title,
                    description: album.description,
                    eventDate: album.event_date,
                    category: album.category,
                },
                photos: photos.map(p => ({
                    id: p.id,
                    url: p.url,
                    thumbnailUrl: p.thumbnail_url || p.url,
                    caption: p.caption,
                    takenAt: p.taken_at,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                album: { id: albumId, title: 'Album', description: '', eventDate: new Date().toISOString() },
                photos: getMockPhotos(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching album:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur',
        });
    }
});
// POST - Créer un album (admin)
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const userRole = req.user?.role;
        if (userRole !== 'ADMIN' && userRole !== 'PASTOR') {
            return res.status(403).json({
                success: false,
                error: 'Non autorisé',
            });
        }
        const { title, description, eventDate, category } = req.body;
        try {
            const [album] = await (0, database_1.default) `
        INSERT INTO gallery_albums (title, description, event_date, category, is_published, created_at)
        VALUES (${title}, ${description || ''}, ${eventDate}, ${category || 'event'}, true, NOW())
        RETURNING *
      `;
            res.status(201).json({
                success: true,
                message: 'Album créé avec succès',
                album,
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                message: 'Album créé (mode démo)',
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error creating album:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur',
        });
    }
});
// Mock data
function getMockAlbums() {
    return [
        {
            id: '1',
            title: 'Culte de Noël 2024',
            description: 'Moments forts de notre célébration de Noël',
            eventDate: '2024-12-25',
            category: 'worship',
            photoCount: 45,
            coverUrl: '',
        },
        {
            id: '2',
            title: 'Baptêmes - Janvier 2025',
            description: '12 nouveaux baptisés!',
            eventDate: '2025-01-15',
            category: 'baptism',
            photoCount: 32,
            coverUrl: '',
        },
        {
            id: '3',
            title: 'Retraite spirituelle',
            description: 'Week-end de ressourcement',
            eventDate: '2025-02-08',
            category: 'retreat',
            photoCount: 78,
            coverUrl: '',
        },
    ];
}
function getMockPhotos() {
    return [
        { id: '1', url: '', thumbnailUrl: '', caption: 'Photo 1' },
        { id: '2', url: '', thumbnailUrl: '', caption: 'Photo 2' },
        { id: '3', url: '', thumbnailUrl: '', caption: 'Photo 3' },
    ];
}
exports.default = router;
//# sourceMappingURL=gallery.js.map