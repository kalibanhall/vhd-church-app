/**
 * =============================================================================
 * API SETTINGS PROXY - GESTION DES PARAMÈTRES DE L'APPLICATION
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: API pour gérer les paramètres configurables de l'application
 * (contacts, réseaux sociaux, horaires, etc.)
 * 
 * Endpoints:
 * - GET /api/settings-proxy?category=xxx - Récupérer les paramètres (publics ou tous pour admin)
 * - GET /api/settings-proxy?key=xxx - Récupérer un paramètre spécifique
 * - PUT /api/settings-proxy - Mettre à jour un ou plusieurs paramètres (admin)
 * 
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vhd-church-api.onrender.com/v1'

// Interface pour les paramètres
interface AppSetting {
  id: string
  key: string
  value: string
  category: string
  description?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

// Paramètres par défaut (fallback si la BD n'est pas disponible)
const defaultSettings: Record<string, AppSetting> = {
  contact_email: {
    id: 'default_1',
    key: 'contact_email',
    value: 'contact@mychurchapp.com',
    category: 'contact',
    description: 'Email de contact principal',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  contact_phone: {
    id: 'default_2',
    key: 'contact_phone',
    value: '+243 83 23 13 105',
    category: 'contact',
    description: 'Numéro de téléphone principal',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  emergency_email: {
    id: 'default_3',
    key: 'emergency_email',
    value: 'contact@mychurchapp.com',
    category: 'contact',
    description: 'Email pour les urgences',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  emergency_phone: {
    id: 'default_4',
    key: 'emergency_phone',
    value: '+243 83 23 13 105',
    category: 'contact',
    description: 'Téléphone pour les urgences',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  secretariat_phone: {
    id: 'default_5',
    key: 'secretariat_phone',
    value: '+243 83 23 13 105',
    category: 'contact',
    description: 'Numéro du secrétariat',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  church_name: {
    id: 'default_6',
    key: 'church_name',
    value: 'MyChurchApp',
    category: 'general',
    description: 'Nom de l\'église',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  church_address: {
    id: 'default_7',
    key: 'church_address',
    value: '',
    category: 'contact',
    description: 'Adresse de l\'église',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  service_hours_sunday: {
    id: 'default_8',
    key: 'service_hours_sunday',
    value: '09h00 - 12h00',
    category: 'hours',
    description: 'Horaires du culte dominical',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  office_hours: {
    id: 'default_9',
    key: 'office_hours',
    value: 'Lun-Ven: 08h00 - 17h00',
    category: 'hours',
    description: 'Horaires du secrétariat',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  social_facebook: {
    id: 'default_10',
    key: 'social_facebook',
    value: '',
    category: 'social',
    description: 'Lien Facebook',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  social_instagram: {
    id: 'default_11',
    key: 'social_instagram',
    value: '',
    category: 'social',
    description: 'Lien Instagram',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  social_youtube: {
    id: 'default_12',
    key: 'social_youtube',
    value: '',
    category: 'social',
    description: 'Lien YouTube',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  social_whatsapp: {
    id: 'default_13',
    key: 'social_whatsapp',
    value: '+243 83 23 13 105',
    category: 'social',
    description: 'Numéro WhatsApp',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Stockage en mémoire (sera remplacé par la BD)
let settingsStore: Record<string, AppSetting> = { ...defaultSettings }

// GET - Récupérer les paramètres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const key = searchParams.get('key')
    const adminMode = searchParams.get('admin') === 'true'

    // Essayer de récupérer depuis le backend
    try {
      const backendUrl = new URL(`${API_BASE_URL}/settings`)
      if (category) backendUrl.searchParams.set('category', category)
      if (key) backendUrl.searchParams.set('key', key)
      if (adminMode) backendUrl.searchParams.set('admin', 'true')

      const response = await fetch(backendUrl.toString(), {
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('Authorization') && {
            'Authorization': request.headers.get('Authorization') || ''
          })
        },
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        // Mettre à jour le store local
        if (data.settings) {
          data.settings.forEach((setting: AppSetting) => {
            settingsStore[setting.key] = setting
          })
        }
        return NextResponse.json(data)
      }
    } catch {
      console.log('Backend non disponible, utilisation des données locales')
    }

    // Fallback: utiliser les données locales
    let settings = Object.values(settingsStore)

    // Filtrer par catégorie
    if (category) {
      settings = settings.filter(s => s.category === category)
    }

    // Filtrer par clé spécifique
    if (key) {
      const setting = settingsStore[key]
      if (setting) {
        return NextResponse.json({ setting })
      }
      return NextResponse.json({ error: 'Paramètre non trouvé' }, { status: 404 })
    }

    // Si pas admin, filtrer les paramètres publics uniquement
    if (!adminMode) {
      settings = settings.filter(s => s.isPublic)
    }

    return NextResponse.json({ 
      settings,
      count: settings.length,
      source: 'local'
    })

  } catch (error) {
    console.error('Erreur GET settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour les paramètres (admin uniquement)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { settings: settingsToUpdate } = body

    if (!settingsToUpdate || !Array.isArray(settingsToUpdate)) {
      return NextResponse.json(
        { error: 'Paramètres invalides. Attendu: { settings: [{ key, value }] }' },
        { status: 400 }
      )
    }

    // Essayer de mettre à jour via le backend
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('Authorization') && {
            'Authorization': request.headers.get('Authorization') || ''
          })
        },
        body: JSON.stringify({ settings: settingsToUpdate })
      })

      if (response.ok) {
        const data = await response.json()
        // Mettre à jour le store local
        settingsToUpdate.forEach((update: { key: string, value: string }) => {
          if (settingsStore[update.key]) {
            settingsStore[update.key] = {
              ...settingsStore[update.key],
              value: update.value,
              updatedAt: new Date().toISOString()
            }
          }
        })
        return NextResponse.json(data)
      }
    } catch {
      console.log('Backend non disponible, mise à jour locale uniquement')
    }

    // Fallback: mettre à jour localement
    const updatedSettings: AppSetting[] = []
    
    settingsToUpdate.forEach((update: { key: string, value: string, description?: string }) => {
      if (settingsStore[update.key]) {
        settingsStore[update.key] = {
          ...settingsStore[update.key],
          value: update.value,
          ...(update.description && { description: update.description }),
          updatedAt: new Date().toISOString()
        }
        updatedSettings.push(settingsStore[update.key])
      } else {
        // Créer un nouveau paramètre si il n'existe pas
        const newSetting: AppSetting = {
          id: `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          key: update.key,
          value: update.value,
          category: 'custom',
          description: update.description || '',
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        settingsStore[update.key] = newSetting
        updatedSettings.push(newSetting)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      settings: updatedSettings,
      source: 'local'
    })

  } catch (error) {
    console.error('Erreur PUT settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau paramètre (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, category, description, isPublic } = body

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Les champs key et value sont requis' },
        { status: 400 }
      )
    }

    // Vérifier si le paramètre existe déjà
    if (settingsStore[key]) {
      return NextResponse.json(
        { error: 'Un paramètre avec cette clé existe déjà' },
        { status: 409 }
      )
    }

    // Créer le nouveau paramètre
    const newSetting: AppSetting = {
      id: `setting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key,
      value,
      category: category || 'custom',
      description: description || '',
      isPublic: isPublic || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    settingsStore[key] = newSetting

    // Essayer de sauvegarder au backend
    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('Authorization') && {
            'Authorization': request.headers.get('Authorization') || ''
          })
        },
        body: JSON.stringify(newSetting)
      })
    } catch {
      console.log('Backend non disponible, sauvegarde locale uniquement')
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètre créé avec succès',
      setting: newSetting
    })

  } catch (error) {
    console.error('Erreur POST settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du paramètre' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un paramètre (admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Le paramètre key est requis' },
        { status: 400 }
      )
    }

    if (!settingsStore[key]) {
      return NextResponse.json(
        { error: 'Paramètre non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer localement
    delete settingsStore[key]

    // Essayer de supprimer au backend
    try {
      await fetch(`${API_BASE_URL}/settings?key=${key}`, {
        method: 'DELETE',
        headers: {
          ...(request.headers.get('Authorization') && {
            'Authorization': request.headers.get('Authorization') || ''
          })
        }
      })
    } catch {
      console.log('Backend non disponible')
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètre supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur DELETE settings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du paramètre' },
      { status: 500 }
    )
  }
}
