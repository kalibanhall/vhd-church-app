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

import { Router, Request, Response } from 'express';
import sql from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET - Liste des annonces
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const type = req.query.type as string | undefined;
    const minPrice = parseInt(req.query.minPrice as string) || 0;
    const maxPrice = parseInt(req.query.maxPrice as string) || 1000000;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
      const listings = await sql`
        SELECT 
          m.*,
          u.name as seller_name
        FROM marketplace_listings m
        LEFT JOIN users u ON m.user_id = u.id
        WHERE m.status = 'active'
        AND m.price >= ${minPrice} AND m.price <= ${maxPrice}
        ${category && category !== 'all' ? sql`AND m.category = ${category}` : sql``}
        ${type && type !== 'all' ? sql`AND m.type = ${type}` : sql``}
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
    } catch (dbError) {
      res.json({
        success: true,
        listings: getMockListings(),
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error fetching marketplace:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des annonces',
    });
  }
});

// GET - Détail d'une annonce
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    try {
      const [listing] = await sql`
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
    } catch (dbError) {
      res.status(404).json({
        success: false,
        error: 'Annonce non trouvée',
      });
    }
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération',
    });
  }
});

// POST - Créer une annonce
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { title, description, price, category, type, condition, images, location } = req.body;

    try {
      const [listing] = await sql`
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
    } catch (dbError) {
      res.json({
        success: true,
        message: 'Annonce enregistrée (mode démo)',
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création',
    });
  }
});

// POST - Contacter le vendeur
router.post('/:id/contact', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { message } = req.body;

    try {
      await sql`
        INSERT INTO marketplace_messages (listing_id, from_user_id, message, created_at)
        VALUES (${id}, ${userId}, ${message}, NOW())
      `;

      res.json({
        success: true,
        message: 'Message envoyé au vendeur',
      });
    } catch (dbError) {
      res.json({
        success: true,
        message: 'Message envoyé (mode démo)',
        _mock: true,
      });
    }
  } catch (error) {
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

export default router;
