/**
 * Routes donations
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
 * GET /donations - Récupérer toutes les donations
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur récupération donations:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des donations'
      });
    }

    res.json({
      success: true,
      data: donations || []
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
 * POST /donations - Créer une nouvelle donation
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const { amount, method, category, message } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Montant invalide'
      });
    }

    const { data: donation, error } = await supabase
      .from('donations')
      .insert([{
        user_id: authUser.id,
        amount,
        method: method || 'BANK_TRANSFER',
        category: category || 'GENERAL',
        message,
        status: 'PENDING',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création donation:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création de la donation'
      });
    }

    res.status(201).json({
      success: true,
      data: donation
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

