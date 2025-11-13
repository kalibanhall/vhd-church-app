# BACKEND SCHEMA FIXES - Supabase Database Alignment
**Auteur**: CHRIS NGOZULU KASONGO (KalibanHall)  
**Date**: 13 Novembre 2025  
**Commit**: 231079d

## 🔧 Problème Racine

Le **backend TypeScript** utilisait des **noms de tables et colonnes incorrects** qui ne correspondaient pas à la **vraie structure Supabase**.

### Erreurs Supabase (PGRST204/PGRST205)
```
❌ Could not find the table 'public.sermons' in the schema cache
❌ Could not find the 'description' column of 'prayers'  
❌ Could not find the 'status' column of 'testimonies'
❌ Could not find the table 'public.sondages'
```

## 📊 Corrections de Schéma

### 1. **Prédications (Preachings)**
**Erreur**: Backend utilisait `from('sermons')`  
**Vérité**: Table s'appelle `preachings` dans Supabase

**Fichier**: `api-backend/src/routes/preachings.ts`

```typescript
// ❌ AVANT
const { data: sermons } = await supabase.from('sermons').select('*')

// ✅ APRÈS
const { data: preachings } = await supabase.from('preachings').select('*')
```

**Colonnes confirmées**:
```
id, title, description, preacher, date, video_url, audio_url, created_at
```

**Corrections** (4 occurrences):
- GET `/preachings` - Liste complète
- GET `/preachings/:id` - Détail
- POST `/preachings` - Création
- PUT `/preachings/:id` - Modification
- DELETE `/preachings/:id` - Suppression

---

### 2. **Prières (Prayers)**
**Erreur**: Backend utilisait colonne `description`  
**Vérité**: Colonne s'appelle `content` dans Supabase

**Fichier**: `api-backend/src/routes/prayers.ts`

```typescript
// ❌ AVANT
.insert([{
  user_id: authUser.id,
  title,
  description,  // ← Colonne inexistante!
  is_anonymous: isAnonymous || false,
  status: 'PENDING'
}])

// ✅ APRÈS
.insert([{
  user_id: authUser.id,
  title,
  content,  // ← Bon nom
  category: category || 'GENERAL',
  is_public: isPublic !== undefined ? isPublic : true,
  is_anonymous: isAnonymous || false,
  status: 'PENDING'
}])
```

**Colonnes confirmées**:
```
id, user_id, title, content, category, is_public, is_anonymous, 
status, is_answered, answered_date, approved_by, approved_at, 
prayer_count, created_at, updated_at
```

---

### 3. **Témoignages (Testimonies)**
**Erreur**: Backend utilisait colonne `status`  
**Vérité**: Utilise `is_approved` + `is_published` dans Supabase

**Fichier**: `api-backend/src/routes/testimonies.ts`

```typescript
// ❌ AVANT
.insert([{
  user_id: authUser.id,
  title,
  content,
  is_anonymous: isAnonymous || false,
  status: 'PENDING'  // ← Colonne inexistante!
}])

// ✅ APRÈS
.insert([{
  user_id: authUser.id,
  title,
  content,
  is_anonymous: isAnonymous || false,
  is_approved: false,  // ← Bon schéma
  is_published: false,
  category: category || 'GENERAL'
}])
```

**Colonnes confirmées**:
```
id, user_id, title, content, is_anonymous, is_approved, approved_by, 
approved_at, is_published, published_at, category, image_url, 
view_count, created_at, updated_at
```

---

### 4. **Sondages (Polls)**
**Erreur**: Backend utilisait `from('sondages')` et `from('sondages_votes')`  
**Vérité**: Tables s'appellent `polls` et `poll_votes` en anglais

**Fichier**: `api-backend/src/routes/polls.ts`

```powershell
# Remplacement automatique (8 occurrences)
(Get-Content polls.ts) `
  -replace "from\('sondages'\)", "from('polls')" `
  -replace "from\('sondages_votes'\)", "from('poll_votes')" `
  | Set-Content polls.ts
