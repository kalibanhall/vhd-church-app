/**
 * Routes sondages (polls) - Backend
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
 * GET /polls - Récupérer tous les sondages
 * Query params:
 * - includeExpired: boolean - inclure les sondages expirés
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const includeExpired = req.query.includeExpired === 'true';
    
    let query = supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtrer les sondages non expirés
    if (!includeExpired) {
      const now = new Date().toISOString();
      query = query.gte('expires_at', now);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erreur récupération sondages:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des sondages'
      });
    }

    res.json({
      success: true,
      polls: data || []
    });
  } catch (error: any) {
    console.error('❌ Erreur GET /polls:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * POST /polls - Créer un nouveau sondage (ADMIN uniquement)
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, options, expires_at, allow_multiple } = req.body;

    // Validation
    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Titre et au moins 2 options requises'
      });
    }

    if (!expires_at) {
      return res.status(400).json({
        success: false,
        error: 'Date de fin requise'
      });
    }

    const authUser = (req as any).user;

    // Créer le sondage
    const { data, error } = await supabase
      .from('polls')
      .insert([{
        title,
        description: req.body.description || null,
        creator_id: authUser.id,
        expires_at,
        allow_multiple: allow_multiple || false,
        is_active: true,
        is_anonymous: req.body.is_anonymous || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création sondage:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du sondage'
      });
    }

    res.status(201).json({
      success: true,
      poll: data
    });
  } catch (error: any) {
    console.error('❌ Erreur POST /polls:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * PUT /polls/:id - Mettre à jour un sondage (ADMIN uniquement)
 */
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, options, expires_at, allow_multiple } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title) updateData.title = title;
    if (options && Array.isArray(options)) updateData.options = options;
    if (expires_at) updateData.expires_at = expires_at;
    if (allow_multiple !== undefined) updateData.allow_multiple = allow_multiple;

    const { data, error } = await supabase
      .from('polls')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur mise à jour sondage:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour du sondage'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Sondage non trouvé'
      });
    }

    res.json({
      success: true,
      poll: data
    });
  } catch (error: any) {
    console.error('❌ Erreur PUT /polls/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * DELETE /polls/:id - Supprimer un sondage (ADMIN uniquement)
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur suppression sondage:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression du sondage'
      });
    }

    res.json({
      success: true,
      message: 'Sondage supprimé avec succès'
    });
  } catch (error: any) {
    console.error('❌ Erreur DELETE /polls/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * POST /polls/:id/vote - Voter pour un sondage
 */
router.post('/:id/vote', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { option_index, user_id } = req.body;

    if (option_index === undefined || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'Index de l\'option et ID utilisateur requis'
      });
    }

    // Vérifier si l'utilisateur a déjà voté
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('sondage_id', id)
      .eq('user_id', user_id)
      .single();

    if (existingVote) {
      return res.status(400).json({
        success: false,
        error: 'Vous avez déjà voté pour ce sondage'
      });
    }

    // Enregistrer le vote
    const { data, error } = await supabase
      .from('poll_votes')
      .insert([{
        sondage_id: id,
        user_id,
        option_index,
        voted_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur vote sondage:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'enregistrement du vote'
      });
    }

    res.status(201).json({
      success: true,
      vote: data
    });
  } catch (error: any) {
    console.error('❌ Erreur POST /polls/:id/vote:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * GET /polls/:id/results - Récupérer les résultats d'un sondage
 */
router.get('/:id/results', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Récupérer le sondage
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('id', id)
      .single();

    if (pollError || !poll) {
      return res.status(404).json({
        success: false,
        error: 'Sondage non trouvé'
      });
    }

    // Récupérer les votes
    const { data: votes, error: votesError } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('sondage_id', id);

    if (votesError) {
      console.error('❌ Erreur récupération votes:', votesError);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des votes'
      });
    }

    // Calculer les résultats
    const results = (poll.options as string[]).map((option, index) => ({
      option,
      votes: votes ? votes.filter(v => v.option_index === index).length : 0
    }));

    const totalVotes = votes ? votes.length : 0;

    res.json({
      success: true,
      poll,
      results,
      totalVotes
    });
  } catch (error: any) {
    console.error('❌ Erreur GET /polls/:id/results:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

export default router;
