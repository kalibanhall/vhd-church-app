/**
 * =============================================================================
 * ROUTE API: QUESTIONS (Poser une question)
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Endpoints:
 * - GET /questions - Mes questions
 * - GET /questions/faq - FAQ
 * - POST /questions - Poser une question
 * - PUT /questions/:id/answer - Répondre (admin/pastor)
 * 
 * =============================================================================
 */

import { Router, Request, Response } from 'express';
import sql from '../config/database';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// GET - Mes questions
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    try {
      const questions = await sql`
        SELECT 
          q.*,
          a.name as answered_by_name
        FROM questions q
        LEFT JOIN users a ON q.answered_by = a.id
        WHERE q.user_id = ${userId}
        ORDER BY q.created_at DESC
      `;

      res.json({
        success: true,
        questions: questions.map(q => ({
          id: q.id,
          category: q.category,
          subject: q.subject,
          content: q.content,
          isAnonymous: q.is_anonymous,
          isPublic: q.is_public,
          status: q.status,
          answer: q.answer ? {
            content: q.answer,
            answeredBy: q.answered_by_name,
            answeredAt: q.answered_at,
          } : undefined,
          createdAt: q.created_at,
        })),
      });
    } catch (dbError) {
      res.json({
        success: true,
        questions: [],
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des questions',
    });
  }
});

// GET - FAQ
router.get('/faq', async (req: Request, res: Response) => {
  res.json({
    success: true,
    faqs: [
      {
        id: '1',
        category: 'church',
        question: 'À quelle heure commence le culte du dimanche ?',
        answer: 'Le culte principal a lieu chaque dimanche à 10h00. Les portes ouvrent à 9h30.',
        views: 234,
      },
      {
        id: '2',
        category: 'practical',
        question: 'Comment devenir membre de l\'église ?',
        answer: 'Pour devenir membre: 1) Accepter Jésus, 2) Suivre les cours de fondement, 3) Être baptisé.',
        views: 189,
      },
      {
        id: '3',
        category: 'faith',
        question: 'Qu\'est-ce que le baptême du Saint-Esprit ?',
        answer: 'Le baptême du Saint-Esprit est une expérience où le croyant est rempli de la puissance de l\'Esprit.',
        views: 156,
      },
      {
        id: '4',
        category: 'bible',
        question: 'Quelle version de la Bible est recommandée ?',
        answer: 'Nous recommandons Louis Segond pour l\'étude, Semeur pour une lecture moderne.',
        views: 123,
      },
    ],
  });
});

// POST - Poser une question
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { category, subject, content, isAnonymous, isPublic } = req.body;

    try {
      const [question] = await sql`
        INSERT INTO questions (
          user_id, category, subject, content, is_anonymous, is_public, status, created_at
        ) VALUES (
          ${userId}, ${category}, ${subject}, ${content}, 
          ${isAnonymous || false}, ${isPublic || false}, 'pending', NOW()
        )
        RETURNING *
      `;

      res.status(201).json({
        success: true,
        message: 'Question envoyée. Vous recevrez une réponse bientôt.',
        question,
      });
    } catch (dbError) {
      res.json({
        success: true,
        message: 'Question enregistrée (mode démo)',
        _mock: true,
      });
    }
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la question',
    });
  }
});

// PUT - Répondre à une question (admin/pastor)
router.put('/:id/answer', authenticate, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;
    
    if (userRole !== 'ADMIN' && userRole !== 'PASTOR') {
      return res.status(403).json({
        success: false,
        error: 'Non autorisé',
      });
    }

    const { id } = req.params;
    const { answer } = req.body;

    const [question] = await sql`
      UPDATE questions
      SET answer = ${answer}, answered_by = ${userId}, answered_at = NOW(), status = 'answered'
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({
      success: true,
      message: 'Réponse enregistrée',
      question,
    });
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement de la réponse',
    });
  }
});

export default router;
