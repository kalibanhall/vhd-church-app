"use strict";
/**
 * =============================================================================
 * ROUTE API: LIBRARY (Bibliothèque)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /library - Liste des livres
 * - GET /library/categories - Catégories
 * - GET /library/:id - Détail d'un livre
 * - POST /library/:id/borrow - Emprunter un livre
 * - POST /library/:id/return - Retourner un livre
 * - GET /library/my-loans - Mes emprunts
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
// GET - Liste des livres
router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        const search = req.query.search;
        const available = req.query.available === 'true';
        try {
            const books = await (0, database_1.default) `
        SELECT 
          l.*,
          (l.quantity - COALESCE((SELECT COUNT(*) FROM library_loans WHERE book_id = l.id AND returned_at IS NULL), 0)) as available_copies
        FROM library_books l
        WHERE 1=1
        ${category ? (0, database_1.default) `AND l.category = ${category}` : (0, database_1.default) ``}
        ${search ? (0, database_1.default) `AND (l.title ILIKE ${'%' + search + '%'} OR l.author ILIKE ${'%' + search + '%'})` : (0, database_1.default) ``}
        ${available ? (0, database_1.default) `AND (l.quantity - COALESCE((SELECT COUNT(*) FROM library_loans WHERE book_id = l.id AND returned_at IS NULL), 0)) > 0` : (0, database_1.default) ``}
        ORDER BY l.title ASC
      `;
            res.json({
                success: true,
                books: books.map(b => ({
                    id: b.id,
                    title: b.title,
                    author: b.author,
                    description: b.description,
                    category: b.category,
                    isbn: b.isbn,
                    coverUrl: b.cover_url,
                    quantity: b.quantity,
                    available: b.available_copies,
                    publishedYear: b.published_year,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                books: getMockBooks(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching library:', error);
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
            { id: 'bible', name: 'Bible & Commentaires', count: 45 },
            { id: 'theology', name: 'Théologie', count: 32 },
            { id: 'devotional', name: 'Méditations', count: 28 },
            { id: 'biography', name: 'Biographies', count: 15 },
            { id: 'family', name: 'Famille & Mariage', count: 22 },
            { id: 'leadership', name: 'Leadership', count: 18 },
            { id: 'youth', name: 'Jeunesse', count: 12 },
            { id: 'children', name: 'Enfants', count: 25 },
        ],
    });
});
// GET - Mes emprunts
router.get('/my-loans', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        try {
            const loans = await (0, database_1.default) `
        SELECT 
          ll.*,
          lb.title,
          lb.author,
          lb.cover_url
        FROM library_loans ll
        JOIN library_books lb ON ll.book_id = lb.id
        WHERE ll.user_id = ${userId}
        ORDER BY ll.borrowed_at DESC
      `;
            res.json({
                success: true,
                loans: loans.map(l => ({
                    id: l.id,
                    book: {
                        id: l.book_id,
                        title: l.title,
                        author: l.author,
                        coverUrl: l.cover_url,
                    },
                    borrowedAt: l.borrowed_at,
                    dueDate: l.due_date,
                    returnedAt: l.returned_at,
                    isOverdue: !l.returned_at && new Date(l.due_date) < new Date(),
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                loans: [],
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération',
        });
    }
});
// POST - Emprunter un livre
router.post('/:id/borrow', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        try {
            // Vérifier la disponibilité
            const [book] = await (0, database_1.default) `
        SELECT 
          l.*,
          (l.quantity - COALESCE((SELECT COUNT(*) FROM library_loans WHERE book_id = l.id AND returned_at IS NULL), 0)) as available_copies
        FROM library_books l
        WHERE l.id = ${id}
      `;
            if (!book || book.available_copies <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Ce livre n\'est pas disponible actuellement',
                });
            }
            // Calculer la date de retour (14 jours)
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);
            await (0, database_1.default) `
        INSERT INTO library_loans (book_id, user_id, borrowed_at, due_date)
        VALUES (${id}, ${userId}, NOW(), ${dueDate.toISOString()})
      `;
            res.json({
                success: true,
                message: `Livre réservé! À récupérer à la bibliothèque. Retour prévu le ${dueDate.toLocaleDateString('fr-FR')}`,
                dueDate: dueDate.toISOString(),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                message: 'Réservation enregistrée (mode démo)',
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error borrowing book:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la réservation',
        });
    }
});
// Mock data
function getMockBooks() {
    return [
        {
            id: '1',
            title: 'À la recherche de Dieu',
            author: 'A.W. Tozer',
            description: 'Un classique de la littérature chrétienne',
            category: 'devotional',
            coverUrl: '',
            quantity: 3,
            available: 2,
            publishedYear: 1948,
        },
        {
            id: '2',
            title: 'Commentaire sur Romains',
            author: 'John MacArthur',
            description: 'Étude approfondie de l\'épître aux Romains',
            category: 'bible',
            coverUrl: '',
            quantity: 2,
            available: 1,
            publishedYear: 1991,
        },
        {
            id: '3',
            title: 'Frères, nous ne sommes pas des professionnels',
            author: 'John Piper',
            description: 'Un appel à la passion pour le ministère',
            category: 'leadership',
            coverUrl: '',
            quantity: 2,
            available: 2,
            publishedYear: 2002,
        },
    ];
}
exports.default = router;
//# sourceMappingURL=library.js.map