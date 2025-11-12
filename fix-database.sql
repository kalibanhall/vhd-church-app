-- =============================================================================
-- Correctifs Base de Données PostgreSQL - VHD Church
-- =============================================================================
-- Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
-- Date: 12 Novembre 2025
-- =============================================================================

-- 1. Créer la table prayer_supports si elle n'existe pas
CREATE TABLE IF NOT EXISTS prayer_supports (
    id TEXT PRIMARY KEY,
    prayer_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prayer_id) REFERENCES prayers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(prayer_id, user_id)
);

-- 2. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_prayer_supports_prayer_id ON prayer_supports(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_supports_user_id ON prayer_supports(user_id);

-- 3. Vérifier que la colonne event_date existe bien dans events
-- (Normalement elle devrait déjà exister)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'event_date'
    ) THEN
        ALTER TABLE events ADD COLUMN event_date TIMESTAMP;
    END IF;
END $$;

-- 4. S'assurer que les colonnes nécessaires existent dans events
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'show_on_homepage'
    ) THEN
        ALTER TABLE events ADD COLUMN show_on_homepage BOOLEAN DEFAULT true;
    END IF;
END $$;

COMMIT;
