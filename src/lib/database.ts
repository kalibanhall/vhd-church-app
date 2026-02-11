import postgres from 'postgres'

// Configuration de la connexion PostgreSQL
const sql = postgres(process.env.DATABASE_URL!, {
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.lwmyferidfbzcnggddob',
  password: 'VhdChurch2025!',
  ssl: 'require'
})

export { sql }

// Fonction pour créer les tables
export async function createTables() {
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

// Fonction pour insérer des données de test
export async function seedData() {
  try {
    // Créer un admin
    await sql`
      INSERT INTO users (email, password, name, role, phone)
      VALUES ('admin@mychurchapp.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrateur MyChurchApp', 'admin', '+243 123 456 789')
      ON CONFLICT (email) DO NOTHING
    `

    // Créer quelques pasteurs
    await sql`
      INSERT INTO users (email, password, name, role, phone)
      VALUES 
        ('pasteur@mychurchapp.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pasteur Principal', 'pastor', '+243 987 654 321'),
        ('membre@mychurchapp.com', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Membre Test', 'member', '+243 555 123 456')
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