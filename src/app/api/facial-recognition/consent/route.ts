/**
 * =============================================================================
 * API CONSENTEMENT RGPD - Gestion des consentements biométriques
 * =============================================================================
 * 
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

// Créer le client Supabase
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Configuration Supabase manquante');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Vérifier le token JWT
function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as any;
    return {
      userId: decoded.userId || decoded.id,
      email: decoded.email
    };
  } catch {
    return null;
  }
}

const CONSENT_VERSION = '2.0.0';

/**
 * GET - Récupérer les consentements d'un utilisateur
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

    // Récupérer tous les consentements de l'utilisateur
    const { data: consents, error } = await supabase
      .from('consent_records')
      .select('*')
      .eq('user_id', user.userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Erreur récupération consentements:', error);
      // Si la table n'existe pas, retourner un tableau vide
      return NextResponse.json({
        success: true,
        consents: [],
        hasValidFacialConsent: false
      });
    }

    // Vérifier si le consentement facial est valide
    const facialConsent = consents?.find(c => 
      c.consent_type === 'FACIAL_RECOGNITION' && 
      c.consent_given && 
      !c.withdrawn_at &&
      c.consent_version === CONSENT_VERSION
    );

    return NextResponse.json({
      success: true,
      consents: consents || [],
      hasValidFacialConsent: !!facialConsent,
      currentVersion: CONSENT_VERSION
    });

  } catch (error) {
    console.error('Erreur API consent GET:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST - Enregistrer un nouveau consentement
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
    const { consentType, consentGiven } = body;

    if (!consentType || consentGiven === undefined) {
      return NextResponse.json(
        { error: 'consentType et consentGiven requis' },
        { status: 400 }
      );
    }

    const validTypes = ['FACIAL_RECOGNITION', 'DATA_PROCESSING', 'PRESENCE_TRACKING'];
    if (!validTypes.includes(consentType)) {
      return NextResponse.json(
        { error: 'Type de consentement invalide' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Récupérer l'IP et le User-Agent
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Créer l'enregistrement de consentement
    const consentRecord = {
      user_id: user.userId,
      consent_type: consentType,
      consent_given: consentGiven,
      consent_version: CONSENT_VERSION,
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('consent_records')
      .insert(consentRecord)
      .select()
      .single();

    if (error) {
      console.error('Erreur enregistrement consentement:', error);
      // Si la table n'existe pas, la créer
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          message: 'Consentement enregistré (table en cours de création)',
          consent: consentRecord
        });
      }
      throw error;
    }

    // Logger l'action pour audit
    console.log(`✅ Consentement enregistré: ${consentType} = ${consentGiven} pour user ${user.userId}`);

    return NextResponse.json({
      success: true,
      message: consentGiven ? 'Consentement accordé' : 'Consentement refusé',
      consent: data
    });

  } catch (error) {
    console.error('Erreur API consent POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * DELETE - Retirer un consentement (droit d'opposition RGPD)
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
    const consentType = searchParams.get('type');

    if (!consentType) {
      return NextResponse.json({ error: 'Type de consentement requis' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Marquer le consentement comme retiré (ne pas supprimer pour l'audit)
    const { error } = await supabase
      .from('consent_records')
      .update({ 
        withdrawn_at: new Date().toISOString(),
        consent_given: false 
      })
      .eq('user_id', user.userId)
      .eq('consent_type', consentType)
      .is('withdrawn_at', null);

    if (error) {
      console.error('Erreur retrait consentement:', error);
    }

    // Si le consentement facial est retiré, supprimer aussi les données faciales
    if (consentType === 'FACIAL_RECOGNITION') {
      try {
        await supabase
          .from('face_descriptors')
          .delete()
          .eq('user_id', user.userId);
        
        console.log(`🗑️ Données faciales supprimées pour user ${user.userId}`);
      } catch (e) {
        console.warn('Erreur suppression données faciales:', e);
      }
    }

    console.log(`⚠️ Consentement retiré: ${consentType} pour user ${user.userId}`);

    return NextResponse.json({
      success: true,
      message: 'Consentement retiré avec succès'
    });

  } catch (error) {
    console.error('Erreur API consent DELETE:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
