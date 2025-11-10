# Script de correction automatique de toutes les erreurs Kotlin restantes

$files = @{
    "DonationsScreen" = "app\src\main\java\com\mychurchapp\presentation\donations\DonationsScreen.kt"
    "EventsScreen" = "app\src\main\java\com\mychurchapp\presentation\events\EventsScreen.kt"
    "EventDetailsScreen" = "app\src\main\java\com\mychurchapp\presentation\detail\EventDetailsScreen.kt"
    "SermonDetailsScreen" = "app\src\main\java\com\mychurchapp\presentation\detail\SermonDetailsScreen.kt"
    "MemberDetailsScreen" = "app\src\main\java\com\mychurchapp\presentation\detail\MemberDetailsScreen.kt"
    "MembersScreen" = "app\src\main\java\com\mychurchapp\presentation\members\MembersScreen.kt"
    "NotificationsScreen" = "app\src\main\java\com\mychurchapp\presentation\notifications\NotificationsScreen.kt"
    "PrayersScreen" = "app\src\main\java\com\mychurchapp\presentation\prayers\PrayersScreen.kt"
    "PrayersViewModel" = "app\src\main\java\com\mychurchapp\presentation\prayers\PrayersViewModel.kt"
    "ProfileScreen" = "app\src\main\java\com\mychurchapp\presentation\profile\ProfileScreen.kt"
    "SermonsScreen" = "app\src\main\java\com\mychurchapp\presentation\sermons\SermonsScreen.kt"
    "TestimoniesScreen" = "app\src\main\java\com\mychurchapp\presentation\testimonies\TestimoniesScreen.kt"
    "TestimoniesViewModel" = "app\src\main\java\com\mychurchapp\presentation\testimonies\TestimoniesViewModel.kt"
}

# Corrections pour DonationsScreen.kt
Write-Host "Correction de DonationsScreen.kt..."
$file = $files["DonationsScreen"]
(Get-Content $file -Raw) `
    -replace 'onConfirm = \{ amount, type, projectId ->', 'onConfirm = { amount, donationType, projectId ->' `
    -replace 'viewModel.createDonation\(amount, type, projectId\)', 'viewModel.createDonation(amount, donationType, projectId)' `
    -replace 'text = formatDate\(donation\.createdAt\)', 'text = formatDate(donation.donationDate ?: "")' `
    | Set-Content $file

# Corrections pour MemberDetailsScreen.kt
Write-Host "Correction de MemberDetailsScreen.kt..."
$file = $files["MemberDetailsScreen"]
(Get-Content $file -Raw) `
    -replace 'when \(member\.role\) \{(\s+)UserRole\.', 'when (member.role) {$1    UserRole.' `
    -replace 'UserRole\.(MEMBER|PASTOR|ADMIN) -> "', '    UserRole.$1 -> "' `
    -replace '(\s+)else -> "Unknown"', '$1    else -> "Unknown"' `
    | Set-Content $file

# Corriger DonationsScreen - Type DonationType
Write-Host "Correction types DonationType dans DonationsScreen..."
$file = $files["DonationsScreen"]
$content = Get-Content $file -Raw
$content = $content -replace '"Dîme" ->', 'DonationType.TITHE.name ->'
$content = $content -replace '"Offrande" ->', 'DonationType.OFFERING.name ->'
$content = $content -replace 'selectedFilter = "Dîme"', 'selectedFilter = DonationType.TITHE.name'
$content = $content -replace 'selectedFilter = "Offrande"', 'selectedFilter = DonationType.OFFERING.name'
$content | Set-Content $file

Write-Host "Corrections terminées avec succès!"
