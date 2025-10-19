# Script de Restauration Rapide
# Point de sauvegarde du 25 septembre 2025

# Pour restaurer cet état de l'application :

# 1. Arrêter le serveur et nettoyer le cache
taskkill /f /im node.exe 2>$null
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue

# 2. Vérifier les fichiers critiques (copier depuis .backup si nécessaire)
# copy ".backup\2025-09-25\page.tsx" "src\app\page.tsx"  
# copy ".backup\2025-09-25\Dashboard.tsx" "src\components\Dashboard.tsx"

# 3. Redémarrer le serveur de développement
npm run dev

# 4. Vérifier que l'application fonctionne sur http://localhost:3000

# État attendu après restauration :
# - Dashboard complexe avec sidebar
# - Toutes les fonctionnalités utilisateur et admin
# - Authentification JWT fonctionnelle
# - API Events et Preachings opérationnelles
# - Interface en français complète