-- =============================================================================
-- RECONNAISSANCE FACIALE - MIGRATION POSTGRESQL
-- =============================================================================
-- Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
-- Version: 1.0.0
-- Date: Novembre 2025
-- =============================================================================

-- Table pour stocker les descripteurs faciaux des membres
CREATE TABLE IF NOT EXISTS face_descriptors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Changé de VARCHAR à UUID
    descriptor JSONB NOT NULL, -- Tableau de 128 valeurs (face-api.js)
    photo_url TEXT,
    quality_score DECIMAL(3,2), -- Score de qualité de la photo (0.00 à 1.00)
    is_primary BOOLEAN DEFAULT false, -- Descripteur principal du membre
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_face_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index pour recherche rapide par utilisateur
CREATE INDEX IF NOT EXISTS idx_face_descriptors_user_id ON face_descriptors(user_id);
CREATE INDEX IF NOT EXISTS idx_face_descriptors_primary ON face_descriptors(user_id, is_primary) WHERE is_primary = true;

-- Table pour les sessions de présence (cultes, réunions, etc.)
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID, -- Lien optionnel vers un événement (changé en UUID)
    session_name VARCHAR(255) NOT NULL,
    session_type VARCHAR(50) NOT NULL, -- CULTE, REUNION, CONFERENCE, FORMATION, etc.
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, COMPLETED, CANCELLED
    location VARCHAR(255),
    expected_attendees INTEGER DEFAULT 0,
    actual_attendees INTEGER DEFAULT 0,
    face_recognition_enabled BOOLEAN DEFAULT true,
    qr_code_enabled BOOLEAN DEFAULT true, -- Backup avec QR code
    created_by UUID NOT NULL, -- Changé de VARCHAR à UUID
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_session_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON attendance_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_status ON attendance_sessions(status);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_type ON attendance_sessions(session_type);

