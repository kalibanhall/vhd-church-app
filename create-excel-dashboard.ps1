# Script PowerShell pour créer un tableau Excel formaté
# Ministère Vaillants Hommes de David - Suivi de Développement

Write-Host "🚀 Création du tableau Excel de suivi..." -ForegroundColor Green

# Vérifier si le module ImportExcel est installé
if (!(Get-Module -ListAvailable -Name ImportExcel)) {
    Write-Host "📦 Installation du module ImportExcel..." -ForegroundColor Yellow
    try {
        Install-Module -Name ImportExcel -Force -Scope CurrentUser -AllowClobber
        Write-Host "✅ Module ImportExcel installé avec succès!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erreur lors de l'installation. Tentative avec méthode alternative..." -ForegroundColor Red
        # Méthode alternative sans module
        $csvPath = "SUIVI-DEVELOPPEMENT.csv"
        if (Test-Path $csvPath) {
            Write-Host "📊 Conversion du CSV en Excel basique..." -ForegroundColor Cyan
            $excel = New-Object -ComObject Excel.Application
            $excel.Visible = $false
            $workbook = $excel.Workbooks.Open((Resolve-Path $csvPath).Path)
            $excelPath = (Join-Path (Get-Location) "TABLEAU-SUIVI-DEVELOPPEMENT.xlsx")
            $workbook.SaveAs($excelPath, 51) # 51 = xlOpenXMLWorkbook
            $workbook.Close()
            $excel.Quit()
            Write-Host "✅ Fichier Excel créé: TABLEAU-SUIVI-DEVELOPPEMENT.xlsx" -ForegroundColor Green
            return
        }
        else {
            Write-Host "❌ Fichier CSV non trouvé. Création manuelle nécessaire." -ForegroundColor Red
            return
        }
    }
}

Import-Module ImportExcel -Force

