/**
 * Routes de reconnaissance faciale
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
 * POST /facial-recognition - Enregistrer un descripteur facial
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId, descriptor, photoUrl, qualityScore, isPrimary } = req.body;

    console.log('📸 Enregistrement descripteur facial:', {
      userId,
      descriptorLength: descriptor?.length,
      hasPhoto: !!photoUrl,
      qualityScore,
      isPrimary
    });

    // Validation
    if (!userId || !descriptor || !Array.isArray(descriptor)) {
      return res.status(400).json({
        success: false,
        error: 'userId et descriptor (tableau) requis'
      });
    }

    if (descriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        error: 'Le descripteur doit contenir exactement 128 valeurs'
      });
    }

    // VÉRIFICATION D'UNICITÉ: Un utilisateur ne peut enregistrer qu'une seule fois
    const { data: existingDescriptors, error: checkError } = await supabase
      .from('face_descriptors')
      .select('id, created_at')
      .eq('user_id', userId)
      .limit(1);

    if (checkError) {
      console.error('❌ Erreur vérification:', checkError);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la vérification'
      });
    }

    if (existingDescriptors && existingDescriptors.length > 0) {
      console.log('⚠️ Tentative d\'enregistrement multiple pour userId:', userId);
      return res.status(409).json({
        success: false,
        error: 'Visage déjà enregistré. Vous ne pouvez enregistrer qu\'une seule fois.',
        alreadyRegistered: true,
        registeredAt: existingDescriptors[0].created_at
      });
    }

    // Insérer le nouveau descripteur
    const { data, error } = await supabase
      .from('face_descriptors')
      .insert([
        {
          user_id: userId,
          descriptor: descriptor,
          photo_url: photoUrl || null,
          quality_score: qualityScore || 0.9,
          is_primary: true, // Toujours primary puisqu'il n'y en a qu'un
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur base de données:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'enregistrement du descripteur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    console.log('✅ Descripteur facial enregistré:', data.id);

    res.status(201).json({
      success: true,
      message: 'Descripteur facial enregistré avec succès',
      data: {
        id: data.id,
        userId: data.user_id,
        isPrimary: data.is_primary,
        qualityScore: data.quality_score,
        createdAt: data.created_at
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur serveur:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * GET /facial-recognition - Récupérer les descripteurs d'un utilisateur
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId requis'
      });
    }

    const { data, error } = await supabase
      .from('face_descriptors')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur base de données:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des descripteurs'
      });
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
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
 * DELETE /facial-recognition/:id - Supprimer un descripteur facial
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('face_descriptors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur base de données:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression du descripteur'
      });
    }

    res.json({
      success: true,
      message: 'Descripteur supprimé avec succès'
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
 * GET /facial-recognition/members - Récupérer les membres avec ou sans descripteurs
 */
router.get('/members', authenticate, async (req: Request, res: Response) => {
  try {
    const { withFaceDescriptor, withoutFaceDescriptor } = req.query;

    let query = supabase
      .from('users')
      .select('id, first_name, last_name, email, profile_image_url, role')
      .order('first_name', { ascending: true });

    // Filtrer selon les paramètres
    if (withFaceDescriptor === 'true') {
      // Récupérer les utilisateurs qui ont au moins un descripteur
      const { data: usersWithDescriptors, error: descriptorsError } = await supabase
        .from('face_descriptors')
        .select('user_id')
        .order('user_id');

      if (descriptorsError) {
        throw descriptorsError;
      }

      const userIds = [...new Set(usersWithDescriptors.map(d => d.user_id))];
      
      if (userIds.length === 0) {
        return res.json({
          success: true,
          data: [],
          count: 0
        });
      }

      query = query.in('id', userIds);
    } else if (withoutFaceDescriptor === 'true') {
      // Récupérer les utilisateurs qui n'ont pas de descripteur
      const { data: usersWithDescriptors, error: descriptorsError } = await supabase
        .from('face_descriptors')
        .select('user_id');

      if (descriptorsError) {
        throw descriptorsError;
      }

      const userIds = [...new Set(usersWithDescriptors.map(d => d.user_id))];
      
      if (userIds.length > 0) {
        query = query.not('id', 'in', `(${userIds.join(',')})`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erreur base de données:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des membres'
      });
    }

    // Formater les données pour compatibilité
    const formattedData = data?.map(user => ({
      id: user.id,
      nom: user.last_name,
      prenom: user.first_name,
      email: user.email,
      photo_url: user.profile_image_url,
      role: user.role
    })) || [];

    res.json({
      success: true,
      data: formattedData,
      count: formattedData.length
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
