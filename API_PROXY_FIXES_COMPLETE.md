# Corrections des Erreurs API Proxy et Navigation
**Auteur**: CHRIS NGOZULU KASONGO (KalibanHall)  
**Date**: 13 Novembre 2025  
**Commit**: f052ce1

## 🐛 Problèmes Résolus

### 1. **Notifications-proxy: Erreur 400 (Bad Request)**
**Symptôme**: `/api/notifications-proxy?unread=true` retournait 400

**Cause**: Le paramètre `unread=true` n'était pas transmis au backend

**Solution**:
```typescript
// AVANT
const url = `${API_URL}/notifications${userId ? `?userId=${userId}` : ''}`

// APRÈS
const params = new URLSearchParams()
if (userId) params.append('userId', userId)
if (unread) params.append('unread', unread)
const queryString = params.toString()
const url = `${API_URL}/notifications${queryString ? `?${queryString}` : ''}`
```

**Fichier modifié**: `src/app/api/notifications-proxy/route.ts`

---

### 2. **Sermons-proxy: Erreur 500 (Internal Server Error)**
**Symptôme**: `/api/sermons-proxy` retournait 500

**Cause**: 
- Mauvaise gestion des erreurs (lecture JSON avant vérification du statut)
- Format de réponse inconsistant entre backend et frontend

**Solution**:
```typescript
// AVANT
const data = await response.json()
if (!response.ok) { ... }

// APRÈS
if (!response.ok) {
  const errorText = await response.text()
  console.error('❌ Backend preachings error:', response.status, errorText)
  return NextResponse.json(...)
}

const data = await response.json()
// Gérer plusieurs formats de réponse
return NextResponse.json({
  success: true,
  sermons: Array.isArray(data) ? data : (data.data || data.preachings || [])
})
```

**Fichier modifié**: `src/app/api/sermons-proxy/route.ts`

---

### 3. **Appointments Member: Erreur 404 (Not Found)**
**Symptôme**: `GET /api/appointments-proxy/member` retournait 404

**Cause**: La route n'existait pas (structure de dossier manquante)

**Solution**: Créer la route complète avec structure Next.js 15

**Fichier créé**: `src/app/api/appointments-proxy/member/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                request.cookies.get('auth-token')?.value
  
  const url = queryString 
    ? `${API_URL}/appointments/member?${queryString}` 
    : `${API_URL}/appointments/member`

  return NextResponse.json({
    success: true,
    appointments: Array.isArray(data) ? data : (data.appointments || data.data || [])
  })
}
```

**Composant mis à jour**: `src/components/member/MemberAppointments.tsx`
- Remplacement `fetch()` → `authenticatedFetch()`
- Gestion du format de réponse flexible

---

### 4. **Prayers/Testimonies: TypeError s.map is not a function**
**Symptôme**: Erreur `.map is not a function` lors de l'affichage des prières/témoignages

**Cause**: Le backend retournait parfois un objet au lieu d'un tableau

**Solution**: Normaliser la réponse au niveau du proxy ET du composant

**Proxies modifiés**:
- `src/app/api/prayers-proxy/route.ts`
- `src/app/api/testimonies-proxy/route.ts`

```typescript
// Proxy - garantir un tableau
const prayers = Array.isArray(data) ? data : (data.prayers || data.data || [])
return NextResponse.json({
  success: true,
  prayers: prayers
})
```

**Composants modifiés**:
- `src/components/user/PrayersPage.tsx`
- `src/components/user/TestimoniesPage.tsx`

```typescript
// Composant - double vérification
const prayersData = data.prayers || data.data || data
setPrayers(Array.isArray(prayersData) ? prayersData : [])
```

---

### 5. **Navigation: Bouton Retour → Page d'Authentification**
**Symptôme**: Cliquer sur le bouton retour du navigateur redirige vers `/auth` au lieu de la page précédente

**Cause**: Utilisation de `router.push('/auth')` qui ajoute une entrée dans l'historique

**Solution**: Utiliser `router.replace('/auth')` pour remplacer l'entrée actuelle sans ajouter à l'historique

**Fichiers modifiés**:
1. `src/contexts/AuthContext.tsx` (fonction `logout`)
2. `src/app/page.tsx` (redirection si non authentifié)

```typescript
// AVANT
router.push('/auth')

// APRÈS
router.replace('/auth')
```

**Comportement attendu**:
- ✅ Connexion → Accueil → Prières → Retour → Accueil (pas `/auth`)
- ✅ Déconnexion → `/auth` (sans possibilité de retour arrière vers page authentifiée)
- ✅ Session expirée → `/auth` (remplacement sans historique)

---

## 📊 Résumé des Modifications

### Fichiers Créés (1)
- ✅ `src/app/api/appointments-proxy/member/route.ts` - Route proxy pour rendez-vous membres

