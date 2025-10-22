/**
 * Script d'initialisation directe de la base de données
 * Contourne Prisma pour créer les tables directement en SQL
 */

const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres.lwmyferidfbzcnggddob:VhdChurch2025!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const client = new Client({
  connectionString: DATABASE_URL,
});

const createTablesSQL = `
-- Extension pour UUID (si pas déjà activée)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table des utilisateurs/membres
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(320) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'FIDELE' CHECK (role IN ('FIDELE', 'OUVRIER', 'PASTEUR', 'ADMIN')),
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED')),
  birth_date TIMESTAMPTZ,
  address TEXT,
  profile_image_url TEXT,
  membership_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  membership_number VARCHAR(50) UNIQUE,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  baptism_date TIMESTAMPTZ,
  marital_status VARCHAR(20) CHECK (marital_status IN ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED')),
  profession VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des dons
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  donation_type VARCHAR(20) NOT NULL CHECK (donation_type IN ('OFFERING', 'TITHE', 'FREEWILL', 'PROJECT', 'BUILDING', 'OTHER')),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK')),
  payment_reference VARCHAR(255),
  donation_date TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
  project_id UUID,
  notes TEXT,
  receipt_number VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des projets de donation
CREATE TABLE IF NOT EXISTS donation_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED')),
  project_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des événements
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  event_type VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern VARCHAR(100),
  status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED')),
  created_by UUID NOT NULL,
  animated_by UUID,
  event_image_url TEXT,
  show_on_homepage BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des rendez-vous
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pastor_id UUID NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')),
  notes TEXT,
  location VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des prières
CREATE TABLE IF NOT EXISTS prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'GENERAL',
  is_public BOOLEAN DEFAULT true,
  is_anonymous BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  is_answered BOOLEAN DEFAULT false,
  answered_date TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  prayer_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des témoignages
CREATE TABLE IF NOT EXISTS testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  category VARCHAR(50) DEFAULT 'HEALING',
  image_url TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'GENERAL',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des sondages
CREATE TABLE IF NOT EXISTS polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_anonymous BOOLEAN DEFAULT false,
  allow_multiple BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les contraintes de clés étrangères après création des tables
DO $$
BEGIN
  -- Contraintes pour donations
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_donations_user') THEN
    ALTER TABLE donations ADD CONSTRAINT fk_donations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_donations_project') THEN
    ALTER TABLE donations ADD CONSTRAINT fk_donations_project FOREIGN KEY (project_id) REFERENCES donation_projects(id);
  END IF;
  
  -- Contraintes pour events
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_events_creator') THEN
    ALTER TABLE events ADD CONSTRAINT fk_events_creator FOREIGN KEY (created_by) REFERENCES users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_events_pastor') THEN
    ALTER TABLE events ADD CONSTRAINT fk_events_pastor FOREIGN KEY (animated_by) REFERENCES users(id);
  END IF;
  
  -- Contraintes pour appointments
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_appointments_user') THEN
    ALTER TABLE appointments ADD CONSTRAINT fk_appointments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_appointments_pastor') THEN
    ALTER TABLE appointments ADD CONSTRAINT fk_appointments_pastor FOREIGN KEY (pastor_id) REFERENCES users(id);
  END IF;
  
  -- Contraintes pour prayers
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_prayers_user') THEN
    ALTER TABLE prayers ADD CONSTRAINT fk_prayers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  -- Contraintes pour testimonies
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_testimonies_user') THEN
    ALTER TABLE testimonies ADD CONSTRAINT fk_testimonies_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  -- Contraintes pour notifications
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_user') THEN
    ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
  
  -- Contraintes pour polls
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_polls_creator') THEN
    ALTER TABLE polls ADD CONSTRAINT fk_polls_creator FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(donation_date);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pastor_id ON appointments(pastor_id);
CREATE INDEX IF NOT EXISTS idx_prayers_user_id ON prayers(user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_status ON prayers(status);
CREATE INDEX IF NOT EXISTS idx_testimonies_user_id ON testimonies(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
`;

