# =============================================================================
# Configuration Android SDK pour Flutter - VHD Church App
# =============================================================================
# Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configuration Android SDK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Recherche du SDK Android
Write-Host "[1/4] Recherche du SDK Android..." -ForegroundColor Yellow

$possiblePaths = @(
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk",
    "C:\Users\$env:USERNAME\Android\Sdk",
    "$env:ANDROID_HOME"
)

$sdkPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $sdkPath = $path
        Write-Host "✅ SDK trouvé: $path" -ForegroundColor Green
        break
    }
}

if (-not $sdkPath) {
    Write-Host "❌ SDK Android introuvable" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions:" -ForegroundColor Yellow
    Write-Host "1. Ouvrir Android Studio" -ForegroundColor White
    Write-Host "2. Aller dans Tools > SDK Manager" -ForegroundColor White
    Write-Host "3. Dans 'SDK Tools', cocher 'Android SDK Command-line Tools'" -ForegroundColor White
    Write-Host "4. Cliquer 'Apply' pour installer" -ForegroundColor White
    Write-Host "5. Réexécuter ce script" -ForegroundColor White
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Vérifier cmdline-tools
Write-Host ""
Write-Host "[2/4] Vérification cmdline-tools..." -ForegroundColor Yellow

$cmdlineTools = Join-Path $sdkPath "cmdline-tools\latest"
if (-not (Test-Path $cmdlineTools)) {
    Write-Host "⚠️  cmdline-tools non installé" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Installation via Android Studio:" -ForegroundColor Cyan
    Write-Host "1. Ouvrir Android Studio" -ForegroundColor White
    Write-Host "2. Tools > SDK Manager > SDK Tools" -ForegroundColor White
    Write-Host "3. Cocher 'Android SDK Command-line Tools (latest)'" -ForegroundColor White
    Write-Host "4. Apply > OK" -ForegroundColor White
    Write-Host ""
    $response = Read-Host "Appuyez sur Entrée après l'installation"
    
    # Revérifier
    if (-not (Test-Path $cmdlineTools)) {
        Write-Host "❌ cmdline-tools toujours introuvable" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ cmdline-tools trouvé" -ForegroundColor Green

# Configurer variables d'environnement
Write-Host ""
Write-Host "[3/4] Configuration variables d'environnement..." -ForegroundColor Yellow

# ANDROID_HOME
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $sdkPath, 'User')
$env:ANDROID_HOME = $sdkPath
Write-Host "✅ ANDROID_HOME: $sdkPath" -ForegroundColor Green

# Ajouter au PATH
$pathsToAdd = @(
    "$sdkPath\platform-tools",
    "$sdkPath\cmdline-tools\latest\bin",
    "$sdkPath\emulator"
)

$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
foreach ($pathToAdd in $pathsToAdd) {
    if ($currentPath -notlike "*$pathToAdd*") {
        $currentPath += ";$pathToAdd"
    }
}

[System.Environment]::SetEnvironmentVariable('Path', $currentPath, 'User')
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + $currentPath
Write-Host "✅ PATH mis à jour" -ForegroundColor Green

# Accepter les licences
Write-Host ""
Write-Host "[4/4] Acceptation des licences Android..." -ForegroundColor Yellow
Write-Host "Tapez 'y' puis Entrée pour chaque licence" -ForegroundColor Cyan
Write-Host ""

try {
    & flutter doctor --android-licenses
    Write-Host ""
    Write-Host "✅ Licences acceptées" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur lors de l'acceptation des licences" -ForegroundColor Yellow
}

# Vérification finale
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vérification finale" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

flutter doctor

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Configuration terminée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Vous pouvez maintenant compiler l'application:" -ForegroundColor Cyan
Write-Host "  .\compile.ps1" -ForegroundColor White
Write-Host ""
