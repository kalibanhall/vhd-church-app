# Script PowerShell simple pour créer un Excel depuis le CSV
# Ministère Vaillants Hommes de David

Write-Host "Creation du tableau Excel depuis le CSV..." -ForegroundColor Green

$csvFile = "SUIVI-DEVELOPPEMENT.csv"

if (!(Test-Path $csvFile)) {
    Write-Host "Fichier CSV non trouve: $csvFile" -ForegroundColor Red
    exit 1
}

try {
    Write-Host "Ouverture d'Excel..." -ForegroundColor Yellow
    
    # Créer une instance Excel
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false
    
    # Ouvrir le fichier CSV
    $csvPath = (Resolve-Path $csvFile).Path
    $workbook = $excel.Workbooks.Open($csvPath)
    $worksheet = $workbook.Worksheets.Item(1)
    
    Write-Host "Application du formatage..." -ForegroundColor Cyan
    
    # Formatage de l'en-tête
    $headerRange = $worksheet.Range("A1:L1")
    $headerRange.Font.Bold = $true
    $headerRange.Interior.Color = 255 # Rouge
    $headerRange.Font.Color = 16777215 # Blanc
    
    # Auto-ajuster les colonnes
    $usedRange = $worksheet.UsedRange
    $usedRange.Columns.AutoFit()
    
    # Appliquer des couleurs aux statuts (colonne C)
    $lastRow = $worksheet.UsedRange.Rows.Count
    
    for ($i = 2; $i -le $lastRow; $i++) {
        $statusCell = $worksheet.Cells.Item($i, 3) # Colonne C (Statut)
        $status = $statusCell.Value()
        
        if ($status -like "*TERMINÉ*") {
            $statusCell.Interior.Color = 5296274 # Vert clair
            $statusCell.Font.Color = 0 # Noir
        }
        elseif ($status -like "*À FAIRE*") {
            $statusCell.Interior.Color = 255 # Rouge clair
            $statusCell.Font.Color = 16777215 # Blanc
        }
        elseif ($status -like "*PARTIELLEMENT*") {
            $statusCell.Interior.Color = 65535 # Jaune
            $statusCell.Font.Color = 0 # Noir
        }
        
        # Formatage des priorités (colonne D)
        $priorityCell = $worksheet.Cells.Item($i, 4)
        $priority = $priorityCell.Value()
        
        if ($priority -like "*CRITIQUE*") {
            $priorityCell.Interior.Color = 255 # Rouge
            $priorityCell.Font.Color = 16777215 # Blanc
            $priorityCell.Font.Bold = $true
        }
        elseif ($priority -like "*HAUTE*") {
            $priorityCell.Interior.Color = 49407 # Orange
            $priorityCell.Font.Color = 16777215 # Blanc
        }
    }
    
    # Ajouter des bordures
    $usedRange.Borders.LineStyle = 1
    $usedRange.Borders.Weight = 2
    
    # Figer la première ligne
    $worksheet.Rows.Item(2).Select()
    $excel.ActiveWindow.FreezePanes = $true
    
    # Sauvegarder en tant que fichier Excel
    $excelPath = Join-Path (Get-Location) "TABLEAU-SUIVI-DEVELOPPEMENT.xlsx"
    $workbook.SaveAs($excelPath, 51) # Format Excel 2007+
    
    # Fermer le classeur
    $workbook.Close()
    $excel.Quit()
    
    # Libérer les objets COM
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($worksheet) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    
    Write-Host "Fichier Excel cree avec succes!" -ForegroundColor Green
    Write-Host "Emplacement: $excelPath" -ForegroundColor Cyan
    
    # Ouvrir le fichier
    Write-Host "Ouverture du fichier..." -ForegroundColor Magenta
    Start-Process $excelPath
    
    Write-Host "Tableau de suivi Excel termine!" -ForegroundColor Green
}
catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Le fichier CSV est disponible comme alternative." -ForegroundColor Yellow
}