```

**Tables corrigées**:
- `sondages` → `polls`
- `sondages_votes` → `poll_votes`

---

### 5. **Rendez-vous Membres (Appointments/Member)**
**Erreur**: Route `/appointments/member` n'existait pas (404)  
**Solution**: Création de la route complète

**Fichier**: `api-backend/src/routes/appointments.ts`

Le fichier était quasi vide (stub):
```typescript
// ❌ AVANT (4 lignes)
import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => res.json({ success: true, data: [] }));
export default router;
```

**Créé** (157 lignes):
- GET `/appointments` - Tous les RDV (ADMIN/PASTOR)
- GET `/appointments/member` - RDV du membre authentifié ✅
- POST `/appointments` - Création de RDV

```typescript
router.get('/member', authenticate, async (req, res) => {
  const authUser = (req as any).user;

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      pastor:users!pastor_id (id, first_name, last_name, email)
    `)
    .eq('user_id', authUser.id)
    .order('appointment_date', { ascending: true });

  res.json({ success: true, appointments: appointments || [] });
});
```

---

### 6. **Notifications avec Filtre Unread**
**Erreur**: Route n'acceptait pas le paramètre `?unread=true` (400 Bad Request)  
**Solution**: Ajout du filtre optionnel

**Fichier**: `api-backend/src/routes/notifications.ts`

```typescript
// ✅ APRÈS
router.get('/', authenticate, async (req, res) => {
  const { userId, unread } = req.query;
  
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', targetUserId);

  // Filtrer par statut de lecture si demandé
  if (unread === 'true') {
    query = query.eq('read', false);
  }

  const { data: notifications } = await query
    .order('created_at', { ascending: false })
    .limit(50);

  res.json({ success: true, data: notifications || [], unreadCount });
});
```

---

### 7. **User Stats - Comparaison UUID**
**Erreur**: Comparaison `parseInt(userId)` alors que userId est un UUID string (403 Forbidden)  
**Solution**: Comparaison directe de strings + role uppercase

**Fichier**: `api-backend/src/routes/userStats.ts`

```typescript
// ❌ AVANT
if (requestingUser.id !== parseInt(userId) && 
    requestingUser.role !== 'admin' && 
    requestingUser.role !== 'pastor') {
  return res.status(403).json({ error: 'Accès refusé' });
}

// ✅ APRÈS
if (requestingUser.id !== userId && 
    requestingUser.role !== 'ADMIN' && 
    requestingUser.role !== 'PASTOR') {
  console.log(`⚠️ User ${requestingUser.id} tried to access stats of ${userId}`);
  return res.status(403).json({ error: 'Accès refusé' });
}
```

**Problèmes corrigés**:
- `parseInt()` sur UUID → comparaison string directe
- `'admin'` → `'ADMIN'` (majuscules)
- `'pastor'` → `'PASTOR'` (majuscules)

---

## 📦 Fichiers Modifiés (7)

1. ✅ `api-backend/src/routes/preachings.ts` - sermons → preachings (4 références)
2. ✅ `api-backend/src/routes/prayers.ts` - description → content + champs additionnels
3. ✅ `api-backend/src/routes/testimonies.ts` - status → is_approved + is_published
4. ✅ `api-backend/src/routes/polls.ts` - sondages → polls (8 références)
5. ✅ `api-backend/src/routes/appointments.ts` - Création route /member
6. ✅ `api-backend/src/routes/notifications.ts` - Ajout filtre ?unread=true
7. ✅ `api-backend/src/routes/userStats.ts` - Fix UUID comparison + roles uppercase

---

## 🚀 Déploiement

### Build Local
```bash
cd api-backend
npm run build
✓ Compilation TypeScript réussie
```

### Git Push → Render Auto-Deploy
```bash
git add api-backend/
git commit -m "fix(backend): Correction noms tables/colonnes Supabase"
git push
```

**Status**: ✅ Push réussi (commit 231079d)  
**Render**: Auto-deploy en cours...

---

## 🧪 Tests à Effectuer Après Redémarrage Render

### 1. Prédications
- [ ] GET `/v1/preachings` retourne 200 (plus de 500)
- [ ] Liste affiche les prédications

### 2. Prières
- [ ] POST `/v1/prayers` avec `content` fonctionne (plus d'erreur `description`)
- [ ] Soumission de prière réussit

### 3. Témoignages
- [ ] POST `/v1/testimonies` avec `is_approved:false` fonctionne (plus d'erreur `status`)
- [ ] Soumission de témoignage réussit

### 4. Sondages (Polls)
- [ ] GET `/v1/polls` retourne 200 (plus d'erreur `sondages`)
- [ ] Liste des sondages s'affiche

### 5. Appointments Member
- [ ] GET `/v1/appointments/member` retourne 200 (plus de 404)
- [ ] Rendez-vous du membre s'affichent

### 6. Notifications
- [ ] GET `/v1/notifications?unread=true` retourne 200 (plus de 400)
- [ ] Compteur non lues fonctionne

### 7. User Stats
- [ ] GET `/v1/user/:userId/stats` retourne 200 (plus de 403)
- [ ] Profil affiche les vrais stats (dons, RDV, prières, témoignages)

---

## 📝 Notes Techniques

### Cache Supabase (PGRST)
Les erreurs `PGRST204` et `PGRST205` indiquent un **désalignement entre le code et le cache de schéma Supabase**. Le backend essayait d'accéder à des tables/colonnes qui n'existent pas dans la base de données réelle.

### Méthodologie de Débogage
```bash
# Vérifier structure réelle d'une table
node -e "
  require('dotenv').config();
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  supabase.from('TABLE_NAME').select('*').limit(1)
    .then(r => console.log('Columns:', Object.keys(r.data?.[0] || {})));
"
```

### Importance du Redémarrage Serveur
⚠️ **CRITIQUE**: Après `npm run build`, le serveur Render **DOIT être redémarré** pour charger le nouveau code compilé. Sinon, il continue d'utiliser l'ancien cache avec les mauvais noms de tables.

---

## ✅ Résumé

**7 routes corrigées** pour s'aligner avec le **vrai schéma Supabase**:

| Route | Erreur | Correction |
|-------|--------|-----------|
| Preachings | `sermons` table | → `preachings` |
| Prayers | `description` column | → `content` + category, is_public |
| Testimonies | `status` column | → `is_approved`, `is_published` |
| Polls | `sondages` table | → `polls` |
| Appointments | Route 404 | → Création `/member` |
| Notifications | Param `unread` ignoré | → Filtre `?unread=true` |
| UserStats | UUID `parseInt()` | → Comparaison string + UPPERCASE roles |

**Après redémarrage Render**: Toutes les erreurs 400/404/500 devraient disparaître! 🎉

---

**Prochain test**: Attendre le déploiement Render (3-5 min) puis retester toutes les fonctionnalités.
