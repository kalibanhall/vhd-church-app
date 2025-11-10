# =============================================================================
# Script de Compilation - VHD Church App Flutter
# =============================================================================
# Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
# Version: 1.0.0
# Date: Novembre 2025
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VHD Church App - Compilation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Flutter
Write-Host "[1/5] Vérification de Flutter..." -ForegroundColor Yellow
$flutterVersion = flutter --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur: Flutter n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Flutter depuis https://flutter.dev" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Flutter trouvé" -ForegroundColor Green
Write-Host ""

# Nettoyer le projet
Write-Host "[2/5] Nettoyage du projet..." -ForegroundColor Yellow
flutter clean
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Projet nettoyé" -ForegroundColor Green
} else {
    Write-Host "⚠️ Avertissement lors du nettoyage" -ForegroundColor Yellow
}
Write-Host ""

# Installer les dépendances
Write-Host "[3/5] Installation des dépendances..." -ForegroundColor Yellow
flutter pub get
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Vérifier la configuration
Write-Host "[4/5] Vérification de la configuration..." -ForegroundColor Yellow
flutter doctor
Write-Host ""

# Compiler l'APK
Write-Host "[5/5] Compilation de l'APK..." -ForegroundColor Yellow
Write-Host "Ceci peut prendre quelques minutes..." -ForegroundColor Cyan
flutter build apk --release

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ COMPILATION RÉUSSIE !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 L'APK a été généré dans:" -ForegroundColor Cyan
    Write-Host "   build\app\outputs\flutter-apk\app-release.apk" -ForegroundColor White
    Write-Host ""
    
    # Afficher la taille du fichier
    $apkPath = "build\app\outputs\flutter-apk\app-release.apk"
    if (Test-Path $apkPath) {
        $apkSize = (Get-Item $apkPath).Length / 1MB
        Write-Host "📊 Taille: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "🚀 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "   1. Transférer l'APK sur votre téléphone Android" -ForegroundColor White
    Write-Host "   2. Installer l'APK sur votre appareil" -ForegroundColor White
    Write-Host "   3. Lancer l'application" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ ERREUR DE COMPILATION" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Veuillez vérifier les erreurs ci-dessus" -ForegroundColor Yellow
    Write-Host "Consultez GUIDE_COMPILATION.md pour plus d'aide" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
