/**
 * Script simplifié pour nettoyer et recréer la base de données
 */

const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres.lwmyferidfbzcnggddob:VhdChurch2025!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const client = new Client({
  connectionString: DATABASE_URL,
});

async function cleanDatabase() {
  try {
    console.log('🔌 Connexion à la base de données...');
    await client.connect();

    console.log('🧹 Nettoyage de la base de données...');
    
    // Supprimer toutes les tables existantes
    const dropTablesSQL = `
      DROP TABLE IF EXISTS message_reactions CASCADE;
      DROP TABLE IF EXISTS channel_members CASCADE;
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS channels CASCADE;
      DROP TABLE IF EXISTS poll_votes CASCADE;
      DROP TABLE IF EXISTS poll_options CASCADE;
      DROP TABLE IF EXISTS polls CASCADE;
      DROP TABLE IF EXISTS scheduled_notifications CASCADE;
      DROP TABLE IF EXISTS notification_templates CASCADE;
      DROP TABLE IF EXISTS pastor_unavailability CASCADE;
      DROP TABLE IF EXISTS pastor_availability CASCADE;
      DROP TABLE IF EXISTS message_expiration_configs CASCADE;
      DROP TABLE IF EXISTS testimony_comments CASCADE;
      DROP TABLE IF EXISTS testimony_likes CASCADE;
      DROP TABLE IF EXISTS testimonies CASCADE;
      DROP TABLE IF EXISTS prayer_supports CASCADE;
      DROP TABLE IF EXISTS prayers CASCADE;
      DROP TABLE IF EXISTS appointments CASCADE;
      DROP TABLE IF EXISTS sermons CASCADE;
      DROP TABLE IF EXISTS event_attendances CASCADE;
      DROP TABLE IF EXISTS events CASCADE;
      DROP TABLE IF EXISTS donations CASCADE;
      DROP TABLE IF EXISTS donation_projects CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `;
    
    await client.query(dropTablesSQL);
    console.log('✅ Tables supprimées');

    // Créer les extensions nécessaires
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    console.log('✅ Extensions créées');

    // Créer les tables de base
    const createBasicTablesSQL = `
      -- Table des utilisateurs
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(320) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'FIDELE',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        birth_date TIMESTAMPTZ,
        address TEXT,
        profile_image_url TEXT,
        membership_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        membership_number VARCHAR(50) UNIQUE,
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        baptism_date TIMESTAMPTZ,
        marital_status VARCHAR(20),
        profession VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table des projets de donation
      CREATE TABLE donation_projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_name VARCHAR(255) NOT NULL,
        description TEXT,
        target_amount NUMERIC(12,2) NOT NULL,
        current_amount NUMERIC(12,2) DEFAULT 0,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        status VARCHAR(20) DEFAULT 'ACTIVE',
        project_image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table des dons
      CREATE TABLE donations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(12,2) NOT NULL,
        donation_type VARCHAR(20) NOT NULL,
        payment_method VARCHAR(20) NOT NULL,
        payment_reference VARCHAR(255),
        donation_date TIMESTAMPTZ NOT NULL,
        status VARCHAR(20) DEFAULT 'COMPLETED',
        project_id UUID REFERENCES donation_projects(id),
        notes TEXT,
        receipt_number VARCHAR(100) UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table des événements
      CREATE TABLE events (
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
        status VARCHAR(20) DEFAULT 'SCHEDULED',
        created_by UUID NOT NULL REFERENCES users(id),
        animated_by UUID REFERENCES users(id),
        event_image_url TEXT,
        show_on_homepage BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table des rendez-vous
      CREATE TABLE appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pastor_id UUID NOT NULL REFERENCES users(id),
        appointment_date TIMESTAMPTZ NOT NULL,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'SCHEDULED',
        notes TEXT,
        location VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table des prières
      CREATE TABLE prayers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'GENERAL',
        is_public BOOLEAN DEFAULT true,
        is_anonymous BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'PENDING',
        is_answered BOOLEAN DEFAULT false,
        answered_date TIMESTAMPTZ,
        approved_by UUID,
        approved_at TIMESTAMPTZ,
        prayer_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table des témoignages
      CREATE TABLE testimonies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'GENERAL',
        is_read BOOLEAN DEFAULT false,
        action_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table des sondages
      CREATE TABLE polls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        is_anonymous BOOLEAN DEFAULT false,
        allow_multiple BOOLEAN DEFAULT false,
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await client.query(createBasicTablesSQL);
    console.log('✅ Tables principales créées');

    // Insérer des données de test
    const insertTestDataSQL = `
      -- Admin par défaut
      INSERT INTO users (id, first_name, last_name, email, password_hash, role, status, membership_date) 
      VALUES (
        'b7d8f9a1-2c3d-4e5f-6789-012345678901'::uuid,
        'Administrateur',
        'VHD Church',
        'admin@vhd.app',
        '$2b$10$rQZoJ8fWjCjZjrqE4bK4GeUvM.t8fGANY3QnJlbhzMhKQ8wG1Q1Km',
        'ADMIN',
        'ACTIVE',
        NOW()
      ) ON CONFLICT (email) DO NOTHING;

      -- Pasteur par défaut
      INSERT INTO users (id, first_name, last_name, email, password_hash, role, status, membership_date) 
      VALUES (
        'c8e9f0b2-3d4e-5f60-789a-123456789012'::uuid,
        'Pasteur',
        'Principal',
        'pasteur@vhd.app',
        '$2b$10$rQZoJ8fWjCjZjrqE4bK4GeUvM.t8fGANY3QnJlbhzMhKQ8wG1Q1Km',
        'PASTEUR',
        'ACTIVE',
        NOW()
      ) ON CONFLICT (email) DO NOTHING;

      -- Membres de test
      INSERT INTO users (id, first_name, last_name, email, password_hash, role, status, membership_date) 
      VALUES 
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

      -- Projets de donation
      INSERT INTO donation_projects (id, project_name, description, target_amount, current_amount, status) 
      VALUES 
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

      -- Événements
      INSERT INTO events (id, title, description, event_date, start_time, event_type, created_by, status) 
      VALUES 
      (
        'b3d4e567-8293-a4b5-c6de-678901234567'::uuid,
        'Culte dominical',
        'Culte principal du dimanche matin',
        '2025-10-27 09:00:00+00',
        '2025-10-27 09:00:00+00',
        'WORSHIP_SERVICE',
        'b7d8f9a1-2c3d-4e5f-6789-012345678901'::uuid,
        'SCHEDULED'
      ),
      (
        'c4e5f678-93a4-b5c6-d7ef-789012345678'::uuid,
        'Réunion de prière',
        'Réunion de prière du mercredi soir',
        '2025-10-30 19:00:00+00',
        '2025-10-30 19:00:00+00',
        'PRAYER_MEETING',
        'b7d8f9a1-2c3d-4e5f-6789-012345678901'::uuid,
        'SCHEDULED'
      );

      -- Prières de test
      INSERT INTO prayers (user_id, title, content, category, is_public, status) 
      VALUES 
      (
        'd9f0a1c3-4e5f-6071-89ab-234567890123'::uuid,
        'Prière pour la guérison',
        'Seigneur, nous te prions pour la guérison de nos malades.',
        'HEALING',
        true,
        'APPROVED'
      ),
      (
        'e0a1b2d4-5f60-7182-9abc-345678901234'::uuid,
        'Prière pour la famille',
        'Père céleste, nous te confions nos familles.',
        'FAMILY',
        true,
        'PENDING'
      );

      -- Témoignages de test
      INSERT INTO testimonies (user_id, title, content, category, is_approved, is_published) 
      VALUES 
      (
        'd9f0a1c3-4e5f-6071-89ab-234567890123'::uuid,
        'Miracle de guérison',
        'Le Seigneur m''a guéri d''une maladie grave. Gloire à Dieu !',
        'HEALING',
        true,
        true
      ),
      (
        'e0a1b2d4-5f60-7182-9abc-345678901234'::uuid,
        'Provision divine',
        'Dieu a pourvu à tous mes besoins de façon miraculeuse.',
        'BREAKTHROUGH',
        true,
        true
      );
    `;

    await client.query(insertTestDataSQL);
    console.log('✅ Données de test insérées');

    // Vérifier les données
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const donationProjectsCount = await client.query('SELECT COUNT(*) FROM donation_projects');
    const eventsCount = await client.query('SELECT COUNT(*) FROM events');
    const prayersCount = await client.query('SELECT COUNT(*) FROM prayers');
    const testimoniesCount = await client.query('SELECT COUNT(*) FROM testimonies');

    console.log('📊 Résultats:');
    console.log(`👥 Utilisateurs: ${usersCount.rows[0].count}`);
    console.log(`💰 Projets de donation: ${donationProjectsCount.rows[0].count}`);
    console.log(`📅 Événements: ${eventsCount.rows[0].count}`);
    console.log(`🙏 Prières: ${prayersCount.rows[0].count}`);
    console.log(`✨ Témoignages: ${testimoniesCount.rows[0].count}`);

    console.log('🎉 Base de données initialisée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
  } finally {
    await client.end();
  }
}

// Exécuter le script
if (require.main === module) {
  cleanDatabase();
}

module.exports = { cleanDatabase };