### Fichiers Modifiés (6)
1. ✅ `src/app/api/notifications-proxy/route.ts` - Transmission paramètres query
2. ✅ `src/app/api/sermons-proxy/route.ts` - Gestion erreurs + format réponse
3. ✅ `src/app/api/prayers-proxy/route.ts` - Normalisation tableau
4. ✅ `src/app/api/testimonies-proxy/route.ts` - Normalisation tableau
5. ✅ `src/contexts/AuthContext.tsx` - Navigation `replace` au lieu de `push`
6. ✅ `src/app/page.tsx` - Redirection `replace` au lieu de `push`

### Composants Mis à Jour (3)
1. ✅ `src/components/user/PrayersPage.tsx` - Gestion format réponse flexible
2. ✅ `src/components/user/TestimoniesPage.tsx` - Gestion format réponse flexible
3. ✅ `src/components/member/MemberAppointments.tsx` - authenticatedFetch + format flexible

---

## 🧪 Tests à Effectuer

### Web (Desktop)
- [ ] Notifications non lues affichent le bon nombre
- [ ] Prédications chargent sans erreur 500
- [ ] Prières affichent correctement (pas d'erreur .map)
- [ ] Témoignages affichent correctement (pas d'erreur .map)
- [ ] Bouton retour: Accueil → Prières → Retour → Accueil ✓
- [ ] Déconnexion → impossible de revenir en arrière vers page authentifiée

### Mobile (PWA)
- [ ] Accueil affiche les données (événements, stats)
- [ ] Prières: soumission fonctionne + affichage liste
- [ ] Témoignages: soumission fonctionne + affichage liste
- [ ] Rendez-vous membres chargent correctement
- [ ] Notifications affichent avec filtre `unread`
- [ ] Navigation retour fonctionne normalement (pas de redirection `/auth`)
- [ ] Après déconnexion, retour arrière ne revient pas à page authentifiée

---

## 🔧 Architecture Technique

### Pattern de Réponse Normalisé
Tous les proxies retournent maintenant:
```typescript
{
  success: true,
  [resourceName]: Array<T>  // Toujours un tableau
}
```

### Gestion des Erreurs
```typescript
if (!response.ok) {
  const errorText = await response.text()  // Lire texte d'abord
  console.error('❌ Error:', response.status, errorText)
  return NextResponse.json({ error: '...' }, { status: ... })
}

const data = await response.json()  // JSON seulement si OK
```

### Navigation Replace vs Push
- **`router.push()`**: Ajoute à l'historique (navigation normale)
- **`router.replace()`**: Remplace l'entrée actuelle (pas de retour arrière)

**Utilisation**:
- ✅ Déconnexion → `replace('/auth')` 
- ✅ Session expirée → `replace('/auth')`
- ❌ Navigation normale → `push()` (links, menu)

---

## 📈 Améliorations Apportées

1. **Robustesse**: Gestion de multiples formats de réponse backend
2. **Debugging**: Logs détaillés pour tracer les erreurs API
3. **UX**: Navigation fluide sans redirections intempestives
4. **Compatibilité**: Support des anciens et nouveaux formats de réponse
5. **Maintenabilité**: Code uniforme entre tous les proxies

---

## 🚀 Déploiement

**Status**: ✅ Déployé sur Vercel (commit f052ce1)

**Build**:
```
✓ Compiled successfully
✓ Generating static pages (62/62)
✓ Finalizing page optimization
Route Count: 62 routes
Bundle Size: 326 kB First Load JS
```

**Next Steps**:
1. Tester sur mobile PWA (notifications, prières, témoignages)
2. Vérifier la navigation (bouton retour)
3. Valider que les données s'affichent côté mobile
4. Confirmer que les erreurs console ont disparu

---

## 📝 Notes Techniques

### Pourquoi `.map is not a function`?
Le backend peut retourner:
- `data` (tableau direct)
- `{ data: [...] }` (objet avec propriété data)
- `{ prayers: [...] }` (objet avec propriété spécifique)
- `null` ou `undefined` (erreur)

**Solution**: Normaliser au niveau proxy + double vérification composant

### Pourquoi 404 sur `/member`?
Next.js 15 nécessite une structure de dossier:
```
/api/appointments-proxy/
  ├── route.ts           → /api/appointments-proxy
  └── member/
      └── route.ts       → /api/appointments-proxy/member
```

Créer `member/route.ts` au lieu de `member.ts`

### Pourquoi `replace` au lieu de `push`?
`push` empile dans l'historique:
```
[Login] → push(Home) → [Login, Home] → back → [Login] ✓
```

`replace` écrase l'entrée actuelle:
```
[Login] → replace(Home) → [Home] → back → [Previous Page] ✓
```

Évite: Home → Auth (expire) → Auth → back → Auth → back → Auth (boucle)

---

**Fin du rapport de correction**