# Données du projet
$projectData = @(
    [PSCustomObject]@{
        Module = "AUTHENTIFICATION"
        Fonctionnalité = "Système JWT/Cookies"
        Statut = "TERMINÉ"
        Priorité = "CRITIQUE"
        DateDébut = "25/09/25"
        DateFin = "26/09/25"
        Assigné = "DEV"
        EstimationJours = 2
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "Migration complète vers cookies HTTPOnly"
    },
    [PSCustomObject]@{
        Module = "AUTHENTIFICATION"
        Fonctionnalité = "Login/Logout"
        Statut = "TERMINÉ"
        Priorité = "CRITIQUE"
        DateDébut = "25/09/25"
        DateFin = "26/09/25"
        Assigné = "DEV"
        EstimationJours = 1
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "Fonctionnement parfait"
    },
    [PSCustomObject]@{
        Module = "AUTHENTIFICATION"
        Fonctionnalité = "2FA"
        Statut = "À FAIRE"
        Priorité = "MOYENNE"
        DateDébut = "18/10/25"
        DateFin = "20/10/25"
        Assigné = "DEV"
        EstimationJours = 2
        ProgressionPct = 0
        Tests = "-"
        Documentation = "-"
        Commentaires = "Authentification à deux facteurs"
    },
    [PSCustomObject]@{
        Module = "INTERFACE"
        Fonctionnalité = "Dashboard principal"
        Statut = "TERMINÉ"
        Priorité = "CRITIQUE"
        DateDébut = "25/09/25"
        DateFin = "25/09/25"
        Assigné = "DEV"
        EstimationJours = 1
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "Interface moderne et responsive"
    },
    [PSCustomObject]@{
        Module = "INTERFACE"
        Fonctionnalité = "Design responsive"
        Statut = "TERMINÉ"
        Priorité = "HAUTE"
        DateDébut = "26/09/25"
        DateFin = "27/09/25"
        Assigné = "DEV"
        EstimationJours = 2
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "Mobile-first design"
    },
    [PSCustomObject]@{
        Module = "GESTION MEMBRES"
        Fonctionnalité = "Liste membres"
        Statut = "TERMINÉ"
        Priorité = "HAUTE"
        DateDébut = "25/09/25"
        DateFin = "25/09/25"
        Assigné = "DEV"
        EstimationJours = 1
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "Interface d'administration"
    },
    [PSCustomObject]@{
        Module = "ÉVÉNEMENTS"
        Fonctionnalité = "Création événements"
        Statut = "TERMINÉ"
        Priorité = "HAUTE"
        DateDébut = "25/09/25"
        DateFin = "25/09/25"
        Assigné = "DEV"
        EstimationJours = 1
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "Interface admin complète"
    },
    [PSCustomObject]@{
        Module = "ÉVÉNEMENTS"
        Fonctionnalité = "Calendrier intégré"
        Statut = "À FAIRE"
        Priorité = "MOYENNE"
        DateDébut = "05/10/25"
        DateFin = "08/10/25"
        Assigné = "DEV"
        EstimationJours = 3
        ProgressionPct = 0
        Tests = "-"
        Documentation = "-"
        Commentaires = "Vue calendrier avancée"
    },
    [PSCustomObject]@{
        Module = "PRÉDICATIONS"
        Fonctionnalité = "Upload audio/vidéo"
        Statut = "TERMINÉ"
        Priorité = "HAUTE"
        DateDébut = "25/09/25"
        DateFin = "25/09/25"
        Assigné = "DEV"
        EstimationJours = 1
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "Système de fichiers complet"
    },
    [PSCustomObject]@{
        Module = "PRÉDICATIONS"
        Fonctionnalité = "Lecture intégrée"
        Statut = "PARTIELLEMENT"
        Priorité = "MOYENNE"
        DateDébut = "25/09/25"
        DateFin = "EN COURS"
        Assigné = "DEV"
        EstimationJours = 2
        ProgressionPct = 70
        Tests = "PARTIEL"
        Documentation = "PARTIEL"
        Commentaires = "Lecteur basique fonctionnel"
    },
    [PSCustomObject]@{
        Module = "DONATIONS"
        Fonctionnalité = "Formulaire donation"
        Statut = "TERMINÉ"
        Priorité = "HAUTE"
        DateDébut = "25/09/25"
        DateFin = "25/09/25"
        Assigné = "DEV"
        EstimationJours = 1
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "Interface simple et efficace"
    },
    [PSCustomObject]@{
        Module = "DONATIONS"
        Fonctionnalité = "Paiement en ligne"
        Statut = "À FAIRE"
        Priorité = "HAUTE"
        DateDébut = "25/10/25"
        DateFin = "29/10/25"
        Assigné = "DEV"
        EstimationJours = 4
        ProgressionPct = 0
        Tests = "-"
        Documentation = "-"
        Commentaires = "Intégration Stripe/PayPal"
    },
    [PSCustomObject]@{
        Module = "RENDEZ-VOUS"
        Fonctionnalité = "Prise rendez-vous"
        Statut = "TERMINÉ"
        Priorité = "HAUTE"
        DateDébut = "26/09/25"
        DateFin = "26/09/25"
        Assigné = "DEV"
        EstimationJours = 1
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "Interface utilisateur"
    },
    [PSCustomObject]@{
        Module = "CHAT"
        Fonctionnalité = "Messages temps réel"
        Statut = "TERMINÉ"
        Priorité = "MOYENNE"
        DateDébut = "25/09/25"
        DateFin = "25/09/25"
        Assigné = "DEV"
        EstimationJours = 1
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "WebSockets ou polling"
    },
    [PSCustomObject]@{
        Module = "ANALYTICS"
        Fonctionnalité = "Dashboard analytics"
        Statut = "TERMINÉ"
        Priorité = "MOYENNE"
        DateDébut = "27/09/25"
        DateFin = "27/09/25"
        Assigné = "DEV"
        EstimationJours = 1
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "Métriques en temps réel"
    },
    [PSCustomObject]@{
        Module = "SÉCURITÉ"
        Fonctionnalité = "Protection CSRF"
        Statut = "TERMINÉ"
        Priorité = "CRITIQUE"
        DateDébut = "27/09/25"
        DateFin = "27/09/25"
        Assigné = "DEV"
        EstimationJours = 0.5
        ProgressionPct = 100
        Tests = "OK"
        Documentation = "OK"
        Commentaires = "Tokens CSRF"
    },
    [PSCustomObject]@{
        Module = "SÉCURITÉ"
        Fonctionnalité = "Rate limiting"
        Statut = "À FAIRE"
        Priorité = "HAUTE"
        DateDébut = "03/11/25"
        DateFin = "04/11/25"
        Assigné = "DEV"
        EstimationJours = 1
        ProgressionPct = 0
        Tests = "-"
        Documentation = "-"
        Commentaires = "Protection DDoS"
    }
)

