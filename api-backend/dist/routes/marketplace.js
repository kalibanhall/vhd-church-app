"use strict";
/**
 * =============================================================================
 * ROUTE API: MARKETPLACE (Acheter/Vendre)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /marketplace - Liste des annonces
 * - GET /marketplace/:id - Détail d'une annonce
 * - POST /marketplace - Créer une annonce
 * - POST /marketplace/:id/contact - Contacter le vendeur
 * - PUT /marketplace/:id - Modifier une annonce
 * - DELETE /marketplace/:id - Supprimer une annonce
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
// GET - Liste des annonces
router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        const type = req.query.type;
        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || 1000000;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        try {
            const listings = await (0, database_1.default) `
        SELECT 
          m.*,
          u.name as seller_name
        FROM marketplace_listings m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE m.status = 'active'
        AND m.price >= ${minPrice} AND m.price <= ${maxPrice}
        ${category && category !== 'all' ? (0, database_1.default) `AND m.category = ${category}` : (0, database_1.default) ``}
        ${type && type !== 'all' ? (0, database_1.default) `AND m.type = ${type}` : (0, database_1.default) ``}
        ORDER BY m.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
            res.json({
                success: true,
                listings: listings.map(l => ({
                    id: l.id,
                    title: l.title,
                    description: l.description,
                    price: l.price,
                    currency: l.currency || 'EUR',
                    category: l.category,
                    type: l.type,
                    condition: l.condition,
                    images: l.images || [],
                    seller: {
                        id: l.user_id,
                        name: l.seller_name,
                    },
                    location: l.location,
                    createdAt: l.created_at,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                listings: getMockListings(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching marketplace:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des annonces',
        });
    }
});
// GET - Détail d'une annonce
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        try {
            const [listing] = await (0, database_1.default) `
        SELECT 
          m.*,
          u.name as seller_name,
          u.phone as seller_phone,
          u.email as seller_email
        FROM marketplace_listings m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE m.id = ${id}
      `;
            if (!listing) {
                return res.status(404).json({
                    success: false,
                    error: 'Annonce non trouvée',
                });
            }
            res.json({
                success: true,
                listing: {
                    ...listing,
                    seller: {
                        id: listing.user_id,
                        name: listing.seller_name,
                        phone: listing.seller_phone,
                        email: listing.seller_email,
                    },
                },
            });
        }
        catch (dbError) {
            res.status(404).json({
                success: false,
                error: 'Annonce non trouvée',
            });
        }
    }
    catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération',
        });
    }
});
// POST - Créer une annonce
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { title, description, price, category, type, condition, images, location } = req.body;
        try {
            const [listing] = await (0, database_1.default) `
        INSERT INTO marketplace_listings (
          user_id, title, description, price, category, type, 
          condition, images, location, status, created_at
        ) VALUES (
          ${userId}, ${title}, ${description}, ${price}, ${category}, 
          ${type || 'sell'}, ${condition || 'good'}, ${JSON.stringify(images || [])}, 
          ${location || ''}, 'active', NOW()
        )
        RETURNING *
      `;
            res.status(201).json({
                success: true,
                message: 'Annonce publiée avec succès',
                listing,
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                message: 'Annonce enregistrée (mode démo)',
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error creating listing:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la création',
        });
    }
});
// POST - Contacter le vendeur
router.post('/:id/contact', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { message } = req.body;
        try {
            await (0, database_1.default) `
        INSERT INTO marketplace_messages (listing_id, from_user_id, message, created_at)
        VALUES (${id}, ${userId}, ${message}, NOW())
      `;
            res.json({
                success: true,
                message: 'Message envoyé au vendeur',
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                message: 'Message envoyé (mode démo)',
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error contacting seller:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'envoi',
        });
    }
});
// Mock data
function getMockListings() {
    return [
        {
            id: '1',
            title: 'Bible Louis Segond - Cuir véritable',
            description: 'Belle Bible en cuir, parfait état',
            price: 45000,
            currency: 'CDF',
            category: 'books',
            type: 'sell',
            condition: 'excellent',
            images: [],
            seller: { name: 'Pierre D.' },
            location: 'Gombe, Kinshasa',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
            id: '2',
            title: 'Piano numérique Yamaha',
            description: 'Piano 88 touches, idéal pour la louange',
            price: 350000,
            currency: 'CDF',
            category: 'instruments',
            type: 'sell',
            condition: 'good',
            images: [],
            seller: { name: 'Marie K.' },
            location: 'Lemba, Kinshasa',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
    ];
}
exports.default = router;
//# sourceMappingURL=marketplace.js.map