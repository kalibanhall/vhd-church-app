# =============================================================================
# Script de Développement - VHD Church App Flutter
# =============================================================================
# Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
# Version: 1.0.0
# Date: Novembre 2025
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VHD Church App - Mode Développement" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Flutter
Write-Host "[1/3] Vérification de Flutter..." -ForegroundColor Yellow
flutter --version | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur: Flutter n'est pas installé" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Flutter trouvé" -ForegroundColor Green
Write-Host ""

# Installer les dépendances
Write-Host "[2/3] Installation des dépendances..." -ForegroundColor Yellow
flutter pub get
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'installation" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Lister les appareils
Write-Host "[3/3] Recherche d'appareils..." -ForegroundColor Yellow
flutter devices
Write-Host ""

# Lancer l'application
Write-Host "========================================" -ForegroundColor Green
Write-Host "  🚀 Lancement de l'application" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur 'r' pour recharger" -ForegroundColor Cyan
Write-Host "Appuyez sur 'R' pour recharger complètement" -ForegroundColor Cyan
Write-Host "Appuyez sur 'q' pour quitter" -ForegroundColor Cyan
Write-Host ""

flutter run
