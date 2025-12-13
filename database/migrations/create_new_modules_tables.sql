-- =============================================================================
-- MIGRATION: Création des tables pour les nouveaux modules
-- =============================================================================
-- Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
-- Date: Décembre 2025
-- Modules: Activités, Bénévolat, Formations, Notes, Demandes d'aide
-- =============================================================================

-- ============================================
-- TABLE: activities (Activités/Événements)
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'event',  -- event, worship, youth, women, men, children, prayer, other
    location VARCHAR(255),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT FALSE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    image_url TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(50),  -- daily, weekly, monthly, yearly
    status VARCHAR(20) DEFAULT 'upcoming',  -- upcoming, ongoing, completed, cancelled
    registration_required BOOLEAN DEFAULT FALSE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);

-- ============================================
-- TABLE: activity_registrations (Inscriptions aux activités)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered',  -- registered, attended, cancelled, no_show
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_registrations_activity ON activity_registrations(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_registrations_user ON activity_registrations(user_id);

-- ============================================
-- TABLE: service_teams (Équipes de service/Bénévolat)
-- ============================================
CREATE TABLE IF NOT EXISTS service_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    leader_id UUID REFERENCES users(id),
    max_members INTEGER,
    current_members INTEGER DEFAULT 0,
    meeting_schedule TEXT,
    requirements TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: volunteer_registrations (Inscriptions bénévoles)
-- ============================================
CREATE TABLE IF NOT EXISTS volunteer_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES service_teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected, active, inactive
    availability TEXT[],  -- ['sunday_morning', 'wednesday_evening', etc.]
    motivation TEXT,
    experience TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    notes TEXT,
    UNIQUE(team_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_volunteer_registrations_team ON volunteer_registrations(team_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_registrations_user ON volunteer_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_registrations_status ON volunteer_registrations(status);

-- ============================================
-- TABLE: courses (Formations/Cours)
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,  -- foundation, baptism, leadership, ministry, family, evangelism
    level VARCHAR(20) DEFAULT 'beginner',  -- beginner, intermediate, advanced
    duration VARCHAR(50),  -- ex: "4 semaines", "3 mois"
    image_url TEXT,
    instructor_id UUID REFERENCES users(id),
    instructor_name VARCHAR(100),
    max_students INTEGER,
    current_students INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    is_online BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    prerequisites TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);

-- ============================================
-- TABLE: course_lessons (Leçons des cours)
-- ============================================
CREATE TABLE IF NOT EXISTS course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    document_url TEXT,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_lessons_course ON course_lessons(course_id);

-- ============================================
-- TABLE: course_enrollments (Inscriptions aux cours)
-- ============================================
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'enrolled',  -- enrolled, in_progress, completed, dropped
    progress_percentage INTEGER DEFAULT 0,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    certificate_url TEXT,
    UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON course_enrollments(user_id);

-- ============================================
-- TABLE: lesson_progress (Progression des leçons)
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_minutes INTEGER DEFAULT 0,
    notes TEXT,
    UNIQUE(enrollment_id, lesson_id)
);

-- ============================================
-- TABLE: user_notes (Notes personnelles)
-- ============================================
CREATE TABLE IF NOT EXISTS user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    type VARCHAR(20) DEFAULT 'personal',  -- sermon, bible_study, personal
    sermon_id UUID,  -- Référence optionnelle à une prédication
    sermon_title VARCHAR(255),
    preacher VARCHAR(100),
    tags TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notes_user ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_type ON user_notes(type);
CREATE INDEX IF NOT EXISTS idx_user_notes_is_favorite ON user_notes(is_favorite);

-- ============================================
-- TABLE: help_requests (Demandes d'aide)
-- ============================================
CREATE TABLE IF NOT EXISTS help_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL,  -- material, financial, spiritual, counseling, prayer, other
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    urgency VARCHAR(10) DEFAULT 'medium',  -- low, medium, high
    status VARCHAR(20) DEFAULT 'pending',  -- pending, in_progress, completed, cancelled
    is_anonymous BOOLEAN DEFAULT FALSE,
    contact_preference VARCHAR(20),  -- phone, email, in_person
    phone VARCHAR(20),
    email VARCHAR(100),
    assigned_to UUID REFERENCES users(id),
    assigned_to_name VARCHAR(100),
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_help_requests_user ON help_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON help_requests(status);
CREATE INDEX IF NOT EXISTS idx_help_requests_urgency ON help_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_help_requests_type ON help_requests(type);

-- ============================================
-- TABLE: bible_reading_plans (Plans de lecture biblique)
-- ============================================
CREATE TABLE IF NOT EXISTS bible_reading_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_days INTEGER NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: user_reading_plans (Plans de lecture utilisateur)
-- ============================================
CREATE TABLE IF NOT EXISTS user_reading_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES bible_reading_plans(id) ON DELETE CASCADE,
    current_day INTEGER DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, plan_id)
);

