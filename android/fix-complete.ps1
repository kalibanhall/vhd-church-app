# Script de correction COMPLETE de tous les problèmes
Write-Host "Correction COMPLETE de tous les problèmes..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "app\src\main\java\com\mychurchapp\presentation" -Filter "*.kt" -Recurse

$totalFixed = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # NOMS DE CHAMPS
    $content = $content -replace '\.date\b', '.appointmentDate'
    $content = $content -replace '\bdate\s*:', 'appointmentDate:'
    $content = $content -replace '\bdate\s*=\s*', 'appointmentDate = '
    $content = $content -replace 'it\.date', 'it.appointmentDate'
    $content = $content -replace 'appointment\.date', 'appointment.appointmentDate'
    
    $content = $content -replace '\.titre\b', '.title'
    $content = $content -replace '\btitre\s*:', 'title:'
    $content = $content -replace '\btitre\s*=\s*', 'title = '
    $content = $content -replace '\.demande\b', '.content'
    $content = $content -replace '\bdemande\s*:', 'content:'
    $content = $content -replace '\bauteur\b', 'userId'
    $content = $content -replace '\.soutiens\b', '.supportCount'
    
    $content = $content -replace '\.contenu\b', '.content'
    $content = $content -replace '\bcontenu\s*:', 'content:'
    $content = $content -replace '\bcontenu\s*=\s*', 'content = '
    
    $content = $content -replace '\.predicateur\b', '.preacherId'
    $content = $content -replace '\bpredicateur\s*:', 'preacherId:'
    $content = $content -replace '\.duree\b', '.duration'
    $content = $content -replace '\.vues\b', '.viewCount'
    $content = $content -replace '\.telechargements\b', '.downloadCount'
    
    $content = $content -replace '\.lieu\b', '.location'
    
    # COMPARAISONS D'ENUMS
    $content = $content -replace 'status == "EN_ATTENTE"', 'status == AppointmentStatus.PENDING'
    $content = $content -replace 'status == "CONFIRME"', 'status == AppointmentStatus.CONFIRMED'
    $content = $content -replace 'status == "ANNULE"', 'status == AppointmentStatus.CANCELLED'
    $content = $content -replace 'status == "TERMINE"', 'status == AppointmentStatus.COMPLETED'
    
    $content = $content -replace 'status == "EN_COURS"', 'status == PrayerStatus.ACTIVE'
    $content = $content -replace 'status == "EXAUCEE"', 'status == PrayerStatus.ANSWERED'
    $content = $content -replace 'status == "FERMEE"', 'status == PrayerStatus.CLOSED'
    
    $content = $content -replace 'status == "PENDING"', 'status == TestimonyStatus.PENDING'
    $content = $content -replace 'status == "APPROVED"', 'status == TestimonyStatus.APPROVED'
    $content = $content -replace 'status == "REJECTED"', 'status == TestimonyStatus.REJECTED'
    
    # IMPORTS MANQUANTS
    if ($content -match 'AppointmentStatus' -and $content -notmatch 'import.*AppointmentStatus') {
        $content = $content -replace '(package com\.mychurchapp\.presentation[^\n]*\n)', "`$1`nimport com.mychurchapp.data.models.AppointmentStatus"
    }
    if ($content -match 'PrayerStatus' -and $content -notmatch 'import.*PrayerStatus') {
        $content = $content -replace '(package com\.mychurchapp\.presentation[^\n]*\n)', "`$1`nimport com.mychurchapp.data.models.PrayerStatus"
    }
    if ($content -match 'TestimonyStatus' -and $content -notmatch 'import.*TestimonyStatus') {
        $content = $content -replace '(package com\.mychurchapp\.presentation[^\n]*\n)', "`$1`nimport com.mychurchapp.data.models.TestimonyStatus"
    }
    if ($content -match 'CreatePrayerRequest' -and $content -notmatch 'import.*CreatePrayerRequest') {
        $content = $content -replace '(package com\.mychurchapp\.presentation[^\n]*\n)', "`$1`nimport com.mychurchapp.data.models.CreatePrayerRequest"
    }
    if ($content -match 'CreateTestimonyRequest' -and $content -notmatch 'import.*CreateTestimonyRequest') {
        $content = $content -replace '(package com\.mychurchapp\.presentation[^\n]*\n)', "`$1`nimport com.mychurchapp.data.models.CreateTestimonyRequest"
    }
    
    if ($content -ne $original) {
        $content | Set-Content $file.FullName -NoNewline
        Write-Host "  OK: $($file.Name)" -ForegroundColor Green
        $totalFixed++
    }
}

Write-Host "`nFichiers corriges: $totalFixed" -ForegroundColor Green
