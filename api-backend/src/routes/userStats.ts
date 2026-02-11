/**
 * @fileoverview Route pour récupérer les statistiques d'un utilisateur
 * @author MyChurchApp Management System
 * @version 1.0.0
 * 
 * GET /v1/user/:userId/stats - Récupère le nombre de dons, RDV, prières et témoignages
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
 * Récupère les statistiques d'un utilisateur
 * @route GET /v1/user/:userId/stats
 * @access Private
 */
router.get('/:userId/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requestingUser = (req as any).user;

    // Vérifier que l'utilisateur ne peut voir que ses propres stats (sauf admin/pastor)
    if (requestingUser.id !== userId && requestingUser.role !== 'ADMIN' && requestingUser.role !== 'PASTOR') {
      console.log(`⚠️  User ${requestingUser.id} (role: ${requestingUser.role}) tried to access stats of user ${userId}`);
      return res.status(403).json({ 
        error: 'Accès refusé',
        message: 'Vous ne pouvez voir que vos propres statistiques' 
      });
    }

    // Compter les dons
    const { count: donationsCount } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Compter les rendez-vous
    const { count: appointmentsCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Compter les prières
    const { count: prayersCount } = await supabase
      .from('prayers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Compter les témoignages
    const { count: testimoniesCount } = await supabase
      .from('testimonies')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const stats = {
      donations: donationsCount || 0,
      appointments: appointmentsCount || 0,
      prayers: prayersCount || 0,
      testimonies: testimoniesCount || 0
    };

    console.log(`📊 Stats pour user ${userId}:`, stats);

    res.json(stats);

  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des stats:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
});

export default router;
