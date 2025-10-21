'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SimpleAuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [credentials, setCredentials] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Comptes pré-configurés pour tests (sans API)
  const validAccounts = [
    {
      email: 'admin@vhd.app',
      password: 'Qualis@2025',
      firstName: 'Chris',
      lastName: 'Kasongo',
      role: 'ADMIN',
      id: 'admin-001'
    },
    {
      email: 'pasteur@vhd.app', 
      password: 'Pastor@2025',
      firstName: 'Jean',
      lastName: 'Pasteur',
      role: 'PASTOR',
      id: 'pastor-001'
    },
    {
      email: 'member@vhd.app',
      password: 'Member@2025', 
      firstName: 'Marie',
      lastName: 'Fidèle',
      role: 'FIDELE',
      id: 'member-001'
    }
  ]

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Connexion
        const account = validAccounts.find(acc => 
          acc.email === credentials.email && acc.password === credentials.password
        )

        if (account) {
          // Créer session utilisateur
          const userData = {
            id: account.id,
            email: account.email,
            firstName: account.firstName,
            lastName: account.lastName,
            role: account.role,
            status: 'ACTIVE',
            phone: '+243123456789',
            profileImageUrl: null,
            membershipNumber: `${account.role}001`,
            membershipDate: '2025-01-01'
          }

          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('simpleAuth', 'true')
          localStorage.setItem('accessTime', new Date().toISOString())
          
          console.log('✅ Connexion réussie:', userData.role)
          router.push('/?simple-auth=true')
        } else {
          setError('Identifiants incorrects')
        }
      } else {
        // Inscription simplifiée
        if (credentials.email && credentials.password && credentials.firstName && credentials.lastName) {
          const newUser = {
            id: `user-${Date.now()}`,
            email: credentials.email,
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            role: 'FIDELE',
            status: 'ACTIVE',
            phone: '+243123456789',
            profileImageUrl: null,
            membershipNumber: `MBR${Date.now()}`,
            membershipDate: new Date().toISOString()
          }

          localStorage.setItem('user', JSON.stringify(newUser))
          localStorage.setItem('simpleAuth', 'true')
          localStorage.setItem('accessTime', new Date().toISOString())
          
          console.log('✅ Inscription réussie:', newUser)
          router.push('/?simple-auth=true')
        } else {
          setError('Veuillez remplir tous les champs')
        }
      }
    } catch (error) {
      console.error('Erreur auth simple:', error)
      setError('Erreur lors de l\'authentification')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Connexion' : 'Inscription'} Simplifiée
          </h1>
          <p className="text-gray-600">VHD Church - Mode Test</p>
          
          {/* Alerte mode test */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">⚡ Mode Test Activé</span><br/>
              Authentification sans APIs (contourne erreurs serveur)
            </p>
          </div>
        </div>

        {/* Comptes de test */}
        {isLogin && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Comptes de Test</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Admin:</strong> admin@vhd.app / Qualis@2025</div>
              <div><strong>Pasteur:</strong> pasteur@vhd.app / Pastor@2025</div>
              <div><strong>Membre:</strong> member@vhd.app / Member@2025</div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="votre@email.com"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={credentials.firstName}
                    onChange={(e) => setCredentials({ ...credentials, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Prénom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={credentials.lastName}
                    onChange={(e) => setCredentials({ ...credentials, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Chargement...
              </div>
            ) : (
              isLogin ? 'Se connecter' : 'S\'inscrire'
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin)
              setError('')
              setCredentials({ email: '', password: '', firstName: '', lastName: '' })
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            {isLogin ? 'Pas de compte ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous'}
          </button>
        </div>

        {/* Navigation */}
        <div className="mt-6 text-center space-y-2">
          <a href="/admin-access" className="block text-blue-600 hover:text-blue-800 text-sm">
            🔐 Accès Admin Direct
          </a>
          <a href="/" className="block text-gray-500 hover:text-gray-700 text-sm">
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  )
}