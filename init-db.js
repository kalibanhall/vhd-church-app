// Script pour initialiser la base de données PostgreSQL
const postgres = require('postgres')

const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres.lwmyferidfbzcnggddob:VhdChurch2025!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
})

async function createTables() {
  try {
    // Table Users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        phone VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Table Events
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date TIMESTAMP NOT NULL,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Table Donations
    await sql`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL,
        type VARCHAR(100),
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'completed'
      )
    `

    // Table Preachings
    await sql`
      CREATE TABLE IF NOT EXISTS preachings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        preacher VARCHAR(255),
        date TIMESTAMP NOT NULL,
        video_url VARCHAR(500),
        audio_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Table Prayers
    await sql`
      CREATE TABLE IF NOT EXISTS prayers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        request TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Table Testimonies
    await sql`
      CREATE TABLE IF NOT EXISTS testimonies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('✅ Toutes les tables créées avec succès!')
    return true
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error)
    return false
  }
}

async function seedData() {
  try {
    // Créer un admin
    await sql`
      INSERT INTO users (email, password, name, role, phone)
      VALUES ('admin@vhd.app', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrateur VHD', 'admin', '+243 123 456 789')
      ON CONFLICT (email) DO NOTHING
    `

    // Créer quelques pasteurs
    await sql`
      INSERT INTO users (email, password, name, role, phone)
      VALUES 
        ('pasteur@vhd.app', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pasteur Principal', 'pastor', '+243 987 654 321'),
        ('membre@vhd.app', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Membre Test', 'member', '+243 555 123 456')
      ON CONFLICT (email) DO NOTHING
    `

    // Créer quelques événements
    await sql`
      INSERT INTO events (title, description, date, location)
      VALUES 
        ('Culte du Dimanche', 'Service dominical habituel avec prédication et adoration', '2025-10-26 10:00:00', 'Sanctuaire Principal'),
        ('Réunion de Prière', 'Temps de prière communautaire', '2025-10-23 19:00:00', 'Salle de Prière'),
        ('École du Dimanche', 'Enseignement pour les enfants', '2025-10-26 09:00:00', 'Salle des Enfants')
    `

    // Créer quelques prédications
    await sql`
      INSERT INTO preachings (title, description, preacher, date)
      VALUES 
        ('La Foi qui Déplace les Montagnes', 'Message sur la puissance de la foi', 'Pasteur Principal', '2025-10-20 10:00:00'),
        ('Marcher dans l Amour', 'Enseignement sur l amour fraternel', 'Pasteur Principal', '2025-10-13 10:00:00')
    `

    console.log('✅ Données de test créées avec succès!')
    return true
  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error)
    return false
  }
}

async function initDatabase() {
  console.log('🚀 Initialisation de la base de données...')
  
  // Créer les tables
  const tablesCreated = await createTables()
  if (!tablesCreated) {
    console.log('❌ Échec de la création des tables')
    process.exit(1)
  }

  // Insérer les données de test
  const dataSeeded = await seedData()
  if (!dataSeeded) {
    console.log('❌ Échec de l\'insertion des données')
    process.exit(1)
  }

  console.log('✅ Base de données initialisée avec succès!')
  console.log('\n📋 Comptes créés:')
  console.log('  Admin: admin@vhd.app / password')
  console.log('  Pasteur: pasteur@vhd.app / password')
  console.log('  Membre: membre@vhd.app / password')
  
  process.exit(0)
}

initDatabase().catch(console.error)