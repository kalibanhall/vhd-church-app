# =============================================================================
# Fix image_gallery_saver plugin namespace issue
# =============================================================================

$pluginPath = Get-ChildItem "$env:LOCALAPPDATA\Pub\Cache\hosted\pub.dev" -Filter "image_gallery_saver*" | Select-Object -First 1 -ExpandProperty FullName

if (-not $pluginPath) {
    Write-Host "❌ Plugin image_gallery_saver introuvable" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Plugin trouvé: $pluginPath" -ForegroundColor Green

$buildGradlePath = Join-Path $pluginPath "android\build.gradle"

if (-not (Test-Path $buildGradlePath)) {
    Write-Host "❌ build.gradle introuvable" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier build.gradle trouvé" -ForegroundColor Green

# Lire le contenu
$content = Get-Content $buildGradlePath -Raw

# Vérifier si namespace existe déjà
if ($content -match 'namespace\s+[''"]') {
    Write-Host "✅ Namespace déjà configuré" -ForegroundColor Green
    exit 0
}

# Ajouter le namespace après 'android {'
$newContent = $content -replace '(android\s*\{)', "`$1`n    namespace 'com.example.imagegallerysaver'"

# Sauvegarder
Set-Content -Path $buildGradlePath -Value $newContent -Encoding UTF8

Write-Host "✅ Namespace ajouté au build.gradle" -ForegroundColor Green
Write-Host "📦 Vous pouvez maintenant relancer la compilation" -ForegroundColor Cyan
