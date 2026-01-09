/**
 * =============================================================================
 * API GESTION MULTI-VISAGES FAMILLE
 * =============================================================================
 * 
 * Permet d'enregistrer plusieurs visages pour un compte famille
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Configuration Supabase manquante');
  return createClient(supabaseUrl, supabaseKey);
}

function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    return { userId: decoded.userId || decoded.id, email: decoded.email };
  } catch { return null; }
}

const MAX_FAMILY_FACES = 10;

/**
 * GET - Récupérer tous les visages d'une famille/compte
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Récupérer les infos utilisateur et famille
    const { data: userData } = await supabase
      .from('users')
      .select('id, first_name, last_name, family_id')
      .eq('id', user.userId)
      .single();

    // Récupérer tous les descripteurs de l'utilisateur
    const { data: descriptors, error } = await supabase
      .from('face_descriptors')
      .select('id, photo_url, quality_score, is_primary, label, created_at, updated_at')
      .eq('user_id', user.userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération descripteurs:', error);
    }

    // Si famille, récupérer aussi les membres de la famille
    let familyMembers: any[] = [];
    if (userData?.family_id) {
      const { data: members } = await supabase
        .from('users')
        .select(`
          id, first_name, last_name,
          face_descriptors (id, photo_url, is_primary, label)
        `)
        .eq('family_id', userData.family_id)
        .neq('id', user.userId);

      familyMembers = members || [];
    }

    return NextResponse.json({
      success: true,
      faces: descriptors || [],
      familyMembers,
      maxFaces: MAX_FAMILY_FACES,
      canAddMore: (descriptors?.length || 0) < MAX_FAMILY_FACES
    });

  } catch (error) {
    console.error('Erreur API family-faces GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST - Ajouter un nouveau visage au compte famille
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { descriptor, imageData, label, relationship } = body;

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json(
        { error: 'Descripteur facial invalide (128 valeurs requises)' },
        { status: 400 }
      );
    }

    if (!label) {
      return NextResponse.json(
        { error: 'Label requis (ex: "Papa", "Maman", "Enfant 1")' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Vérifier le nombre de visages existants
    const { count } = await supabase
      .from('face_descriptors')
      .select('id', { count: 'exact' })
      .eq('user_id', user.userId);

    if ((count || 0) >= MAX_FAMILY_FACES) {
      return NextResponse.json(
        { error: `Limite de ${MAX_FAMILY_FACES} visages atteinte` },
        { status: 400 }
      );
    }

    // Upload de la photo si fournie
    let photoUrl = null;
    if (imageData?.startsWith('data:image')) {
      try {
        const fileName = `face_${user.userId}_${Date.now()}_${label.replace(/\s/g, '_')}.jpg`;
        const base64Data = imageData.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }
      } catch (e) {
        console.warn('Erreur upload photo famille:', e);
      }
    }

    // Créer le descripteur
    const newDescriptor = {
      user_id: user.userId,
      descriptor,
      photo_url: photoUrl,
      quality_score: 0.9,
      is_primary: count === 0, // Premier = principal
      label,
      relationship: relationship || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('face_descriptors')
      .insert(newDescriptor)
      .select()
      .single();

    if (error) {
      console.error('Erreur création descripteur famille:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 });
    }

    console.log(`✅ Visage famille ajouté: ${label} pour user ${user.userId}`);

    return NextResponse.json({
      success: true,
      message: `Visage "${label}" enregistré avec succès`,
      face: data
    });

  } catch (error) {
    console.error('Erreur API family-faces POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * PATCH - Modifier un visage (label, principal)
 */
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const body = await request.json();
    const { faceId, label, isPrimary } = body;

    if (!faceId) {
      return NextResponse.json({ error: 'faceId requis' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Vérifier que le visage appartient à l'utilisateur
    const { data: existingFace } = await supabase
      .from('face_descriptors')
      .select('id')
      .eq('id', faceId)
      .eq('user_id', user.userId)
      .single();

    if (!existingFace) {
      return NextResponse.json({ error: 'Visage non trouvé' }, { status: 404 });
    }

    const updates: any = { updated_at: new Date().toISOString() };

    if (label !== undefined) {
      updates.label = label;
    }

    if (isPrimary === true) {
      // Retirer le statut principal des autres visages
      await supabase
        .from('face_descriptors')
        .update({ is_primary: false })
        .eq('user_id', user.userId);
      
      updates.is_primary = true;
    }

    const { data, error } = await supabase
      .from('face_descriptors')
      .update(updates)
      .eq('id', faceId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      face: data
    });

  } catch (error) {
    console.error('Erreur API family-faces PATCH:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * DELETE - Supprimer un visage
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const faceId = searchParams.get('faceId');

    if (!faceId) {
      return NextResponse.json({ error: 'faceId requis' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Vérifier et supprimer
    const { error } = await supabase
      .from('face_descriptors')
      .delete()
      .eq('id', faceId)
      .eq('user_id', user.userId);

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    console.log(`🗑️ Visage famille supprimé: ${faceId} pour user ${user.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Visage supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur API family-faces DELETE:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
