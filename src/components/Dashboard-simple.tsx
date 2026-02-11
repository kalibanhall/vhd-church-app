'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Video, DollarSign } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

export default function DashboardSimple() {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('accueil')

  const handleLogout = async () => {
    await logout()
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'accueil':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bienvenue dans votre espace église
              </h2>
              <p className="text-gray-600">
                Gérez votre vie spirituelle et participez à la communauté.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" /> Prédications
                  </CardTitle>
                  <CardDescription>
                    Écoutez les dernières prédications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveSection('predications')}
                    className="w-full"
                  >
                    Voir les prédications
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" /> Soutien à l'œuvre
                  </CardTitle>
                  <CardDescription>
                    Gérez vos contributions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveSection('dons')}
                    className="w-full"
                  >
                    Apporter son soutien
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Prières
                  </CardTitle>
                  <CardDescription>
                    Partagez vos demandes de prière
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveSection('prieres')}
                    className="w-full"
                  >
                    Mes prières
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'predications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Prédications</h2>
              <Button 
                variant="outline"
                onClick={() => setActiveSection('accueil')}
              >
                Retour
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">
                  Section des prédications en développement.
                </p>
              </CardContent>
            </Card>
          </div>
        )

      case 'dons':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Soutien à l'œuvre</h2>
              <Button 
                variant="outline"
                onClick={() => setActiveSection('accueil')}
              >
                Retour
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">
                  Section du soutien à l'œuvre en développement.
                </p>
              </CardContent>
            </Card>
          </div>
        )

      case 'prieres':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Prières</h2>
              <Button 
                variant="outline"
                onClick={() => setActiveSection('accueil')}
              >
                Retour
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">
                  Section des prières en développement.
                </p>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Mon Église
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bonjour, {user?.email}
              </span>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="text-sm"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation simple */}
      <nav className="bg-[#ffc200] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-12 items-center">
            <button
              onClick={() => setActiveSection('accueil')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'accueil' 
                  ? 'bg-[#cc9b00] text-white' 
                  : 'text-[#fff3cc] hover:bg-[#ffc200]'
              }`}
            >
              Accueil
            </button>
            <button
              onClick={() => setActiveSection('predications')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'predications' 
                  ? 'bg-[#cc9b00] text-white' 
                  : 'text-[#fff3cc] hover:bg-[#ffc200]'
              }`}
            >
              Prédications
            </button>
            <button
              onClick={() => setActiveSection('dons')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'dons' 
                  ? 'bg-[#cc9b00] text-white' 
                  : 'text-[#fff3cc] hover:bg-[#ffc200]'
              }`}
            >
              Soutien à l'œuvre
            </button>
            <button
              onClick={() => setActiveSection('prieres')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'prieres' 
                  ? 'bg-[#cc9b00] text-white' 
                  : 'text-[#fff3cc] hover:bg-[#ffc200]'
              }`}
            >
              Prières
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  )
}

