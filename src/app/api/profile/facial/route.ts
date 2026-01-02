/**
 * =============================================================================
 * API PROFIL FACIAL - Enregistrement du visage de l'utilisateur
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * 
 * Description: API pour permettre aux utilisateurs d'enregistrer ou modifier
 * leur descripteur facial depuis leur profil.
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

// Créer le client Supabase à la demande
function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Configuration Supabase manquante')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// Vérifier le token JWT
function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, secret) as { userId: string; email: string }
    return decoded
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const user = verifyToken(token)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }

    // Récupérer les données
    const body = await request.json()
    const { descriptor, imageData } = body

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json(
        { success: false, error: 'Descripteur facial invalide' },
        { status: 400 }
      )
    }

    // Initialiser Supabase
    const supabase = getSupabaseClient()

    // Récupérer l'ID du membre associé à cet utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, membre_id')
      .eq('id', user.userId)
      .single()

    if (userError || !userData) {
      console.error('Erreur user lookup:', userError)
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    let photoUrl = null

    // Upload de la photo si fournie
    if (imageData && imageData.startsWith('data:image')) {
      try {
        const fileName = `face_${userData.membre_id || user.userId}_${Date.now()}.jpg`
        const base64Data = imageData.split(',')[1]
        const buffer = Buffer.from(base64Data, 'base64')

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName)
          photoUrl = urlData.publicUrl
        } else {
          console.warn('Erreur upload photo:', uploadError)
        }
      } catch (uploadErr) {
        console.warn('Erreur upload:', uploadErr)
      }
    }

    // Mettre à jour le membre avec le descripteur facial
    if (userData.membre_id) {
      const updateData: Record<string, unknown> = {
        face_descriptor: descriptor,
        updated_at: new Date().toISOString()
      }
      
      if (photoUrl) {
        updateData.photo_url = photoUrl
      }

      const { error: updateError } = await supabase
        .from('membres')
        .update(updateData)
        .eq('id', userData.membre_id)

      if (updateError) {
        console.error('Erreur update membre:', updateError)
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la mise à jour' },
          { status: 500 }
        )
      }
    } else {
      // Si pas de membre_id, mettre à jour l'utilisateur directement
      const updateData: Record<string, unknown> = {
        face_descriptor: descriptor,
        updated_at: new Date().toISOString()
      }
      
      if (photoUrl) {
        updateData.profile_photo = photoUrl
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.userId)

      if (updateError) {
        console.error('Erreur update user:', updateError)
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la mise à jour' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Visage enregistré avec succès',
      photoUrl
    })

  } catch (error) {
    console.error('Erreur API facial:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// GET - Vérifier si l'utilisateur a un visage enregistré
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const user = verifyToken(token)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }

    // Initialiser Supabase
    const supabase = getSupabaseClient()

    // Récupérer le membre associé
    const { data: userData } = await supabase
      .from('users')
      .select('membre_id')
      .eq('id', user.userId)
      .single()

    if (userData?.membre_id) {
      const { data: membreData } = await supabase
        .from('membres')
        .select('face_descriptor, photo_url')
        .eq('id', userData.membre_id)
        .single()

      return NextResponse.json({
        success: true,
        hasFaceDescriptor: !!membreData?.face_descriptor,
        photoUrl: membreData?.photo_url
      })
    }

    return NextResponse.json({
      success: true,
      hasFaceDescriptor: false,
      photoUrl: null
    })

  } catch (error) {
    console.error('Erreur API facial GET:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer les données faciales de l'utilisateur
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    const user = verifyToken(token)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }

    // Initialiser Supabase
    const supabase = getSupabaseClient()

    // Récupérer le membre associé
    const { data: userData } = await supabase
      .from('users')
      .select('membre_id')
      .eq('id', user.userId)
      .single()

    if (userData?.membre_id) {
      // Supprimer le descripteur facial du membre
      const { error: updateError } = await supabase
        .from('membres')
        .update({
          face_descriptor: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.membre_id)

      if (updateError) {
        console.error('Erreur suppression:', updateError)
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la suppression' },
          { status: 500 }
        )
      }
    } else {
      // Supprimer depuis la table users
      const { error: updateError } = await supabase
        .from('users')
        .update({
          face_descriptor: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.userId)

      if (updateError) {
        console.error('Erreur suppression:', updateError)
        return NextResponse.json(
          { success: false, error: 'Erreur lors de la suppression' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Données faciales supprimées avec succès'
    })

  } catch (error) {
    console.error('Erreur API facial DELETE:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}