-- Table pour les enregistrements de présence (check-ins)
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    user_id UUID NOT NULL, -- Changé de VARCHAR à UUID
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_in_method VARCHAR(50) NOT NULL, -- FACIAL_RECOGNITION, QR_CODE, MANUAL
    confidence_score DECIMAL(5,4), -- Score de confiance pour reconnaissance faciale (0.0000 à 1.0000)
    photo_url TEXT, -- Photo prise au moment du check-in
    matched_descriptor_id UUID, -- ID du descripteur qui a matché
    camera_id UUID, -- Caméra utilisée
    device_info JSONB, -- Infos appareil (modèle, OS, etc.)
    location_data JSONB, -- GPS si disponible
    verified_by UUID, -- ID admin si vérification manuelle (changé en UUID)
    is_verified BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_checkin_session FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_checkin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_checkin_descriptor FOREIGN KEY (matched_descriptor_id) REFERENCES face_descriptors(id) ON DELETE SET NULL,
    CONSTRAINT fk_checkin_verifier FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Empêcher les doublons (un membre ne peut pointer qu'une fois par session)
    CONSTRAINT unique_session_user UNIQUE (session_id, user_id)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_check_ins_session ON check_ins(session_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_time ON check_ins(check_in_time DESC);
CREATE INDEX IF NOT EXISTS idx_check_ins_method ON check_ins(check_in_method);

-- Table pour la gestion des caméras/stations de pointage
CREATE TABLE IF NOT EXISTS cameras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_name VARCHAR(255) NOT NULL,
    camera_location VARCHAR(255), -- Ex: Entrée principale, Salle de prière, etc.
    camera_type VARCHAR(50) DEFAULT 'MOBILE', -- MOBILE, FIXED, TABLET
    device_id VARCHAR(255), -- ID unique de l'appareil
    is_active BOOLEAN DEFAULT true,
    last_ping TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    settings JSONB, -- Configuration caméra (résolution, seuil confiance, etc.)
    assigned_to UUID, -- Responsable de la caméra (changé en UUID)
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_camera_assigned FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_cameras_active ON cameras(is_active);
CREATE INDEX IF NOT EXISTS idx_cameras_location ON cameras(camera_location);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_face_descriptors_updated_at BEFORE UPDATE ON face_descriptors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_sessions_updated_at BEFORE UPDATE ON attendance_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_check_ins_updated_at BEFORE UPDATE ON check_ins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour mettre à jour le compteur actual_attendees
CREATE OR REPLACE FUNCTION update_session_attendees()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE attendance_sessions 
        SET actual_attendees = (
            SELECT COUNT(*) FROM check_ins WHERE session_id = NEW.session_id
        )
        WHERE id = NEW.session_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE attendance_sessions 
        SET actual_attendees = (
            SELECT COUNT(*) FROM check_ins WHERE session_id = OLD.session_id
        )
        WHERE id = OLD.session_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_session_attendees
AFTER INSERT OR DELETE ON check_ins
FOR EACH ROW EXECUTE FUNCTION update_session_attendees();

-- Vue pour les statistiques de présence par membre
CREATE OR REPLACE VIEW member_attendance_stats AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(DISTINCT ci.session_id) as total_sessions_attended,
    COUNT(DISTINCT CASE WHEN ci.check_in_method = 'FACIAL_RECOGNITION' THEN ci.id END) as facial_checkins,
    COUNT(DISTINCT CASE WHEN ci.check_in_method = 'QR_CODE' THEN ci.id END) as qr_checkins,
    COUNT(DISTINCT CASE WHEN ci.check_in_method = 'MANUAL' THEN ci.id END) as manual_checkins,
    AVG(ci.confidence_score) as avg_confidence_score,
    MAX(ci.check_in_time) as last_attendance,
    COUNT(DISTINCT CASE WHEN ci.check_in_time >= NOW() - INTERVAL '30 days' THEN ci.id END) as last_30_days_attendance
FROM users u
LEFT JOIN check_ins ci ON u.id = ci.user_id
GROUP BY u.id, u.first_name, u.last_name, u.email;

-- Vue pour les statistiques de sessions
CREATE OR REPLACE VIEW session_statistics AS
SELECT 
    s.id,
    s.session_name,
    s.session_type,
    s.session_date,
    s.status,
    s.expected_attendees,
    s.actual_attendees,
    ROUND((s.actual_attendees::DECIMAL / NULLIF(s.expected_attendees, 0)) * 100, 2) as attendance_rate,
    COUNT(DISTINCT ci.id) as total_checkins,
    COUNT(DISTINCT CASE WHEN ci.check_in_method = 'FACIAL_RECOGNITION' THEN ci.id END) as facial_checkins,
    AVG(CASE WHEN ci.check_in_method = 'FACIAL_RECOGNITION' THEN ci.confidence_score END) as avg_facial_confidence,
    MIN(ci.check_in_time) as first_checkin_time,
    MAX(ci.check_in_time) as last_checkin_time
FROM attendance_sessions s
LEFT JOIN check_ins ci ON s.id = ci.session_id
GROUP BY s.id, s.session_name, s.session_type, s.session_date, s.status, s.expected_attendees, s.actual_attendees;

-- Commentaires sur les tables
COMMENT ON TABLE face_descriptors IS 'Stockage des descripteurs faciaux des membres pour la reconnaissance';
COMMENT ON TABLE attendance_sessions IS 'Sessions de présence (cultes, réunions, etc.)';
COMMENT ON TABLE check_ins IS 'Enregistrements de présence des membres';
COMMENT ON TABLE cameras IS 'Gestion des caméras/stations de pointage';

-- Données de test (optionnel)
-- INSERT INTO cameras (camera_name, camera_location, camera_type) VALUES
-- ('Caméra Principale', 'Entrée Principale', 'FIXED'),
-- ('Tablette 1', 'Accueil', 'TABLET'),
-- ('Mobile Admin', 'Mobile', 'MOBILE');

COMMENT ON DATABASE postgres IS 'Base de données MyChurchApp avec reconnaissance faciale';
