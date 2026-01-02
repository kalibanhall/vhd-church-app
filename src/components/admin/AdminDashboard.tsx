import { Users, DollarSign, Calendar, Heart, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { authenticatedFetch } from '@/lib/auth-fetch'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface AdminStats {
  totalMembers: number;
  activeMembers: number;
  todaysPresence: number;
  monthlyDonations: number;
  pendingPrayers: number;
  upcomingEvents: number;
  pendingTestimonies: number;
  thisWeekAttendance: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalMembers: 0,
    activeMembers: 0,
    todaysPresence: 0,
    monthlyDonations: 0,
    pendingPrayers: 0,
    upcomingEvents: 0,
    pendingTestimonies: 0,
    thisWeekAttendance: 0
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      const response = await authenticatedFetch('/api/analytics-proxy')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.analytics) {
          const analytics = data.analytics
          setStats({
            totalMembers: analytics.totalMembers || 0,
            activeMembers: analytics.totalMembers || 0, // Tous les membres retournés sont actifs
            todaysPresence: analytics.newMembersThisMonth || 0, // Approximation
            monthlyDonations: Math.round(analytics.totalDonationsThisMonth || 0),
            pendingPrayers: analytics.prayersThisMonth || 0,
            upcomingEvents: analytics.upcomingEvents || 0,
            pendingTestimonies: analytics.testimoniesThisMonth || 0,
            thisWeekAttendance: analytics.totalMessages || 0 // Approximation avec l'activité
          })
          
          // Utiliser les activités récentes de l'API
          if (analytics.recentDonations && Array.isArray(analytics.recentDonations)) {
            setRecentActivities(analytics.recentDonations.slice(0, 5).map((donation: any) => ({
              type: 'donation',
              description: donation.description || 'Don',
              time: new Date(donation.date).toLocaleDateString('fr-FR')
            })))
          }
        } else {
          // Données invalides
          setStats({
            totalMembers: 0,
            activeMembers: 0,
            todaysPresence: 0,
            monthlyDonations: 0,
            pendingPrayers: 0,
            upcomingEvents: 0,
            pendingTestimonies: 0,
            thisWeekAttendance: 0
          })
          setRecentActivities([])
        }
      } else {
        console.log('API analytics non disponible, status:', response.status)
        // Si l'API n'est pas disponible, ne pas afficher de données fictives
        setStats({
          totalMembers: 0,
          activeMembers: 0,
          todaysPresence: 0,
          monthlyDonations: 0,
          pendingPrayers: 0,
          upcomingEvents: 0,
          pendingTestimonies: 0,
          thisWeekAttendance: 0
        })
        setRecentActivities([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des stats admin:', error)
      // En cas d'erreur, afficher des données vides plutôt que fictives
      setStats({
        totalMembers: 0,
        activeMembers: 0,
        todaysPresence: 0,
        monthlyDonations: 0,
        pendingPrayers: 0,
        upcomingEvents: 0,
        pendingTestimonies: 0,
        thisWeekAttendance: 0
      })
      setRecentActivities([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
  }
  const statCards = [
    {
      icon: Users,
      label: 'Membres totaux',
      value: stats.totalMembers.toString(),
      change: '+5%',
      color: 'blue'
    },
    {
      icon: Users,
      label: 'Membres actifs',
      value: stats.activeMembers.toString(),
      change: '+2%',
      color: 'green'
    },
    {
      icon: Calendar,
      label: 'Présence aujourd&apos;hui',
      value: stats.todaysPresence.toString(),
      change: '+12%',
      color: 'purple'
    },
    {
      icon: DollarSign,
      label: 'Soutien du mois',
      value: `${stats.monthlyDonations.toLocaleString()} CDF`,
      change: '+8%',
      color: 'orange'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
        <p className="text-gray-600">Aperçu général des activités de l&apos;église</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <div className="inline-flex items-center mt-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {card.change}
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-${card.color}-100 text-${card.color}-600`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Activités récentes</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">{activity.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}