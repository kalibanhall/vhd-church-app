# =============================================================================
# Fix all plugins namespace issues automatically
# =============================================================================

$cacheDir = "$env:LOCALAPPDATA\Pub\Cache\hosted\pub.dev"

# Liste des plugins à corriger avec leurs namespaces
$pluginsToFix = @{
    "qr_code_scanner" = "net.touchcapture.qr.flutterqr"
    "image_gallery_saver" = "com.example.imagegallerysaver"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Correction des plugins Flutter" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($plugin in $pluginsToFix.Keys) {
    Write-Host "[*] Traitement de $plugin..." -ForegroundColor Yellow
    
    $pluginFolders = Get-ChildItem $cacheDir -Filter "$plugin-*" -Directory
    
    foreach ($folder in $pluginFolders) {
        $buildFile = Join-Path $folder.FullName "android\build.gradle"
        
        if (-not (Test-Path $buildFile)) {
            Write-Host "  ⚠️  Pas de build.gradle trouvé" -ForegroundColor Yellow
            continue
        }
        
        $content = Get-Content $buildFile -Raw
        
        # Vérifier si namespace existe déjà
        if ($content -match 'namespace\s+[''"]') {
            Write-Host "  ✅ Namespace déjà configuré dans $($folder.Name)" -ForegroundColor Green
            continue
        }
        
        # Ajouter le namespace après 'android {'
        $namespace = $pluginsToFix[$plugin]
        $lines = Get-Content $buildFile
        $newLines = @()
        $namespaceAdded = $false
        
        foreach ($line in $lines) {
            $newLines += $line
            if ($line -match '^\s*android\s*\{' -and -not $namespaceAdded) {
                $newLines += "    namespace '$namespace'"
                $namespaceAdded = $true
            }
        }
        
        if ($namespaceAdded) {
            $newLines | Set-Content $buildFile -Encoding UTF8
            Write-Host "  ✅ Namespace ajouté à $($folder.Name)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Impossible d'ajouter le namespace à $($folder.Name)" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Correction terminée !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
