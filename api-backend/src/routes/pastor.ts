/**
 * Routes pasteur - Gestion des rendez-vous et disponibilités
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

/**
 * GET /pastor/appointments - Récupérer les rendez-vous du pasteur
 */
router.get('/appointments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const pastorId = req.user?.id;

    if (!pastorId) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
    }

    // Récupérer les rendez-vous du pasteur
    const { data, error } = await supabase
      .from('rendezvous')
      .select(`
        *,
        membre:membre_id (
          nom,
          prenom,
          email,
          telephone
        )
      `)
      .eq('pasteur_id', pastorId)
      .order('date_heure', { ascending: true });

    if (error) {
      console.error('❌ Erreur récupération rendez-vous:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des rendez-vous'
      });
    }

    res.json({
      success: true,
      appointments: data || []
    });
  } catch (error: any) {
    console.error('❌ Erreur GET /pastor/appointments:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * POST /pastor/appointments/respond - Répondre à une demande de rendez-vous
 */
router.post('/appointments/respond', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { appointment_id, status, notes } = req.body;
    const pastorId = req.user?.id;

    if (!appointment_id || !status) {
      return res.status(400).json({
        success: false,
        error: 'ID du rendez-vous et statut requis'
      });
    }

    // Vérifier que le rendez-vous appartient au pasteur
    const { data: appointment, error: checkError } = await supabase
      .from('rendezvous')
      .select('*')
      .eq('id', appointment_id)
      .eq('pasteur_id', pastorId)
      .single();

    if (checkError || !appointment) {
      return res.status(404).json({
        success: false,
        error: 'Rendez-vous non trouvé'
      });
    }

    // Mettre à jour le rendez-vous
    const { data, error } = await supabase
      .from('rendezvous')
      .update({
        statut: status,
        notes: notes || appointment.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointment_id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur mise à jour rendez-vous:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour du rendez-vous'
      });
    }

    res.json({
      success: true,
      appointment: data
    });
  } catch (error: any) {
    console.error('❌ Erreur POST /pastor/appointments/respond:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * GET /pastor/availability - Récupérer les disponibilités du pasteur
 */
router.get('/availability', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const pastorId = req.user?.id;

    if (!pastorId) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
    }

    const { data, error } = await supabase
      .from('pastor_availability')
      .select('*')
      .eq('pastor_id', pastorId)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('❌ Erreur récupération disponibilités:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des disponibilités'
      });
    }

    res.json({
      success: true,
      availability: data || []
    });
  } catch (error: any) {
    console.error('❌ Erreur GET /pastor/availability:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * POST /pastor/availability - Ajouter une disponibilité
 */
router.post('/availability', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { day_of_week, start_time, end_time } = req.body;
    const pastorId = req.user?.id;

    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        error: 'Jour, heure de début et heure de fin requis'
      });
    }

    const { data, error } = await supabase
      .from('pastor_availability')
      .insert([{
        pastor_id: pastorId,
        day_of_week,
        start_time,
        end_time,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création disponibilité:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création de la disponibilité'
      });
    }

    res.status(201).json({
      success: true,
      availability: data
    });
  } catch (error: any) {
    console.error('❌ Erreur POST /pastor/availability:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * DELETE /pastor/availability/:id - Supprimer une disponibilité
 */
router.delete('/availability/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const pastorId = req.user?.id;

    const { error } = await supabase
      .from('pastor_availability')
      .delete()
      .eq('id', id)
      .eq('pastor_id', pastorId);

    if (error) {
      console.error('❌ Erreur suppression disponibilité:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression de la disponibilité'
      });
    }

    res.json({
      success: true,
      message: 'Disponibilité supprimée avec succès'
    });
  } catch (error: any) {
    console.error('❌ Erreur DELETE /pastor/availability/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * GET /pastor/unavailability - Récupérer les indisponibilités du pasteur
 */
router.get('/unavailability', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const pastorId = req.user?.id;

    if (!pastorId) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non authentifié'
      });
    }

    const { data, error } = await supabase
      .from('pastor_unavailability')
      .select('*')
      .eq('pastor_id', pastorId)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('❌ Erreur récupération indisponibilités:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des indisponibilités'
      });
    }

    res.json({
      success: true,
      unavailability: data || []
    });
  } catch (error: any) {
    console.error('❌ Erreur GET /pastor/unavailability:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * POST /pastor/unavailability - Ajouter une indisponibilité
 */
router.post('/unavailability', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { start_date, end_date, reason } = req.body;
    const pastorId = req.user?.id;

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Date de début et date de fin requises'
      });
    }

    const { data, error } = await supabase
      .from('pastor_unavailability')
      .insert([{
        pastor_id: pastorId,
        start_date,
        end_date,
        reason: reason || '',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création indisponibilité:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création de l\'indisponibilité'
      });
    }

    res.status(201).json({
      success: true,
      unavailability: data
    });
  } catch (error: any) {
    console.error('❌ Erreur POST /pastor/unavailability:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

/**
 * DELETE /pastor/unavailability/:id - Supprimer une indisponibilité
 */
router.delete('/unavailability/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const pastorId = req.user?.id;

    const { error } = await supabase
      .from('pastor_unavailability')
      .delete()
      .eq('id', id)
      .eq('pastor_id', pastorId);

    if (error) {
      console.error('❌ Erreur suppression indisponibilité:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression de l\'indisponibilité'
      });
    }

    res.json({
      success: true,
      message: 'Indisponibilité supprimée avec succès'
    });
  } catch (error: any) {
    console.error('❌ Erreur DELETE /pastor/unavailability/:id:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur'
    });
  }
});

export default router;
