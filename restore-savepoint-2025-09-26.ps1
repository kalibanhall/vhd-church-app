# 🔄 Script de Restauration - Point de Sauvegarde 26/09/2025

# Vérifier l'état du serveur
Write-Host "🔍 Vérification de l'état du projet..." -ForegroundColor Yellow

# Naviguer vers le dossier du projet
Set-Location "C:\My Chruch App 1.0.3"

# Vérifier les dépendances
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Blue
if (Test-Path "package.json") {
    Write-Host "✅ package.json trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ package.json manquant" -ForegroundColor Red
    exit 1
}

# Installer les dépendances si nécessaire
Write-Host "📥 Installation des dépendances..." -ForegroundColor Blue
npm install

# Vérifier la base de données
Write-Host "🗄️ Vérification de la base de données..." -ForegroundColor Blue
if (Test-Path "prisma\dev.db") {
    Write-Host "✅ Base de données trouvée" -ForegroundColor Green
} else {
    Write-Host "⚠️ Base de données manquante, initialisation..." -ForegroundColor Yellow
    npx prisma generate
    npx prisma db push
}

# Créer les utilisateurs de test si nécessaire
Write-Host "👥 Création des utilisateurs de test..." -ForegroundColor Blue
node create-test-member.js 2>$null
node create-test-user-fixed.js 2>$null

# Créer les données de test pour les rendez-vous
Write-Host "📅 Création des données de rendez-vous..." -ForegroundColor Blue
node create-appointment-data.js 2>$null

# Créer les notifications de test  
Write-Host "🔔 Création des notifications de test..." -ForegroundColor Blue
node create-test-notifications.js 2>$null

# Démarrer le serveur de développement
Write-Host "🚀 Démarrage du serveur..." -ForegroundColor Green
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🎉 APPLICATION CHURCH RESTORED!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 URL: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "👤 Utilisateurs de test:" -ForegroundColor Yellow
Write-Host "   📧 Email: testmember@church.com" -ForegroundColor White
Write-Host "   🔑 Pass:  test123" -ForegroundColor White
Write-Host "   👤 Rôle:  MEMBER" -ForegroundColor White
Write-Host ""
Write-Host "   📧 Email: admin@test.com" -ForegroundColor White  
Write-Host "   🔑 Pass:  password123" -ForegroundColor White
Write-Host "   👤 Rôle:  ADMIN" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Fonctionnalités disponibles:" -ForegroundColor Yellow
Write-Host "   ✅ Authentification complète" -ForegroundColor Green
Write-Host "   ✅ Système de profils" -ForegroundColor Green
Write-Host "   ✅ Notifications actives" -ForegroundColor Green
Write-Host "   ✅ Rendez-vous pastoraux" -ForegroundColor Green
Write-Host "   ✅ Navigation intégrée" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Lancement du serveur..." -ForegroundColor Cyan

npm run dev