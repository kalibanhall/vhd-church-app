# Guide Redémarrage Backend Render

## ⚠️ ACTION REQUISE IMMÉDIATEMENT

Le code backend a été **corrigé et pushedé** (commit 231079d), mais Render utilise encore **l'ancienne version en cache**.

## 🔄 Comment Redémarrer le Service Render

### Option 1: Redémarrage Manuel (RECOMMANDÉ)
1. Aller sur **https://dashboard.render.com**
2. Se connecter avec votre compte
3. Cliquer sur le service **vhd-church-api** (ou nom similaire)
4. Cliquer sur **"Manual Deploy"** → **"Deploy latest commit"**
   OU
5. Cliquer sur **"Settings"** → **"Restart"**

### Option 2: Attendre Auto-Deploy (5-10 minutes)
Render détecte automatiquement le push GitHub et redéploie.

**Vérifier le déploiement**:
- Dashboard Render → Onglet "Events"
- Statut doit passer de "Building" → "Live"

## ✅ Vérification Post-Redémarrage

### Test 1: Health Check
```bash
curl https://vhd-church-api.onrender.com/health
```
Doit retourner: `{"status":"ok"}`

### Test 2: Prédications (ancien sermons)
```bash
curl https://vhd-church-api.onrender.com/v1/preachings
```
- ✅ Si 200 OK → CORRIGÉ
- ❌ Si 500 "sermons not found" → Ancien cache encore actif

### Test 3: Prières (ancien description)
```bash
curl -X POST https://vhd-church-api.onrender.com/v1/prayers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content"}'
```
- ✅ Si 201 Created → CORRIGÉ
- ❌ Si 500 "description not found" → Ancien cache encore actif

## 🕐 Timeline Attendue

| Temps | Action |
|-------|--------|
| T+0 | Push GitHub effectué (231079d) ✅ |
| T+1min | Render détecte le commit |
| T+2min | Build démarre (npm install, npm run build) |
| T+5min | Déploiement du nouveau container |
| T+6min | Ancien container arrêté, nouveau actif |
| T+7min | **Tous les endpoints fonctionnent** ✅ |

## 📊 Erreurs qui Vont Disparaître

Après redémarrage, ces erreurs **ne devraient plus apparaître**:

```
❌ Could not find the table 'public.sermons'
❌ Could not find the 'description' column of 'prayers'
❌ Could not find the 'status' column of 'testimonies'
❌ Could not find the table 'public.sondages'
❌ 404 on /v1/appointments/member
❌ 400 on /v1/notifications?unread=true
❌ 403 on /v1/user/:userId/stats
```

## 🎯 Tests Complets (Après Redémarrage)

### Frontend Web
1. Page Prédications → Charge sans erreur 500 ✅
2. Soumettre prière → Succès (plus d'erreur description) ✅
3. Soumettre témoignage → Succès (plus d'erreur status) ✅
4. Page Sondages → Charge sans erreur 500 ✅
5. Rendez-vous membres → Affiche la liste (plus 404) ✅
6. Notifications → Badge non lues fonctionne (plus 400) ✅
7. Profil → Stats réelles s'affichent (plus 403) ✅

### Mobile PWA
- Mêmes tests que web
- Vérifier que les données s'affichent

## 🚨 Si Ça Ne Fonctionne Toujours Pas

### Scenario 1: Cache Supabase
Supabase peut avoir son propre cache de schéma. **Attendre 5-10 minutes** supplémentaires.

### Scenario 2: Variables Env Manquantes
Vérifier dans Render Dashboard → Settings → Environment:
- ✅ `SUPABASE_URL` défini
- ✅ `SUPABASE_ANON_KEY` défini
- ✅ `JWT_SECRET` défini

### Scenario 3: Build Failed
Logs Render → Vérifier qu'il n'y a pas d'erreur TypeScript pendant `npm run build`

## 📞 Prochaine Étape

**Attendre 5-10 minutes**, puis tester une des routes corrigées:

```bash
# Test rapide
curl https://vhd-church-api.onrender.com/v1/preachings
```

Si retourne **200 OK avec données** → ✅ TOUT EST FIXÉ!  
Si retourne **500 "sermons"** → ⏳ Attendre encore ou redémarrer manuellement.
