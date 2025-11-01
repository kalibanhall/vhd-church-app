# Script de vérification du projet Android MyChurchApp
# PowerShell - Version simplifiée

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  MyChurchApp Android - Verification" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$projectRoot = "c:\vhd app\android-app"
$totalChecks = 0
$passedChecks = 0

function Test-FileExists {
    param($path, $name)
    $script:totalChecks++
    if (Test-Path (Join-Path $projectRoot $path)) {
        Write-Host "[OK] $name" -ForegroundColor Green
        $script:passedChecks++
        return $true
    } else {
        Write-Host "[  ] $name - MANQUANT" -ForegroundColor Red
        return $false
    }
}

# Modèles
Write-Host "`n=== MODELES DE DONNEES ===" -ForegroundColor Yellow
Test-FileExists "app\src\main\java\com\mychurchapp\data\models\User.kt" "User.kt"
Test-FileExists "app\src\main\java\com\mychurchapp\data\models\Donation.kt" "Donation.kt"
Test-FileExists "app\src\main\java\com\mychurchapp\data\models\Event.kt" "Event.kt"
Test-FileExists "app\src\main\java\com\mychurchapp\data\models\Sermon.kt" "Sermon.kt"
Test-FileExists "app\src\main\java\com\mychurchapp\data\models\Appointment.kt" "Appointment.kt"
Test-FileExists "app\src\main\java\com\mychurchapp\data\models\Prayer.kt" "Prayer.kt"
Test-FileExists "app\src\main\java\com\mychurchapp\data\models\Testimony.kt" "Testimony.kt"
Test-FileExists "app\src\main\java\com\mychurchapp\data\models\Chat.kt" "Chat.kt"

# API Services
Write-Host "`n=== SERVICES API ===" -ForegroundColor Yellow
Test-FileExists "app\src\main\java\com\mychurchapp\data\api\AuthApiService.kt" "AuthApiService"
Test-FileExists "app\src\main\java\com\mychurchapp\data\api\MembersApiService.kt" "MembersApiService"
Test-FileExists "app\src\main\java\com\mychurchapp\data\api\DonationsApiService.kt" "DonationsApiService"
Test-FileExists "app\src\main\java\com\mychurchapp\data\api\EventsApiService.kt" "EventsApiService"

# Repositories
Write-Host "`n=== REPOSITORIES ===" -ForegroundColor Yellow
Test-FileExists "app\src\main\java\com\mychurchapp\data\repository\AuthRepositoryImpl.kt" "AuthRepositoryImpl"
Test-FileExists "app\src\main\java\com\mychurchapp\data\repository\RepositoriesImpl.kt" "RepositoriesImpl"
Test-FileExists "app\src\main\java\com\mychurchapp\data\repository\RepositoriesImpl2.kt" "RepositoriesImpl2"
Test-FileExists "app\src\main\java\com\mychurchapp\data\repository\RepositoriesImpl3.kt" "RepositoriesImpl3"

# ViewModels
Write-Host "`n=== VIEWMODELS ===" -ForegroundColor Yellow
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\auth\AuthViewModel.kt" "AuthViewModel"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\dashboard\DashboardViewModel.kt" "DashboardViewModel"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\members\MembersViewModel.kt" "MembersViewModel"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\donations\DonationsViewModel.kt" "DonationsViewModel"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\events\EventsViewModel.kt" "EventsViewModel"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\sermons\SermonsViewModel.kt" "SermonsViewModel"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\appointments\AppointmentsViewModel.kt" "AppointmentsViewModel"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\prayers\PrayersViewModel.kt" "PrayersViewModel"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\testimonies\TestimoniesViewModel.kt" "TestimoniesViewModel"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\chat\ChatViewModel.kt" "ChatViewModel"

# Écrans
Write-Host "`n=== ECRANS COMPOSE ===" -ForegroundColor Yellow
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\auth\LoginScreen.kt" "LoginScreen"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\dashboard\DashboardScreen.kt" "DashboardScreen"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\members\MembersScreen.kt" "MembersScreen"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\donations\DonationsScreen.kt" "DonationsScreen"

# Infrastructure
Write-Host "`n=== INFRASTRUCTURE ===" -ForegroundColor Yellow
Test-FileExists "app\src\main\java\com\mychurchapp\di\NetworkModule.kt" "NetworkModule (Hilt)"
Test-FileExists "app\src\main\java\com\mychurchapp\di\RepositoryModule.kt" "RepositoryModule (Hilt)"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\navigation\Navigation.kt" "Navigation"
Test-FileExists "app\src\main\java\com\mychurchapp\data\local\TokenManager.kt" "TokenManager"
Test-FileExists "app\src\main\java\com\mychurchapp\MyChurchApp.kt" "MyChurchApp"
Test-FileExists "app\src\main\java\com\mychurchapp\presentation\MainActivity.kt" "MainActivity"

# Gradle
Write-Host "`n=== CONFIGURATION ===" -ForegroundColor Yellow
Test-FileExists "build.gradle.kts" "Root build.gradle.kts"
Test-FileExists "app\build.gradle.kts" "App build.gradle.kts"
Test-FileExists "settings.gradle.kts" "settings.gradle.kts"
Test-FileExists "gradle.properties" "gradle.properties"

# Documentation
Write-Host "`n=== DOCUMENTATION ===" -ForegroundColor Yellow
Test-FileExists "README.md" "README.md"
Test-FileExists "DEVELOPMENT_STATUS.md" "DEVELOPMENT_STATUS.md"
Test-FileExists "BUILD.md" "BUILD.md"
Test-FileExists "PROJECT_SUMMARY.md" "PROJECT_SUMMARY.md"

# Résumé
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "  RESULTAT FINAL" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "`nTests reussis: $passedChecks / $totalChecks" -ForegroundColor $(if($passedChecks -eq $totalChecks){"Green"}else{"Yellow"})

$percentage = [math]::Round(($passedChecks / $totalChecks) * 100, 2)
Write-Host "Pourcentage: $percentage%" -ForegroundColor Cyan

# Statistiques
Write-Host "`n=== STATISTIQUES ===" -ForegroundColor Yellow
$kotlinFiles = Get-ChildItem -Path (Join-Path $projectRoot "app\src\main\java") -Filter "*.kt" -Recurse -ErrorAction SilentlyContinue
$kotlinCount = ($kotlinFiles | Measure-Object).Count
Write-Host "Fichiers Kotlin: $kotlinCount" -ForegroundColor White

$totalLines = 0
foreach ($file in $kotlinFiles) {
    $lines = (Get-Content $file.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
    $totalLines += $lines
}
Write-Host "Lignes de code: ~$totalLines" -ForegroundColor White

Write-Host "`n" -NoNewline
if ($passedChecks -eq $totalChecks) {
    Write-Host "✓ PROJET ANDROID COMPLET ET PRET!" -ForegroundColor Green
} else {
    Write-Host "! Certains fichiers manquent" -ForegroundColor Yellow
}

Write-Host "`n======================================`n" -ForegroundColor Cyan
