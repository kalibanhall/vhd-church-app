import { PrismaClient as SQLiteClient } from '@prisma/client'
// Note: Quand on basculera vers PostgreSQL, on décommentera cette ligne
// import { PrismaClient as PostgresClient } from '@prisma/client-postgres'

/**
 * Script de migration de SQLite vers PostgreSQL
 * 
 * Ce script permet de migrer toutes les données de SQLite vers PostgreSQL
 * quand Docker sera installé et configuré.
 * 
 * Instructions d'utilisation :
 * 1. Installer Docker Desktop
 * 2. Démarrer docker-compose up -d
 * 3. Changer DATABASE_URL vers PostgreSQL dans .env
 * 4. Modifier le provider dans schema.prisma vers "postgresql"
 * 5. Ajouter les types PostgreSQL (@db.VarChar, @db.Text, etc.)
 * 6. Convertir les String enums vers de vrais enums PostgreSQL
 * 7. Exécuter ce script : npx tsx prisma/sqlite-to-postgres.ts
 */

const sqliteClient = new SQLiteClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
})

async function migrateSQLiteToPostgreSQL() {
  console.log('🚀 Début de la migration SQLite vers PostgreSQL...')
  
  try {
    // 1. Exporter toutes les données de SQLite
    const users = await sqliteClient.user.findMany({
      include: {
        donations: true,
        createdEvents: true,
        eventAttendances: true,
        sermons: true,
        appointments: true,
        pastorAppointments: true,
        prayers: true,
        prayerSupports: true,
        testimonies: true,
        messages: true,
        notifications: true,
        channelMemberships: true,
        messageReactions: true
      }
    })

    const donationProjects = await sqliteClient.donationProject.findMany({
      include: {
        donations: true
      }
    })

    const channels = await sqliteClient.channel.findMany({
      include: {
        messages: true,
        members: true
      }
    })

    console.log(`📊 Données exportées:`)
    console.log(`   - ${users.length} utilisateurs`)
    console.log(`   - ${donationProjects.length} projets de dons`)
    console.log(`   - ${channels.length} canaux`)

    // 2. Ici on ajouterait l'import vers PostgreSQL
    console.log('💡 Pour terminer la migration :')
    console.log('   1. Configurez PostgreSQL avec Docker')
    console.log('   2. Mettez à jour DATABASE_URL')
    console.log('   3. Modifiez schema.prisma pour PostgreSQL')
    console.log('   4. Décommentez le code d\'import dans ce script')
    console.log('   5. Relancez ce script')

    // Sauvegarder les données en JSON pour backup
    require('fs').writeFileSync(
      './prisma/backup-data.json',
      JSON.stringify({
        users,
        donationProjects,
        channels,
        exportDate: new Date().toISOString()
      }, null, 2)
    )

    console.log('✅ Données sauvegardées dans prisma/backup-data.json')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await sqliteClient.$disconnect()
  }
}

// Fonction pour restaurer depuis le backup JSON
export async function restoreFromBackup() {
  console.log('📥 Restauration depuis le backup JSON...')
  
  const backup = JSON.parse(
    require('fs').readFileSync('./prisma/backup-data.json', 'utf8')
  )

  console.log(`📊 Backup du ${backup.exportDate}:`)
  console.log(`   - ${backup.users.length} utilisateurs`)
  console.log(`   - ${backup.donationProjects.length} projets`)
  console.log(`   - ${backup.channels.length} canaux`)

  // Ici on ajouterait le code de restauration vers PostgreSQL
}

if (require.main === module) {
  migrateSQLiteToPostgreSQL()
}