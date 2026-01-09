# =============================================================================
# Guide de déploiement des nouvelles fonctionnalités Backend
# =============================================================================
# 
# Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
# GitHub: https://github.com/KalibanHall
# 
# =============================================================================

## 1. Résumé des changements

### Nouvelles routes API backend créées :
1. `/v1/news` - Fil d'actualité
2. `/v1/alerts` - Alertes urgentes  
3. `/v1/prayer-cells` - Cellules de prière
4. `/v1/services` - Vous servir
5. `/v1/followup` - Être suivi
6. `/v1/questions` - Poser une question
7. `/v1/conflicts` - Résolution de conflits
8. `/v1/abuse-reports` - Signalement d'abus
9. `/v1/mutual-help` - S'entraider
10. `/v1/marketplace` - Acheter/Vendre
11. `/v1/library` - Bibliothèque
12. `/v1/audiobooks` - Livres audio
13. `/v1/music` - Musique gospel
14. `/v1/songbook` - Cantiques
15. `/v1/gallery` - Galerie photos
16. `/v1/transport` - Navette

## 2. Déploiement

### Étape 1: Créer les tables dans la base de données

Exécutez le script SQL suivant dans votre console Supabase ou PostgreSQL :

```bash
# Via psql
psql -h <host> -U <user> -d <database> -f api-backend/database/create_new_features_tables.sql

# Ou copiez le contenu du fichier dans la console SQL de Supabase
```

Le fichier se trouve à : `api-backend/database/create_new_features_tables.sql`

### Étape 2: Déployer le backend sur Render

```bash
cd api-backend
git add .
git commit -m "feat: Add 16 new API endpoints for church management features"
git push origin main
```

Render redéployera automatiquement si le déploiement continu est configuré.

### Étape 3: Vérifier le déploiement

Testez les nouveaux endpoints :

```bash
# Test News endpoint
curl https://vhd-church-api.onrender.com/v1/news

# Test Alerts endpoint  
curl https://vhd-church-api.onrender.com/v1/alerts

# Test Library endpoint
curl https://vhd-church-api.onrender.com/v1/library

# Test Transport endpoint
curl https://vhd-church-api.onrender.com/v1/transport/routes
```

## 3. Structure des fichiers ajoutés

```
api-backend/
├── src/
│   ├── routes/
│   │   ├── news.ts           # Fil d'actualité
│   │   ├── alerts.ts         # Alertes urgentes
│   │   ├── prayerCells.ts    # Cellules de prière
│   │   ├── services.ts       # Services église
│   │   ├── followup.ts       # Suivi pastoral
│   │   ├── questions.ts      # Questions/FAQ
│   │   ├── conflicts.ts      # Médiation conflits
│   │   ├── abuseReports.ts   # Signalements abus
│   │   ├── mutualHelp.ts     # Entraide communautaire
│   │   ├── marketplace.ts    # Petites annonces
│   │   ├── library.ts        # Bibliothèque
│   │   ├── audiobooks.ts     # Livres audio
│   │   ├── music.ts          # Musique gospel
│   │   ├── songbook.ts       # Cantiques
│   │   ├── gallery.ts        # Galerie photos
│   │   └── transport.ts      # Navette
│   └── server.ts             # Mise à jour avec imports
├── database/
│   └── create_new_features_tables.sql  # Script création tables
```

## 4. Notes importantes

### Mode Fallback
Toutes les routes incluent un mode fallback avec données mock si les tables n'existent pas encore. Cela permet au frontend de fonctionner immédiatement.

### Authentification
- La plupart des routes GET sont publiques
- Les routes POST/PUT/DELETE requièrent une authentification
- Certaines routes admin nécessitent le rôle ADMIN ou PASTOR

### Sécurité
- Le endpoint `/abuse-reports` est conçu pour la confidentialité
- Les signalements peuvent être anonymes
- Seuls les administrateurs peuvent voir les détails des signalements

## 5. Vérification post-déploiement

1. ✅ Backend compilé sans erreurs
2. ✅ Frontend compilé avec 128 pages
3. ⏳ Tables SQL à créer dans Supabase
4. ⏳ Déploiement backend sur Render
5. ⏳ Tests des endpoints en production

## 6. Contact

Pour toute question sur ces fonctionnalités :
- GitHub: https://github.com/KalibanHall
- Auteur: CHRIS NGOZULU KASONGO
