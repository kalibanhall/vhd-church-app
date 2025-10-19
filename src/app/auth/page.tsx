'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    rememberMe: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        if (isLogin) {
          // Le cookie est automatiquement défini par l'API
          await login() // Vérifier l'authentification
          router.push('/')
        } else {
          setIsLogin(true)
        setFormData({ ...formData, password: '', rememberMe: false })
        setError('Inscription réussie ! Vous pouvez maintenant vous connecter.')
        }
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(`Erreur de connexion: ${error.message || 'Serveur indisponible'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen flex">
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative"
        style={{ 
          backgroundImage: 'linear-gradient(135deg, rgba(59, 130, 246, 0.85) 0%, rgba(147, 51, 234, 0.85) 100%), url(/images/logos/vhd-logo.jpg)',
          backgroundSize: '60%',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-purple-900/80 to-blue-800/90"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 text-center">
          <div className="mb-8">
            <img 
              src="/images/logos/vhd-logo.jpg" 
              alt="Logo VHD" 
              className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white/30 shadow-2xl object-cover"
            />
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Ministères Vaillants<br />
              <span className="text-yellow-300">Hommes de David</span>
            </h1>
            <p className="text-xl font-medium mb-8 text-blue-100">
              Où Dieu convertit le <span className="text-yellow-300 font-bold">POTENTIEL</span><br />
              en l'<span className="text-yellow-300 font-bold">EXTRAORDINAIRE</span>
            </p>
          </div>
          
          <div className="max-w-md">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <h3 className="text-lg font-semibold mb-3"> Bienvenue dans votre espace</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Accédez à votre espace personnel pour gérer vos activités, 
                participer aux discussions et suivre votre parcours spirituel.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="lg:hidden mb-8">
              <img 
                src="/images/logos/vhd-logo.jpg" 
                alt="Logo VHD" 
                className="w-20 h-20 mx-auto mb-4 rounded-full object-cover border-2 border-blue-200 shadow-lg"
              />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Connexion' : 'Inscription'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isLogin ? 'Accédez à votre espace VHD' : 'Rejoignez la communauté VHD'}
            </p>
          </div>

          {error && (
            <div className={error.includes('réussie') 
                ? 'bg-green-50 text-green-700 border border-green-200 p-4 rounded-lg text-center' 
                : 'bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg text-center'
            }>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="+243 900 000 000"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="votre.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                    Se souvenir de moi
                  </label>
                </div>
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => router.push('/auth/forgot-password')}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Chargement...
                </div>
              ) : (
                isLogin ? 'Se connecter' : 'S\'inscrire'
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '', rememberMe: false })
              }}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            >
              {isLogin ? 'Pas de compte ? Inscrivez-vous ici' : 'Déjà un compte ? Connectez-vous ici'}
            </button>
          </div>



          <footer className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200">
            <p className="mb-1"> 2025 Ministères Vaillants Hommes de David</p>
            <p className="text-xs italic text-blue-600 font-medium">
              Où Dieu convertit le POTENTIEL en l'EXTRAORDINAIRE
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