-- ============================================
-- TABLE: reading_progress (Progression lecture)
-- ============================================
CREATE TABLE IF NOT EXISTS reading_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_plan_id UUID NOT NULL REFERENCES user_reading_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_plan_id, day_number)
);

-- ============================================
-- TABLE: favorite_verses (Versets favoris)
-- ============================================
CREATE TABLE IF NOT EXISTS favorite_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book VARCHAR(50) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    text TEXT NOT NULL,
    reference VARCHAR(100) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, reference)
);

CREATE INDEX IF NOT EXISTS idx_favorite_verses_user ON favorite_verses(user_id);

-- ============================================
-- INSERTION DE DONNÉES PAR DÉFAUT
-- ============================================

-- Équipes de service par défaut
INSERT INTO service_teams (name, description, icon, color) VALUES
    ('Accueil', 'Équipe d''accueil des visiteurs et membres', 'Users', '#3B82F6'),
    ('Louange', 'Équipe de louange et adoration', 'Music', '#8B5CF6'),
    ('Technique', 'Équipe son, vidéo et multimédia', 'Monitor', '#6366F1'),
    ('Intercession', 'Équipe de prière et intercession', 'Heart', '#EC4899'),
    ('Enfants', 'Ministère des enfants et école du dimanche', 'Baby', '#F59E0B'),
    ('Jeunesse', 'Ministère des jeunes', 'Zap', '#10B981'),
    ('Protocole', 'Équipe de protocole et organisation', 'Shield', '#6B7280'),
    ('Communication', 'Équipe communication et réseaux sociaux', 'MessageCircle', '#0EA5E9'),
    ('Entretien', 'Équipe d''entretien des locaux', 'Home', '#78716C'),
    ('Transport', 'Équipe de transport et logistique', 'Car', '#84CC16')
ON CONFLICT DO NOTHING;

-- Formations par défaut
INSERT INTO courses (title, description, category, level, duration, instructor_name) VALUES
    ('Les Fondements de la Foi', 'Cours de base pour les nouveaux croyants sur les fondements de la foi chrétienne', 'foundation', 'beginner', '4 semaines', 'Pasteur Principal'),
    ('Préparation au Baptême', 'Préparation spirituelle et doctrinale pour le baptême d''eau', 'baptism', 'beginner', '3 semaines', 'Pasteur Principal'),
    ('Leadership Chrétien', 'Formation pour les leaders et responsables de ministères', 'leadership', 'intermediate', '8 semaines', 'Pasteur Principal'),
    ('École du Ministère', 'Formation approfondie pour le service dans l''église', 'ministry', 'advanced', '3 mois', 'Pasteur Principal'),
    ('Vie de Famille', 'Enseignements sur le mariage et la famille selon la Bible', 'family', 'beginner', '6 semaines', 'Pasteur Principal'),
    ('Évangélisation', 'Formation pratique pour partager l''Évangile efficacement', 'evangelism', 'intermediate', '4 semaines', 'Pasteur Principal')
ON CONFLICT DO NOTHING;

-- Plans de lecture biblique par défaut
INSERT INTO bible_reading_plans (name, description, duration_days) VALUES
    ('Les Évangiles en 30 jours', 'Parcourez les quatre Évangiles pour redécouvrir la vie de Jésus', 30),
    ('Un Psaume par jour', 'Méditez sur un psaume chaque jour pendant un mois', 31),
    ('Sagesse des Proverbes', 'Un chapitre de Proverbes par jour pour grandir en sagesse', 31),
    ('Nouveau Testament en 90 jours', 'Lisez tout le Nouveau Testament en trois mois', 90),
    ('La Bible en 1 an', 'Programme de lecture complète de la Bible en une année', 365)
ON CONFLICT DO NOTHING;

-- ============================================
-- TRIGGERS POUR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux nouvelles tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['activities', 'service_teams', 'courses', 'user_notes', 'help_requests'])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', tbl, tbl);
        EXECUTE format('CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl, tbl);
    END LOOP;
END;
$$;

-- ============================================
-- GRANTS (si nécessaire pour Supabase)
-- ============================================
-- Ces grants peuvent être nécessaires selon votre configuration Supabase
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

COMMENT ON TABLE activities IS 'Table des activités et événements de l''église';
COMMENT ON TABLE service_teams IS 'Équipes de service et bénévolat';
COMMENT ON TABLE courses IS 'Formations et cours disponibles';
COMMENT ON TABLE user_notes IS 'Notes personnelles des utilisateurs';
COMMENT ON TABLE help_requests IS 'Demandes d''aide et assistance';
