// Configuration centralisée pour l'authentification
export const AUTH_CONFIG = {
  cookie: {
    name: 'auth-token',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/',
      domain: undefined
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: '7d'
  }
}

// Fonction utilitaire pour définir le cookie d'authentification
export function setAuthCookie(response: any, token: string, rememberMe: boolean = false) {
  const cookieOptions = {
    ...AUTH_CONFIG.cookie.options,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // 30 jours ou 7 jours en secondes
  }
  response.cookies.set(AUTH_CONFIG.cookie.name, token, cookieOptions)
  return response
}

// Fonction utilitaire pour supprimer le cookie d'authentification
export function clearAuthCookie(response: any) {
  response.cookies.set(AUTH_CONFIG.cookie.name, '', {
    ...AUTH_CONFIG.cookie.options,
    maxAge: 0
  })
  return response
}