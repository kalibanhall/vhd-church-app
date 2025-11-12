// Fonction utilitaire pour les appels API authentifiés
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  // Récupérer le token depuis localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Ajouter le header Authorization si token présent
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Fusionner avec les headers fournis
  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }
  
  const defaultOptions: RequestInit = {
    credentials: 'include', // Toujours inclure les cookies
    headers,
    ...options,
  }

  // Si c'est FormData, on retire le Content-Type pour laisser le navigateur le définir
  if (options.body instanceof FormData) {
    delete (defaultOptions.headers as any)['Content-Type']
  }

  try {
    const response = await fetch(url, defaultOptions)
    
    // Log pour débugger
    console.log(`API Call: ${options.method || 'GET'} ${url}`, {
      status: response.status,
      ok: response.ok
    })

    return response
  } catch (error) {
    console.error(`Erreur API ${url}:`, error)
    throw error
  }
}

// Fonction pour vérifier si l'utilisateur est authentifié
export async function checkAuth() {
  try {
    const response = await authenticatedFetch('/api/auth/me')
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error('Erreur de vérification auth:', error)
    return null
  }
}