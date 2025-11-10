# =============================================================================
# Installation Automatique de Flutter - VHD Church App
# =============================================================================
# Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
# Version: 1.0.0
# Date: Novembre 2025
# =============================================================================
# IMPORTANT: Exécuter ce script en tant qu'ADMINISTRATEUR
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation de Flutter SDK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si exécuté en tant qu'administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERREUR: Ce script doit être exécuté en tant qu'Administrateur" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour exécuter en tant qu'Administrateur:" -ForegroundColor Yellow
    Write-Host "1. Clic droit sur PowerShell" -ForegroundColor White
    Write-Host "2. Sélectionner 'Exécuter en tant qu'administrateur'" -ForegroundColor White
    Write-Host "3. Naviguer vers ce dossier et réexécuter le script" -ForegroundColor White
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host "✅ Exécution en tant qu'Administrateur confirmée" -ForegroundColor Green
Write-Host ""

# Vérifier si Flutter est déjà installé
Write-Host "[1/6] Vérification de l'installation existante..." -ForegroundColor Yellow
$flutterExists = Get-Command flutter -ErrorAction SilentlyContinue

if ($flutterExists) {
    Write-Host "⚠️  Flutter est déjà installé!" -ForegroundColor Yellow
    flutter --version
    Write-Host ""
    $response = Read-Host "Voulez-vous réinstaller Flutter? (o/N)"
    if ($response -ne 'o' -and $response -ne 'O') {
        Write-Host "Installation annulée." -ForegroundColor Yellow
        exit 0
    }
}

# Créer le dossier d'installation
Write-Host ""
Write-Host "[2/6] Création du dossier d'installation..." -ForegroundColor Yellow
$flutterPath = "C:\flutter"

if (Test-Path $flutterPath) {
    Write-Host "⚠️  Le dossier C:\flutter existe déjà" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous le supprimer et continuer? (o/N)"
    if ($response -eq 'o' -or $response -eq 'O') {
        Remove-Item -Path $flutterPath -Recurse -Force
        Write-Host "✅ Dossier supprimé" -ForegroundColor Green
    } else {
        Write-Host "Installation annulée." -ForegroundColor Yellow
        exit 0
    }
}

New-Item -Path $flutterPath -ItemType Directory -Force | Out-Null
Write-Host "✅ Dossier créé: $flutterPath" -ForegroundColor Green

# Télécharger Flutter
Write-Host ""
Write-Host "[3/6] Téléchargement de Flutter SDK..." -ForegroundColor Yellow
Write-Host "Ceci peut prendre 10-15 minutes selon votre connexion..." -ForegroundColor Cyan

$url = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.16.0-stable.zip"
$output = "$env:TEMP\flutter.zip"

try {
    # Télécharger avec barre de progression
    $ProgressPreference = 'Continue'
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
    Write-Host "✅ Téléchargement terminé" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du téléchargement: $_" -ForegroundColor Red
    exit 1
}

# Extraire Flutter
Write-Host ""
Write-Host "[4/6] Extraction de Flutter..." -ForegroundColor Yellow
Write-Host "Ceci peut prendre quelques minutes..." -ForegroundColor Cyan

try {
    Expand-Archive -Path $output -DestinationPath "C:\" -Force
    Write-Host "✅ Extraction terminée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'extraction: $_" -ForegroundColor Red
    exit 1
}

# Nettoyer le fichier ZIP
Remove-Item -Path $output -Force

# Ajouter au PATH
Write-Host ""
Write-Host "[5/6] Ajout de Flutter au PATH système..." -ForegroundColor Yellow

$path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
$flutterBin = "C:\flutter\bin"

if ($path -notlike "*$flutterBin*") {
    [System.Environment]::SetEnvironmentVariable(
        'Path',
        $path + ";$flutterBin",
        'Machine'
    )
    Write-Host "✅ Flutter ajouté au PATH" -ForegroundColor Green
} else {
    Write-Host "✅ Flutter déjà dans le PATH" -ForegroundColor Green
}

# Actualiser le PATH pour la session actuelle
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')

# Vérifier l'installation
Write-Host ""
Write-Host "[6/6] Vérification de l'installation..." -ForegroundColor Yellow

try {
    & "C:\flutter\bin\flutter.bat" --version
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ INSTALLATION RÉUSSIE !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Flutter a été installé avec succès dans: C:\flutter" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎯 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. REDÉMARRER PowerShell (IMPORTANT!)" -ForegroundColor White
    Write-Host "2. Exécuter: flutter doctor" -ForegroundColor White
    Write-Host "3. Accepter les licences: flutter doctor --android-licenses" -ForegroundColor White
    Write-Host "4. Compiler l'app: cd 'c:\vhd app\flutter-app' ; .\compile.ps1" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Erreur lors de la vérification: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Flutter a été installé mais nécessite un redémarrage de PowerShell" -ForegroundColor Yellow
    Write-Host "Veuillez redémarrer PowerShell et exécuter: flutter --version" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur Entrée pour quitter..." -ForegroundColor Gray
Read-Host
