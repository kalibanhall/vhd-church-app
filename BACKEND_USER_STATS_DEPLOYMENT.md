# Instructions de déploiement - Route User Stats

## Fichier créé
`backend-routes/user-stats.js`

## Route ajoutée
**GET** `/v1/user/:userId/stats`

## Configuration dans server.js (ou index.js)

Ajouter cette ligne avec les autres routes:

```javascript
const userStatsRoutes = require('./routes/user-stats');
app.use('/v1/user', userStatsRoutes);
```

## Test en local

```bash
# Exemple avec curl
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://vhd-church-api.onrender.com/v1/user/123/stats
```

## Réponse attendue

```json
{
  "donations": 5,
  "appointments": 2,
  "prayers": 10,
  "testimonies": 3
}
```

## Sécurité

- ✅ Authentification requise (middleware `authenticate`)
- ✅ Un utilisateur ne peut voir que ses propres stats (sauf admin/pastor)
- ✅ Validation du paramètre `userId`

## Tables PostgreSQL utilisées

- `donations` (colonne `user_id`)
- `appointments` (colonne `user_id`)
- `prayers` (colonne `user_id`)
- `testimonies` (colonne `user_id`)

## Déploiement sur Render

1. Copier `backend-routes/user-stats.js` dans le dossier `routes/` du backend sur Render
2. Modifier `server.js` pour ajouter la route
3. Commit et push vers GitHub
4. Render redéploiera automatiquement

## Vérification post-déploiement

```bash
# Vérifier que la route répond
curl https://vhd-church-api.onrender.com/v1/user/YOUR_USER_ID/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend

Le frontend récupère automatiquement les stats via:
- Route proxy: `/api/user-stats-proxy?userId=123`
- Composant: `UserProfile.tsx` (useEffect au chargement)
- Affichage: Stats cards dynamiques (remplace les valeurs hardcodées 12, 3, 8, 5)
