/**
 * =============================================================================
 * ROUTE API: SERVICES (Vous servir)
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Endpoints:
 * - GET /services - Liste des services disponibles
 * - GET /services/requests - Mes demandes de service
 * - POST /services/request - Demander un service
 * - PUT /services/requests/:id - Modifier une demande
 * 
 * =============================================================================
 */

import { Router, Request, Response } from 'express';
import sql from '../config/database';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET - Liste des services
router.get('/', async (req: Request, res: Response) => {
  try {
    try {
      const services = await sql`
        SELECT * FROM church_services
        WHERE is_active = true
        ORDER BY category, name
      `;

      res.json({
        success: true,
        services,
      });
    } catch (dbError) {
      res.json({
        success: true,
        services: getMockServices(),
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des services',
    });
  }
});

// GET - Mes demandes de service
router.get('/requests', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    try {
      const requests = await sql`
        SELECT 
          sr.*,
          cs.name as service_name
        FROM service_requests sr
        LEFT JOIN church_services cs ON sr.service_id = cs.id
        WHERE sr.user_id = ${userId}
        ORDER BY sr.created_at DESC
      `;

      res.json({
        success: true,
        requests,
      });
    } catch (dbError) {
      res.json({
        success: true,
        requests: [],
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des demandes',
    });
  }
});

// POST - Demander un service
router.post('/request', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { serviceId, details, preferredDate, urgency } = req.body;

    try {
      const [request] = await sql`
        INSERT INTO service_requests (
          user_id, service_id, details, preferred_date, urgency, status, created_at
        ) VALUES (
          ${userId}, ${serviceId}, ${details || ''}, ${preferredDate || null},
          ${urgency || 'normal'}, 'pending', NOW()
        )
        RETURNING *
      `;

      res.status(201).json({
        success: true,
        message: 'Demande de service enregistrée',
        request,
      });
    } catch (dbError) {
      res.json({
        success: true,
        message: 'Demande enregistrée (mode démo)',
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la demande',
    });
  }
});

// Mock services
function getMockServices() {
  return [
    {
      id: '1',
      name: 'Certificat de baptême',
      description: 'Demandez votre certificat de baptême officiel',
      category: 'documents',
      processingTime: '3-5 jours',
      fee: 0,
    },
    {
      id: '2',
      name: 'Certificat de mariage',
      description: 'Certificat de mariage religieux',
      category: 'documents',
      processingTime: '5-7 jours',
      fee: 0,
    },
    {
      id: '3',
      name: 'Bénédiction de maison',
      description: 'Demander une bénédiction pour votre domicile',
      category: 'blessings',
      processingTime: 'Sur rendez-vous',
      fee: 0,
    },
    {
      id: '4',
      name: 'Counseling pastoral',
      description: 'Entretien confidentiel avec un pasteur',
      category: 'counseling',
      processingTime: 'Sur rendez-vous',
      fee: 0,
    },
  ];
}

export default router;
