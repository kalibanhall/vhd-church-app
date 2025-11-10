# =============================================================================
# Installation Android SDK Command-Line Tools - VHD Church App
# =============================================================================
# Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
# =============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Android SDK Tools" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sdkPath = "$env:USERPROFILE\AppData\Local\Android\Sdk"

if (-not (Test-Path $sdkPath)) {
    Write-Host "❌ SDK Android introuvable à: $sdkPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SDK Android trouvé: $sdkPath" -ForegroundColor Green
Write-Host ""

# Créer le dossier cmdline-tools
Write-Host "[1/5] Préparation du dossier..." -ForegroundColor Yellow
$cmdlineToolsPath = Join-Path $sdkPath "cmdline-tools"
if (-not (Test-Path $cmdlineToolsPath)) {
    New-Item -Path $cmdlineToolsPath -ItemType Directory -Force | Out-Null
}

# Télécharger cmdline-tools
Write-Host ""
Write-Host "[2/5] Téléchargement cmdline-tools..." -ForegroundColor Yellow
Write-Host "Ceci peut prendre quelques minutes..." -ForegroundColor Cyan

$url = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
$output = "$env:TEMP\cmdline-tools.zip"

try {
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
    Write-Host "✅ Téléchargement terminé" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur de téléchargement: $_" -ForegroundColor Red
    exit 1
}

# Extraire
Write-Host ""
Write-Host "[3/5] Extraction..." -ForegroundColor Yellow

try {
    Expand-Archive -Path $output -DestinationPath $cmdlineToolsPath -Force
    
    # Renommer cmdline-tools -> latest
    $extractedPath = Join-Path $cmdlineToolsPath "cmdline-tools"
    $latestPath = Join-Path $cmdlineToolsPath "latest"
    
    if (Test-Path $latestPath) {
        Remove-Item -Path $latestPath -Recurse -Force
    }
    
    Move-Item -Path $extractedPath -Destination $latestPath
    Write-Host "✅ Extraction terminée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur d'extraction: $_" -ForegroundColor Red
    exit 1
}

# Nettoyer
Remove-Item -Path $output -Force

# Configurer variables d'environnement
Write-Host ""
Write-Host "[4/5] Configuration PATH..." -ForegroundColor Yellow

$env:ANDROID_HOME = $sdkPath
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', $sdkPath, 'User')

$pathsToAdd = @(
    "$sdkPath\cmdline-tools\latest\bin",
    "$sdkPath\platform-tools",
    "$sdkPath\emulator"
)

$userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
foreach ($pathToAdd in $pathsToAdd) {
    if ($userPath -notlike "*$pathToAdd*") {
        $userPath += ";$pathToAdd"
    }
}

[System.Environment]::SetEnvironmentVariable('Path', $userPath, 'User')
$env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + $userPath

Write-Host "✅ Variables configurées" -ForegroundColor Green

# Accepter licences
Write-Host ""
Write-Host "[5/5] Acceptation des licences Android..." -ForegroundColor Yellow
Write-Host "Tapez 'y' puis Entrée pour chaque licence" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2

try {
    & flutter doctor --android-licenses
    Write-Host ""
    Write-Host "✅ Licences acceptées" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur: $_" -ForegroundColor Yellow
    Write-Host "Réessayez avec: flutter doctor --android-licenses" -ForegroundColor Cyan
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
Write-Host "  ✅ INSTALLATION TERMINÉE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Prochaine étape:" -ForegroundColor Yellow
Write-Host "  .\compile.ps1" -ForegroundColor White
Write-Host ""
