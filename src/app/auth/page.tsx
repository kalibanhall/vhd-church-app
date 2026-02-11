'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'FIDELE', // Role par défaut
    rememberMe: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsClient(true)
  }, [])

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

    // Validation pour l'inscription
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        setLoading(false)
        return
      }
      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères')
        setLoading(false)
        return
      }
    }

    try {
      // Utiliser la route API proxy pour éviter les problèmes CORS
      const endpoint = isLogin ? '/api/auth/login-proxy' : '/api/auth/register-proxy'
      
      console.log('🔐 Auth request to:', endpoint)
      console.log('📤 Form data:', { email: formData.email, password: '***' })
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      console.log('📊 Response status:', response.status)
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))

      // Vérifier si la réponse est du JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('❌ Response is not JSON:', textResponse)
        throw new Error('Le serveur a retourné une réponse invalide. Veuillez réessayer.')
      }

      const data = await response.json()
      console.log('📦 Response data:', { ...data, token: data.token ? '***' : undefined })

      if (response.ok) {
        if (isLogin) {
          console.log('✅ Login successful!')
          // Sauvegarder le token et les données utilisateur
          if (data.token) {
            console.log('💾 Saving token to localStorage')
            localStorage.setItem('token', data.token)
          }
          if (data.user) {
            console.log('💾 Saving user to localStorage:', data.user)
            localStorage.setItem('user', JSON.stringify(data.user))
          }
          
          console.log('🔄 Redirecting to /')
          // Redirection vers l'accueil
          window.location.href = '/'
        } else {
          setIsLogin(true)
          setFormData({ ...formData, password: '', confirmPassword: '', rememberMe: false })
          setError('Inscription réussie ! Vous pouvez maintenant vous connecter.')
        }
      } else {
        console.error('❌ Login failed:', data.error)
        setError(data.error || 'Une erreur est survenue')
      }
    } catch (error: any) {
      console.error('💥 Auth error:', error)
      setError(error.message || 'Erreur de connexion au serveur. Vérifiez votre connexion internet.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panneau latéral gauche - Design MyChurchApp */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat relative"
        style={{ 
          backgroundImage: 'linear-gradient(135deg, rgba(255, 194, 0, 0.9) 0%, rgba(204, 155, 0, 0.9) 100%), url(/images/logos/mychurchapp-logo.svg)',
          backgroundSize: '60%',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#cc9b00]/90 via-[#ffc200]/80 to-[#ffda66]/90"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-[#0a0a0a] p-12 text-center">
          <div className="mb-8">
            <img 
              src="/images/logos/mychurchapp-logo.svg" 
              alt="Logo MyChurchApp" 
              className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white/50 shadow-2xl object-cover"
            />
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              MyChurchApp<br />
              <span className="text-white drop-shadow-md">Votre Église Connectée</span>
            </h1>
            <p className="text-xl font-medium mb-8 text-[#0a0a0a]/80">
              Gérez votre communauté<br />
              avec <span className="text-white font-bold drop-shadow-md">simplicité</span>
            </p>
          </div>
          
          <div className="max-w-md">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-6 border border-white/40 shadow-church-lg">
              <h3 className="text-lg font-semibold mb-3">✨ Bienvenue dans votre espace</h3>
              <p className="text-[#0a0a0a]/70 text-sm leading-relaxed">
                Accédez à votre espace personnel pour gérer vos activités, 
                participer aux discussions et suivre votre parcours spirituel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panneau droit - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#fffefa] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="lg:hidden mb-8">
              <img 
                src="/images/logos/mychurchapp-logo.svg" 
                alt="Logo MyChurchApp" 
                className="w-20 h-20 mx-auto mb-4 rounded-full object-cover border-2 border-[#ffc200] shadow-church"
              />
            </div>
            
            <h2 className="text-3xl font-bold text-[#0a0a0a] mb-2">
              {isLogin ? 'Connexion' : 'Inscription'}
            </h2>
            <p className="text-[#999] mb-6">
              {isLogin ? 'Accédez à votre espace' : 'Rejoignez la communauté'}
            </p>
          </div>

          {error && (
            <div className={error.includes('réussie') 
                ? 'bg-[#34a853]/10 text-[#34a853] border border-[#34a853]/20 p-4 rounded-md text-center' 
                : 'bg-red-50 text-red-700 border border-red-200 p-4 rounded-md text-center'
            }>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#0a0a0a] mb-2">
                      Prénom
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#fffefa] border border-[rgba(201,201,201,0.3)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffc200] focus:border-transparent transition-all"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#0a0a0a] mb-2">
                      Nom
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#fffefa] border border-[rgba(201,201,201,0.3)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffc200] focus:border-transparent transition-all"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#0a0a0a] mb-2">
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#fffefa] border border-[rgba(201,201,201,0.3)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffc200] focus:border-transparent transition-all"
                    placeholder="+243 900 000 000"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-[#0a0a0a] mb-2">
                    Je souhaite m&apos;inscrire comme
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#fffefa] border border-[rgba(201,201,201,0.3)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffc200] focus:border-transparent transition-all"
                  >
                    <option value="FIDELE">Fidèle (Membre de l&apos;église)</option>
                    <option value="OUVRIER">Ouvrier (Serviteur dans l&apos;église)</option>
                    <option value="PASTOR">Pasteur</option>
                  </select>
                  <p className="text-xs text-[#999] mt-1">
                    Note : Les comptes Pasteur et Admin nécessitent une validation
                  </p>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0a0a0a] mb-2">
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
                className="w-full px-4 py-3 bg-[#fffefa] border border-[rgba(201,201,201,0.3)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffc200] focus:border-transparent transition-all"
                placeholder="votre.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0a0a0a] mb-2">
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
                  className="w-full px-4 py-3 pr-12 bg-[#fffefa] border border-[rgba(201,201,201,0.3)] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffc200] focus:border-transparent transition-all"
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#999] hover:text-[#0a0a0a] transition-colors"
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

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0a0a0a] mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 bg-[#fffefa] border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                        : 'border-[rgba(201,201,201,0.3)] focus:ring-[#ffc200]'
                    }`}
                    placeholder=""
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#999] hover:text-[#0a0a0a] transition-colors"
                    title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                    className="h-4 w-4 text-[#ffc200] focus:ring-[#ffc200] border-[rgba(201,201,201,0.3)] rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-[#0a0a0a]">
                    Se souvenir de moi
                  </label>
                </div>
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="font-medium text-[#cc9b00] hover:text-[#ffc200]"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffda66] text-[#0a0a0a] py-3 px-4 rounded-md hover:bg-[#ffc200] focus:outline-none focus:ring-2 focus:ring-[#ffc200] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-church"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0a0a0a] mr-2"></div>
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
                setFormData({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: '', role: 'FIDELE', rememberMe: false })
              }}
              className="text-[#cc9b00] hover:text-[#ffc200] text-sm font-medium transition-colors"
            >
              {isLogin ? 'Pas de compte ? Inscrivez-vous ici' : 'Déjà un compte ? Connectez-vous ici'}
            </button>
          </div>



          <footer className="text-center text-sm text-[#999] pt-8 border-t border-[rgba(201,201,201,0.3)]">
            <p className="mb-1">© 2025 MyChurchApp</p>
            <p className="text-xs italic text-[#cc9b00] font-medium">
              Votre église, connectée et organisée
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
