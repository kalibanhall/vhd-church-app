import { Calendar, Users, DollarSign, Heart } from 'lucide-react'

interface HomePageProps {
  user: any;
  events: any[];
  sermons: any[];
  stats: {
    nextEvent: any;
    recentSermons: number;
    totalPrayers: number;
    monthlyDonations: number;
  };
}

export default function HomePage({ user, events, sermons, stats }: HomePageProps) {
  const quickActions = [
    {
      icon: Calendar,
      label: 'Prochain culte',
      value: stats.nextEvent?.title || 'Aucun',
      subtitle: stats.nextEvent ? `${stats.nextEvent.eventDate} à ${stats.nextEvent.startTime}` : '',
      color: 'bg-[#ffc200]'
    },
    {
      icon: Users,
      label: 'Prédications récentes',
      value: stats.recentSermons.toString(),
      subtitle: 'Nouveaux messages',
      color: 'bg-green-500'
    },
    {
      icon: Heart,
      label: 'Intentions de prière',
      value: stats.totalPrayers.toString(),
      subtitle: 'En attente de prière',
      color: 'bg-[#ffc200]'
    },
    {
      icon: DollarSign,
      label: 'Soutien du mois',
      value: `${stats.monthlyDonations.toLocaleString()} FC`,
      subtitle: 'Total collecté',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#ffc200] to-[#cc9b00] rounded-2xl p-6 text-[#0a0a0a]">
        <h1 className="text-2xl font-bold mb-2">
          Bienvenue, {user.firstName} {user.lastName}
        </h1>
        <p className="text-[#3d3200]">
          Que la paix du Seigneur soit avec vous en ce jour béni.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{action.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{action.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{action.subtitle}</p>
                </div>
                <div className={`${action.color} p-3 rounded-full`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Événements à venir</h2>
          <div className="space-y-4">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-[#fff3cc] p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-[#cc9b00]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {event.eventDate} à {event.startTime} • {event.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dernières prédications</h2>
          <div className="space-y-4">
            {sermons.slice(0, 3).map((sermon) => (
              <div key={sermon.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{sermon.title}</p>
                  <p className="text-sm text-gray-600">
                    Par {sermon.preacherName} • {sermon.sermonDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}