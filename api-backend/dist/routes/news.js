"use strict";
/**
 * =============================================================================
 * ROUTE API: NEWS (Fil d'actualité)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /news - Liste des publications
 * - GET /news/:id - Détail d'une publication
 * - POST /news - Créer une publication (admin/pastor)
 * - PUT /news/:id - Modifier une publication
 * - DELETE /news/:id - Supprimer une publication
 * - POST /news/:id/like - Aimer une publication
 * - POST /news/:id/comment - Commenter une publication
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
// GET - Liste des publications
router.get('/', async (req, res) => {
    try {
        const type = req.query.type;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        // Try to fetch from database, fallback to mock data
        try {
            const posts = await (0, database_1.default) `
        SELECT 
          n.*,
          u.name as author_name,
          u.role as author_role,
          (SELECT COUNT(*) FROM news_likes WHERE news_id = n.id) as likes_count,
          (SELECT COUNT(*) FROM news_comments WHERE news_id = n.id) as comments_count
        FROM news n
        LEFT JOIN users u ON n.author_id = u.id
        WHERE n.is_published = true
        ${type && type !== 'all' ? (0, database_1.default) `AND n.type = ${type}` : (0, database_1.default) ``}
        ORDER BY n.is_pinned DESC, n.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
            res.json({
                success: true,
                posts: posts.map(p => ({
                    id: p.id,
                    type: p.type,
                    title: p.title,
                    content: p.content,
                    author: {
                        id: p.author_id,
                        name: p.author_name,
                        role: p.author_role,
                    },
                    likes: p.likes_count,
                    comments: p.comments_count,
                    image: p.image_url,
                    isPinned: p.is_pinned,
                    createdAt: p.created_at,
                })),
            });
        }
        catch (dbError) {
            // Return mock data if table doesn't exist
            res.json({
                success: true,
                posts: getMockNews(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des actualités',
        });
    }
});
// GET - Détail d'une publication
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [post] = await (0, database_1.default) `
      SELECT 
        n.*,
        u.name as author_name,
        u.role as author_role
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.id = ${id}
    `;
        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Publication non trouvée',
            });
        }
        // Récupérer les commentaires
        const comments = await (0, database_1.default) `
      SELECT 
        c.*,
        u.name as author_name
      FROM news_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.news_id = ${id}
      ORDER BY c.created_at DESC
    `;
        res.json({
            success: true,
            post: {
                ...post,
                comments,
            },
        });
    }
    catch (error) {
        console.error('Error fetching news detail:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération de la publication',
        });
    }
});
// POST - Créer une publication
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        // Seuls admin et pastors peuvent créer des news officielles
        if (userRole !== 'ADMIN' && userRole !== 'PASTOR' && req.body.type !== 'testimony') {
            return res.status(403).json({
                success: false,
                error: 'Non autorisé à créer ce type de publication',
            });
        }
        const { title, content, type, imageUrl } = req.body;
        const [newPost] = await (0, database_1.default) `
      INSERT INTO news (
        title, content, type, image_url, author_id, is_published, created_at
      ) VALUES (
        ${title}, ${content}, ${type || 'announcement'}, ${imageUrl || null}, 
        ${userId}, true, NOW()
      )
      RETURNING *
    `;
        res.status(201).json({
            success: true,
            message: 'Publication créée avec succès',
            post: newPost,
        });
    }
    catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création de la publication',
        });
    }
});
// POST - Aimer une publication
router.post('/:id/like', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        // Vérifier si déjà aimé
        const [existing] = await (0, database_1.default) `
      SELECT id FROM news_likes WHERE news_id = ${id} AND user_id = ${userId}
    `;
        if (existing) {
            // Unlike
            await (0, database_1.default) `DELETE FROM news_likes WHERE news_id = ${id} AND user_id = ${userId}`;
            res.json({ success: true, liked: false });
        }
        else {
            // Like
            await (0, database_1.default) `INSERT INTO news_likes (news_id, user_id) VALUES (${id}, ${userId})`;
            res.json({ success: true, liked: true });
        }
    }
    catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la mise à jour',
        });
    }
});
// POST - Commenter une publication
router.post('/:id/comment', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { content } = req.body;
        const [comment] = await (0, database_1.default) `
      INSERT INTO news_comments (news_id, user_id, content, created_at)
      VALUES (${id}, ${userId}, ${content}, NOW())
      RETURNING *
    `;
        res.status(201).json({
            success: true,
            comment,
        });
    }
    catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'ajout du commentaire',
        });
    }
});
// Mock data fallback
function getMockNews() {
    return [
        {
            id: '1',
            type: 'announcement',
            title: 'Culte spécial de louange ce dimanche',
            content: 'Rejoignez-nous pour un moment de louange et d\'adoration intense.',
            author: { name: 'Pasteur Jean', role: 'PASTOR' },
            date: new Date().toISOString(),
            likes: 45,
            comments: 12,
        },
        {
            id: '2',
            type: 'event',
            title: 'Retraite spirituelle - Inscriptions ouvertes',
            content: 'La retraite annuelle aura lieu du 15 au 17 février.',
            author: { name: 'Comité d\'organisation' },
            date: new Date(Date.now() - 86400000).toISOString(),
            likes: 32,
            comments: 8,
        },
    ];
}
exports.default = router;
//# sourceMappingURL=news.js.map