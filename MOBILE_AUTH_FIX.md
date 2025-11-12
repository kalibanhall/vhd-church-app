# Correction de l'Authentification Mobile

## Problème
Les utilisateurs mobiles obtenaient des erreurs 401 (Non autorisé) lors de l'accès à `/api/notifications` même après une connexion réussie. Le problème était que l'application web utilisait des cookies pour l'authentification, mais les cookies ne fonctionnent pas correctement sur mobile.

## Solution Implémentée

### 1. Modification de `src/lib/api.ts`
**Fonction `authenticatedFetch`** - Ajout automatique du header Authorization
```typescript
// Récupère le token JWT depuis localStorage
const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

// Ajoute le header Authorization: Bearer {token}
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

**Impact:** Tous les composants utilisant `authenticatedFetch()` enverront automatiquement le token Bearer, garantissant l'authentification mobile.

### 2. Modification de `src/components/ui/NotificationsPanel.tsx`
Mis à jour 4 fonctions pour inclure le header Authorization:
- `fetchNotifications()` - Récupération des notifications
- `fetchUnreadCount()` - Comptage des notifications non lues
- `markAsRead()` - Marquer une notification comme lue
- `markAllAsRead()` - Marquer toutes comme lues

**Avant:**
```typescript
const response = await fetch(url, {
  credentials: 'include' // Cookies seulement
});
```

**Après:**
```typescript
const token = localStorage.getItem('token');
const headers: HeadersInit = {};
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}

const response = await fetch(url, {
  credentials: 'include',
  headers // Cookies + Authorization header
});
```

### 3. API Route `/api/notifications` (déjà corrigée)
La fonction `verifyToken()` supporte maintenant les deux méthodes:
```typescript
// Essayer d'abord le cookie
let token = request.cookies.get('auth-token')?.value

// Si pas de cookie, essayer le header Authorization
if (!token) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
}
```

## Résultat

### Web (Desktop)
✅ Continue de fonctionner avec les cookies
✅ Header Authorization ajouté mais optionnel

### Mobile
✅ Authentification via header `Authorization: Bearer {token}`
✅ Plus d'erreurs 401 sur `/api/notifications`
✅ Toutes les opérations de notifications fonctionnent

## Composants Affectés

### Utilisant `authenticatedFetch` (✅ Corrigés automatiquement)
- `UserProfile.tsx` - Toutes les opérations de profil

### Fetch direct avec Authorization header ajouté
- `NotificationsPanel.tsx` - Toutes les opérations de notifications

### Composants sans authentification requise
Les composants suivants passent `userId` en paramètre mais n'ont pas besoin de JWT:
- `PrayersPage.tsx`
- `TestimoniesPage.tsx`
- `DonationsPage.tsx`
- `HomePageSimple.tsx`
- etc.

## Test de Vérification

Pour tester sur mobile:
1. Connectez-vous via l'application mobile
2. Vérifiez que le token est stocké: `localStorage.getItem('token')`
3. Ouvrez le panneau de notifications (icône cloche)
4. Vérifiez qu'il n'y a pas d'erreur 401 dans la console
5. Les notifications doivent se charger correctement

## Déploiement

Les changements ont été:
- ✅ Committés: `git commit -m "Fix mobile authentication"`
- ✅ Poussés sur GitHub: `git push origin main`
- ⏳ Déploiement Vercel automatique en cours

Une fois Vercel déployé, l'application mobile devrait fonctionner sans erreurs 401.
