/**
 * Routes notifications
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

/**
 * GET /notifications - Récupérer les notifications d'un utilisateur
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId, unread } = req.query;
    const authUserId = (req as any).user?.id;

    const targetUserId = userId || authUserId;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'userId requis'
      });
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUserId);

    // Filtrer par statut de lecture si demandé
    if (unread === 'true') {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des notifications'
      });
    }

    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)
      .eq('is_read', false);

    res.json({
      success: true,
      data: notifications || [],
      unreadCount: unreadCount || 0
    });
  } catch (error: any) {
    console.error('❌ Erreur serveur:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * PATCH /notifications/mark-read - Marquer des notifications comme lues
 */
router.patch('/mark-read', authenticate, async (req: Request, res: Response) => {
  try {
    const { notificationIds, userId } = req.body;
    const authUserId = (req as any).user?.id;

    const targetUserId = userId || authUserId;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({
        success: false,
        error: 'notificationIds (array) requis'
      });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .in('id', notificationIds)
      .eq('user_id', targetUserId);

    if (error) {
      console.error('❌ Erreur mise à jour notifications:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour des notifications'
      });
    }

    res.json({
      success: true,
      message: 'Notifications marquées comme lues'
    });
  } catch (error: any) {
    console.error('❌ Erreur serveur:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * PATCH /notifications/:id - Marquer une notification comme lue
 */
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authUserId = (req as any).user?.id;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', authUserId);

    if (error) {
      console.error('❌ Erreur mise à jour notification:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour de la notification'
      });
    }

    res.json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error: any) {
    console.error('❌ Erreur serveur:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

export default router;