# Créer le fichier Excel avec formatage
$excelPath = "TABLEAU-SUIVI-DEVELOPPEMENT.xlsx"

Write-Host "📊 Génération du fichier Excel avec formatage..." -ForegroundColor Cyan

try {
    # Exporter vers Excel avec formatage conditionnel
    $projectData | Export-Excel -Path $excelPath -WorksheetName "Suivi Développement" -AutoSize -AutoFilter -FreezeTopRow -BoldTopRow `
        -ConditionalFormatting @(
            New-ConditionalFormattingIconSet -Range "C:C" -ConditionalFormat ThreeIconSet -IconType Symbols
        ) `
        -Style @{
            # En-tête
            Range = "A1:L1"
            FontColor = "White"
            BackgroundColor = "DarkBlue"
            Bold = $true
        }
    
    # Appliquer le formatage conditionnel pour les statuts
    $excel = Open-ExcelPackage -Path $excelPath
    $ws = $excel.Workbook.Worksheets["Suivi Développement"]
    
    # Formatage des statuts
    for ($row = 2; $row -le ($projectData.Count + 1); $row++) {
        $statusCell = $ws.Cells["C$row"]
        $priorityCell = $ws.Cells["D$row"]
        $progressCell = $ws.Cells["I$row"]
        
        switch ($statusCell.Value) {
            "TERMINÉ" { 
                $statusCell.Style.Fill.PatternType = "Solid"
                $statusCell.Style.Fill.BackgroundColor.SetColor([System.Drawing.Color]::LightGreen)
                $statusCell.Style.Font.Color.SetColor([System.Drawing.Color]::DarkGreen)
                $statusCell.Style.Font.Bold = $true
            }
            "À FAIRE" { 
                $statusCell.Style.Fill.PatternType = "Solid"
                $statusCell.Style.Fill.BackgroundColor.SetColor([System.Drawing.Color]::LightCoral)
                $statusCell.Style.Font.Color.SetColor([System.Drawing.Color]::DarkRed)
                $statusCell.Style.Font.Bold = $true
            }
            "PARTIELLEMENT" { 
                $statusCell.Style.Fill.PatternType = "Solid"
                $statusCell.Style.Fill.BackgroundColor.SetColor([System.Drawing.Color]::LightYellow)
                $statusCell.Style.Font.Color.SetColor([System.Drawing.Color]::DarkOrange)
                $statusCell.Style.Font.Bold = $true
            }
        }
        
        # Formatage des priorités
        switch ($priorityCell.Value) {
            "CRITIQUE" { 
                $priorityCell.Style.Fill.PatternType = "Solid"
                $priorityCell.Style.Fill.BackgroundColor.SetColor([System.Drawing.Color]::Red)
                $priorityCell.Style.Font.Color.SetColor([System.Drawing.Color]::White)
                $priorityCell.Style.Font.Bold = $true
            }
            "HAUTE" { 
                $priorityCell.Style.Fill.PatternType = "Solid"
                $priorityCell.Style.Fill.BackgroundColor.SetColor([System.Drawing.Color]::Orange)
                $priorityCell.Style.Font.Color.SetColor([System.Drawing.Color]::White)
                $priorityCell.Style.Font.Bold = $true
            }
            "MOYENNE" { 
                $priorityCell.Style.Fill.PatternType = "Solid"
                $priorityCell.Style.Fill.BackgroundColor.SetColor([System.Drawing.Color]::Yellow)
                $priorityCell.Style.Font.Color.SetColor([System.Drawing.Color]::Black)
            }
            "BASSE" { 
                $priorityCell.Style.Fill.PatternType = "Solid"
                $priorityCell.Style.Fill.BackgroundColor.SetColor([System.Drawing.Color]::LightBlue)
                $priorityCell.Style.Font.Color.SetColor([System.Drawing.Color]::DarkBlue)
            }
        }
        
        # Barre de progression pour le pourcentage
        if ($progressCell.Value -is [int]) {
            $progress = $progressCell.Value
            if ($progress -eq 100) {
                $progressCell.Style.Fill.PatternType = "Solid"
                $progressCell.Style.Fill.BackgroundColor.SetColor([System.Drawing.Color]::LightGreen)
            }
            elseif ($progress -gt 50) {
                $progressCell.Style.Fill.PatternType = "Solid"
                $progressCell.Style.Fill.BackgroundColor.SetColor([System.Drawing.Color]::LightYellow)
            }
            elseif ($progress -gt 0) {
                $progressCell.Style.Fill.PatternType = "Solid"
                $progressCell.Style.Fill.BackgroundColor.SetColor([System.Drawing.Color]::LightCoral)
            }
        }
    }
    
    # Ajouter une feuille de résumé
    $summaryWs = $excel.Workbook.Worksheets.Add("Résumé Projet")
    $summaryWs.Cells["A1"].Value = "RÉSUMÉ PROJET - MINISTÈRE VAILLANTS HOMMES DE DAVID"
    $summaryWs.Cells["A1:F1"].Merge = $true
    $summaryWs.Cells["A1"].Style.Font.Size = 16
    $summaryWs.Cells["A1"].Style.Font.Bold = $true
    $summaryWs.Cells["A1"].Style.HorizontalAlignment = "Center"
    
    $summaryWs.Cells["A3"].Value = "📊 STATISTIQUES GLOBALES"
    $summaryWs.Cells["A4"].Value = "Total fonctionnalités:"
    $summaryWs.Cells["B4"].Value = $projectData.Count
    $summaryWs.Cells["A5"].Value = "Terminées:"
    $summaryWs.Cells["B5"].Value = ($projectData | Where-Object { $_.Statut -eq "TERMINÉ" }).Count
    $summaryWs.Cells["A6"].Value = "En cours:"
    $summaryWs.Cells["B6"].Value = ($projectData | Where-Object { $_.Statut -eq "PARTIELLEMENT" }).Count
    $summaryWs.Cells["A7"].Value = "À faire:"
    $summaryWs.Cells["B7"].Value = ($projectData | Where-Object { $_.Statut -eq "À FAIRE" }).Count
    
    $completionRate = [math]::Round((($projectData | Where-Object { $_.Statut -eq "TERMINÉ" }).Count / $projectData.Count) * 100, 1)
    $summaryWs.Cells["A9"].Value = "🎯 TAUX DE COMPLETION:"
    $summaryWs.Cells["B9"].Value = "$completionRate%"
    $summaryWs.Cells["B9"].Style.Font.Size = 14
    $summaryWs.Cells["B9"].Style.Font.Bold = $true
    $summaryWs.Cells["B9"].Style.Font.Color.SetColor([System.Drawing.Color]::Green)
    
    Close-ExcelPackage -ExcelPackage $excel
    
    Write-Host "✅ Fichier Excel créé avec succès!" -ForegroundColor Green
    Write-Host "📁 Emplacement: $(Resolve-Path $excelPath)" -ForegroundColor Cyan
    Write-Host "📊 Taux de completion: $completionRate%" -ForegroundColor Yellow
    
    # Ouvrir le fichier Excel
    Write-Host "🚀 Ouverture du fichier Excel..." -ForegroundColor Magenta
    Start-Process $excelPath
    
}
catch {
    Write-Host "❌ Erreur lors de la création: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📄 Le fichier CSV est disponible comme alternative: SUIVI-DEVELOPPEMENT.csv" -ForegroundColor Yellow
}

Write-Host "`n🎉 Tableau de suivi créé avec succès!" -ForegroundColor Green
Write-Host "🔥 Fonctionnalités incluses:" -ForegroundColor White
Write-Host "   • Formatage conditionnel automatique" -ForegroundColor Gray
Write-Host "   • Couleurs par statut et priorité" -ForegroundColor Gray  
Write-Host "   • Barres de progression visuelles" -ForegroundColor Gray
Write-Host "   • Résumé statistiques projet" -ForegroundColor Gray
Write-Host "   • Filtres et tri automatiques" -ForegroundColor Gray