import { User, Mail, Phone } from 'lucide-react'

export default function ProfilePage({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <p className="p-3 bg-gray-50 rounded-lg">{user.firstName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <p className="p-3 bg-gray-50 rounded-lg">{user.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-2" />
                Email
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Téléphone
              </label>
              <p className="p-3 bg-gray-50 rounded-lg">{user.phone}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="text-center mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="h-10 w-10" />
            </div>
            <p className="text-sm opacity-80">Carte de membre numérique</p>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-xl font-bold">{user.firstName} {user.lastName}</h3>
            <p className="text-blue-200">Membre actif</p>
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="opacity-80">N° membre</p>
              <p className="font-mono">{user.membershipNumber}</p>
            </div>
            <div className="text-right">
              <p className="opacity-80">Membre depuis</p>
              <p>{user.membershipDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}