const insertTestDataSQL = `
-- Insérer un administrateur par défaut
INSERT INTO users (
  id, first_name, last_name, email, password_hash, role, status, membership_date
) VALUES (
  'b7d8f9a1-2c3d-4e5f-6789-012345678901'::uuid,
  'Administrateur',
  'VHD Church',
  'admin@vhd.app',
  '$2b$10$rQZoJ8fWjCjZjrqE4bK4GeUvM.t8fGANY3QnJlbhzMhKQ8wG1Q1Km', -- password: "password"
  'ADMIN',
  'ACTIVE',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insérer un pasteur par défaut
INSERT INTO users (
  id, first_name, last_name, email, password_hash, role, status, membership_date
) VALUES (
  'c8e9f0b2-3d4e-5f60-789a-123456789012'::uuid,
  'Pasteur',
  'Principal',
  'pasteur@vhd.app',
  '$2b$10$rQZoJ8fWjCjZjrqE4bK4GeUvM.t8fGANY3QnJlbhzMhKQ8wG1Q1Km', -- password: "password"
  'PASTEUR',
  'ACTIVE',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insérer quelques membres de test
INSERT INTO users (
  id, first_name, last_name, email, password_hash, role, status, membership_date
) VALUES 
(
  'd9f0a1c3-4e5f-6071-89ab-234567890123'::uuid,
  'Jean',
  'Mukendi',
  'jean@vhd.app',
  '$2b$10$rQZoJ8fWjCjZjrqE4bK4GeUvM.t8fGANY3QnJlbhzMhKQ8wG1Q1Km',
  'FIDELE',
  'ACTIVE',
  NOW()
),
(
  'e0a1b2d4-5f60-7182-9abc-345678901234'::uuid,
  'Marie',
  'Kabongo',
  'marie@vhd.app',
  '$2b$10$rQZoJ8fWjCjZjrqE4bK4GeUvM.t8fGANY3QnJlbhzMhKQ8wG1Q1Km',
  'FIDELE',
  'ACTIVE',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insérer quelques projets de donation
INSERT INTO donation_projects (
  id, project_name, description, target_amount, current_amount, status
) VALUES 
(
  'f1b2c3e5-6071-8293-a4bc-456789012345'::uuid,
  'Construction du nouveau sanctuaire',
  'Projet de construction d''un nouveau sanctuaire pour accueillir plus de fidèles',
  50000.00,
  15000.00,
  'ACTIVE'
),
(
  'a2c3d4f6-7182-93a4-b5cd-567890123456'::uuid,
  'Équipement audio-visuel',
  'Acquisition d''équipements modernes pour améliorer les cultes',
  10000.00,
  3500.00,
  'ACTIVE'
);

-- Insérer quelques événements
INSERT INTO events (
  id, title, description, event_date, start_time, event_type, created_by, status
) VALUES 
(
  'b3d4e5g7-8293-a4b5-c6de-678901234567'::uuid,
  'Culte dominical',
  'Culte principal du dimanche matin',
  '2025-10-27 09:00:00+00',
  '2025-10-27 09:00:00+00',
  'WORSHIP_SERVICE',
  'b7d8f9a1-2c3d-4e5f-6789-012345678901'::uuid,
  'SCHEDULED'
),
(
  'c4e5f6h8-93a4-b5c6-d7ef-789012345678'::uuid,
  'Réunion de prière',
  'Réunion de prière du mercredi soir',
  '2025-10-30 19:00:00+00',
  '2025-10-30 19:00:00+00',
  'PRAYER_MEETING',
  'b7d8f9a1-2c3d-4e5f-6789-012345678901'::uuid,
  'SCHEDULED'
);
`;

async function initDatabase() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await client.connect();

    console.log('🗄️  Création des tables...');
    await client.query(createTablesSQL);

    console.log('📊 Insertion des données de test...');
    await client.query(insertTestDataSQL);

    console.log('✅ Base de données initialisée avec succès !');

    // Vérifier les données
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const donationProjectsCount = await client.query('SELECT COUNT(*) FROM donation_projects');
    const eventsCount = await client.query('SELECT COUNT(*) FROM events');

    console.log(`👥 Utilisateurs créés: ${usersCount.rows[0].count}`);
    console.log(`💰 Projets de donation: ${donationProjectsCount.rows[0].count}`);
    console.log(`📅 Événements créés: ${eventsCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await client.end();
  }
}

// Exécuter le script
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };