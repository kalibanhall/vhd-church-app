-- =============================================================================
-- MIGRATION: Création de la table app_settings pour les paramètres de l'application
-- =============================================================================
-- Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
-- Date: Janvier 2026
-- Description: Table pour stocker les paramètres configurables de l'application
-- =============================================================================

-- ============================================
-- TABLE: app_settings (Paramètres de l'application)
-- ============================================
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',  -- general, contact, social, appearance, etc.
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,  -- Si true, accessible sans authentification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_is_public ON app_settings(is_public);

-- ============================================
-- INSERTION DES PARAMÈTRES PAR DÉFAUT
-- ============================================
INSERT INTO app_settings (key, value, category, description, is_public) VALUES
    -- Informations de contact
    ('contact_email', 'contact@mychurchapp.com', 'contact', 'Email de contact principal de l''église', TRUE),
    ('contact_phone', '+243 83 23 13 105', 'contact', 'Numéro de téléphone principal de l''église', TRUE),
    ('emergency_email', 'contact@mychurchapp.com', 'contact', 'Email pour les urgences', TRUE),
    ('emergency_phone', '+243 83 23 13 105', 'contact', 'Numéro de téléphone pour les urgences', TRUE),
    ('secretariat_phone', '+243 83 23 13 105', 'contact', 'Numéro du secrétariat', TRUE),
    
    -- Adresse
    ('church_name', 'MyChurchApp', 'general', 'Nom de l''église', TRUE),
    ('church_address', '', 'contact', 'Adresse physique de l''église', TRUE),
    ('church_city', '', 'contact', 'Ville', TRUE),
    ('church_country', 'République Démocratique du Congo', 'contact', 'Pays', TRUE),
    
    -- Réseaux sociaux
    ('social_facebook', '', 'social', 'Lien Facebook', TRUE),
    ('social_instagram', '', 'social', 'Lien Instagram', TRUE),
    ('social_youtube', '', 'social', 'Lien YouTube', TRUE),
    ('social_twitter', '', 'social', 'Lien Twitter/X', TRUE),
    ('social_whatsapp', '', 'social', 'Numéro WhatsApp', TRUE),
    
    -- Horaires
    ('service_hours_sunday', '09h00 - 12h00', 'hours', 'Horaires du culte dominical', TRUE),
    ('service_hours_wednesday', '18h00 - 20h00', 'hours', 'Horaires de la réunion de prière du mercredi', TRUE),
    ('office_hours', 'Lun-Ven: 08h00 - 17h00', 'hours', 'Horaires d''ouverture du secrétariat', TRUE),
    
    -- Paramètres d'application
    ('app_version', '1.0.0', 'general', 'Version de l''application', TRUE),
    ('maintenance_mode', 'false', 'general', 'Mode maintenance activé', FALSE),
    ('allow_registrations', 'true', 'general', 'Autoriser les nouvelles inscriptions', FALSE)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- TRIGGER POUR UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON app_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE app_settings IS 'Paramètres configurables de l''application MyChurchApp';
COMMENT ON COLUMN app_settings.key IS 'Clé unique du paramètre';
COMMENT ON COLUMN app_settings.value IS 'Valeur du paramètre';
COMMENT ON COLUMN app_settings.category IS 'Catégorie pour le regroupement (contact, social, hours, general)';
COMMENT ON COLUMN app_settings.is_public IS 'Si true, accessible via l''API publique';
