/**
 * Utilitaire pour les appels API authentifiés depuis le frontend
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

/**
 * Fonction fetch authentifiée qui ajoute automatiquement le token d'authentification
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Récupérer le token du localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // Fusionner les headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  // Ajouter le token si disponible
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Effectuer la requête avec le token
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Inclure les cookies si présents
  })
}

/**
 * Wrapper pour les appels API GET authentifiés
 */
export async function authenticatedGet(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'GET' })
}

/**
 * Wrapper pour les appels API POST authentifiés
 */
export async function authenticatedPost(
  url: string,
  body: any
): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * Wrapper pour les appels API PUT authentifiés
 */
export async function authenticatedPut(
  url: string,
  body: any
): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

/**
 * Wrapper pour les appels API DELETE authentifiés
 */
export async function authenticatedDelete(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'DELETE' })
}

/**
 * Wrapper pour les appels API PATCH authentifiés
 */
export async function authenticatedPatch(
  url: string,
  body: any
): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
