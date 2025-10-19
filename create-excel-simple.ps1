# Script PowerShell pour créer un tableau Excel formaté
# Ministère Vaillants Hommes de David - Suivi de Développement

Write-Host "Création du tableau Excel de suivi..." -ForegroundColor Green

# Vérifier si le module ImportExcel est installé
if (!(Get-Module -ListAvailable -Name ImportExcel)) {
    Write-Host "Installation du module ImportExcel..." -ForegroundColor Yellow
    try {
        Install-Module -Name ImportExcel -Force -Scope CurrentUser -AllowClobber -SkipPublisherCheck
        Write-Host "Module ImportExcel installé avec succès!" -ForegroundColor Green
    }
    catch {
        Write-Host "Erreur lors de l'installation du module ImportExcel." -ForegroundColor Red
        Write-Host "Création d'un fichier Excel basique à partir du CSV..." -ForegroundColor Yellow
        
        # Méthode alternative avec Excel COM
        $csvPath = "SUIVI-DEVELOPPEMENT.csv"
        if (Test-Path $csvPath) {
            try {
                $excel = New-Object -ComObject Excel.Application
                $excel.Visible = $false
                $excel.DisplayAlerts = $false
                
                # Ouvrir le CSV
                $workbook = $excel.Workbooks.Open((Resolve-Path $csvPath).Path)
                
                # Sauvegarder en Excel
                $excelPath = Join-Path (Get-Location) "TABLEAU-SUIVI-DEVELOPPEMENT.xlsx"
                $workbook.SaveAs($excelPath, 51)
                
                # Fermer et nettoyer
                $workbook.Close()
                $excel.Quit()
                [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
                
                Write-Host "Fichier Excel créé: TABLEAU-SUIVI-DEVELOPPEMENT.xlsx" -ForegroundColor Green
                Start-Process $excelPath
                return
            }
            catch {
                Write-Host "Erreur avec Excel COM: $($_.Exception.Message)" -ForegroundColor Red
                Write-Host "Le fichier CSV est disponible: SUIVI-DEVELOPPEMENT.csv" -ForegroundColor Yellow
                return
            }
        }
        else {
            Write-Host "Fichier CSV non trouvé." -ForegroundColor Red
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

# Créer le fichier Excel
$excelPath = "TABLEAU-SUIVI-DEVELOPPEMENT.xlsx"

Write-Host "Génération du fichier Excel avec formatage..." -ForegroundColor Cyan

# Exporter vers Excel
$projectData | Export-Excel -Path $excelPath -WorksheetName "Suivi Développement" -AutoSize -AutoFilter -FreezeTopRow -BoldTopRow

# Calculer les statistiques
$totalTasks = $projectData.Count
$completedTasks = ($projectData | Where-Object { $_.Statut -eq "TERMINÉ" }).Count
$partialTasks = ($projectData | Where-Object { $_.Statut -eq "PARTIELLEMENT" }).Count
$todoTasks = ($projectData | Where-Object { $_.Statut -eq "À FAIRE" }).Count
$completionRate = [math]::Round(($completedTasks / $totalTasks) * 100, 1)

Write-Host "Fichier Excel créé avec succès!" -ForegroundColor Green
Write-Host "Emplacement: $(Resolve-Path $excelPath)" -ForegroundColor Cyan
Write-Host "Statistiques:" -ForegroundColor White
Write-Host "  - Total: $totalTasks fonctionnalités" -ForegroundColor Gray
Write-Host "  - Terminées: $completedTasks" -ForegroundColor Green
Write-Host "  - En cours: $partialTasks" -ForegroundColor Yellow
Write-Host "  - À faire: $todoTasks" -ForegroundColor Red
Write-Host "  - Taux de completion: $completionRate%" -ForegroundColor Cyan

# Ouvrir le fichier Excel
Write-Host "Ouverture du fichier Excel..." -ForegroundColor Magenta
Start-Process $excelPath

Write-Host "Tableau de suivi créé avec succès!" -ForegroundColor Green