'use client'

import { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  Users, DollarSign, Calendar, TrendingUp, Heart, BookOpen, 
  Video, UserPlus, Eye, Download, MessageSquare, Activity 
} from 'lucide-react'

interface TopSermon {
  id: string
  title: string
  viewCount: number
  downloadCount: number
  createdAt: string
  event?: {
    title: string
    eventDate: string
  }
}

interface UserEngagement {
  id: string
  name: string
  totalInteractions: number
  donations: number
  prayers: number
  testimonies: number
  messages: number
}

interface AnalyticsData {
  totalMembers: number
  newMembersThisMonth: number
  totalDonationsThisMonth: number
  totalDonationsThisYear: number
  totalEvents: number
  upcomingEvents: number
  totalSermons: number
  publishedSermons: number
  totalSermonViews: number
  totalSermonDownloads: number
  totalPrayers: number
  prayersThisMonth: number
  totalTestimonies: number
  testimoniesThisMonth: number
  totalMessages: number
  messagesThisMonth: number
  memberGrowth: number
  donationGrowth: number
  topSermons: TopSermon[]
  userEngagement: UserEngagement[]
  recentDonations: any[]
  recentEvents: any[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await authenticatedFetch('/api/analytics-proxy')

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des analytics')
      }

      const data = await response.json()
      if (data.success) {
        setAnalytics(data.analytics)
      } else {
        throw new Error(data.error || 'Erreur inconnue')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="md" text="Chargement des statistiques..." />
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Erreur</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Métriques</h1>
        <p className="text-gray-600 mt-2">Données temps réel de votre église</p>
        <div className="text-sm text-gray-500 mt-1">
          Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
        </div>
      </div>

      {/* Stats Cards - Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-[#e6af00] bg-[#fffefa]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3d3200]">Total Membres</CardTitle>
            <Users className="h-4 w-4 text-[#cc9b00]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#3d3200]">{analytics.totalMembers}</div>
            <p className="text-xs text-[#cc9b00]">
              +{analytics.newMembersThisMonth} ce mois ({analytics.memberGrowth > 0 ? '+' : ''}{analytics.memberGrowth}%)
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Dons ce mois</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{analytics.totalDonationsThisMonth.toLocaleString()} CDF</div>
            <p className="text-xs text-green-600">
              {analytics.donationGrowth > 0 ? '+' : ''}{analytics.donationGrowth}% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Événements</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{analytics.totalEvents}</div>
            <p className="text-xs text-purple-600">{analytics.upcomingEvents} à venir</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Prédications</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{analytics.totalSermons}</div>
            <p className="text-xs text-orange-600">{analytics.publishedSermons} publiées</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Vues Prédications</CardTitle>
            <Eye className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{analytics.totalSermonViews}</div>
            <p className="text-xs text-red-600">Total des vues</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">Téléchargements</CardTitle>
            <Download className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{analytics.totalSermonDownloads}</div>
            <p className="text-xs text-indigo-600">Prédications téléchargées</p>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-teal-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-800">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">{analytics.totalMessages}</div>
            <p className="text-xs text-teal-600">+{analytics.messagesThisMonth} ce mois</p>
          </CardContent>
        </Card>

        <Card className="border-pink-200 bg-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-pink-800">Prières & Témoignages</CardTitle>
            <Heart className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-900">{analytics.totalPrayers + analytics.totalTestimonies}</div>
            <p className="text-xs text-pink-600">
              {analytics.prayersThisMonth + analytics.testimoniesThisMonth} ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top prédications les plus vues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Prédications les plus vues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topSermons.slice(0, 5).map((sermon, index) => (
                <div key={sermon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{sermon.title}</div>
                    <div className="text-xs text-gray-500">
                      {sermon.event?.title} • {new Date(sermon.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[#cc9b00]">{sermon.viewCount} vues</div>
                    <div className="text-xs text-gray-500">{sermon.downloadCount} téléchargements</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Engagement des membres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Membres les plus actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.userEngagement.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500">
                      {user.donations} dons • {user.prayers} prières • {user.testimonies} témoignages • {user.messages} messages
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">{user.totalInteractions}</div>
                    <div className="text-xs text-gray-500">interactions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Donations récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.recentDonations.slice(0, 5).map((donation) => (
                <div key={donation.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{donation.user}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(donation.date).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold">{donation.amount.toLocaleString()} CDF</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Événements à venir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.recentEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-gray-500">
                      Par {event.creator} • {event.status}
                    </div>
                  </div>
                  <div className="text-[#cc9b00] font-semibold text-xs">
                    {new Date(event.date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
