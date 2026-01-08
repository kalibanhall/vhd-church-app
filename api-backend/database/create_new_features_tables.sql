-- =============================================================================
-- SCRIPT SQL: Création des tables pour les nouvelles fonctionnalités
-- =============================================================================
-- 
-- Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
-- GitHub: https://github.com/KalibanHall
-- 
-- Ce script crée toutes les tables nécessaires pour les 16 nouvelles
-- fonctionnalités de l'application MyChurchApp.
-- 
-- =============================================================================

-- =====================
-- 1. NEWS (Fil d'actualité)
-- =====================
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'announcement', -- announcement, event, testimony, update
    image_url VARCHAR(500),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT true,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(news_id, user_id)
);

CREATE TABLE IF NOT EXISTS news_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_created ON news(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_type ON news(type);

-- =====================
-- 2. ALERTS (Alertes urgentes)
-- =====================
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) DEFAULT 'info', -- urgent, warning, info
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority INTEGER DEFAULT 2, -- 1=highest, 2=normal, 3=low
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_acknowledgements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(alert_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active, expires_at);

-- =====================
-- 3. PRAYER CELLS (Cellules de prière)
-- =====================
CREATE TABLE IF NOT EXISTS prayer_cells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    location VARCHAR(500),
    schedule VARCHAR(255), -- Ex: "Mercredi 19h30"
    max_members INTEGER DEFAULT 15,
    category VARCHAR(50) DEFAULT 'general', -- youth, family, women, men, general
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prayer_cell_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cell_id UUID NOT NULL REFERENCES prayer_cells(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(cell_id, user_id)
);

CREATE TABLE IF NOT EXISTS prayer_cell_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cell_id UUID NOT NULL REFERENCES prayer_cells(id) ON DELETE CASCADE,
    date TIMESTAMP NOT NULL,
    topic VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- 4. CHURCH SERVICES (Vous servir)
-- =====================
CREATE TABLE IF NOT EXISTS church_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- documents, blessings, counseling, ceremonies
    processing_time VARCHAR(100),
    fee DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES church_services(id) ON DELETE CASCADE,
    details TEXT,
    preferred_date TIMESTAMP,
    urgency VARCHAR(20) DEFAULT 'normal', -- urgent, normal, low
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, cancelled
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- 5. FOLLOWUP (Être suivi)
-- =====================
CREATE TABLE IF NOT EXISTS followup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- spiritual, newbeliever, crisis, marriage, grief
    reason TEXT NOT NULL,
    preferred_contact VARCHAR(50), -- phone, email, in-person
    availability TEXT,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, assigned, active, completed
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    type_name VARCHAR(255),
    start_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active', -- active, paused, completed
    next_session TIMESTAMP,
    session_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- 6. QUESTIONS (Poser une question)
-- =====================
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- faith, bible, practical, church
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending', -- pending, answered
    answer TEXT,
    answered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    answered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);

-- =====================
-- 7. CONFLICTS (Résolution de conflits)
-- =====================
CREATE TABLE IF NOT EXISTS conflict_mediations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conflict_type VARCHAR(50) NOT NULL, -- family, church, work, personal
    type_name VARCHAR(255),
    description TEXT NOT NULL,
    desired_outcome TEXT,
    urgency VARCHAR(20) DEFAULT 'normal',
    is_confidential BOOLEAN DEFAULT false,
    mediator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, assigned, in-progress, resolved
    next_session TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- 8. ABUSE REPORTS (Signalement d'abus)
-- =====================
CREATE TABLE IF NOT EXISTS abuse_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id VARCHAR(50) UNIQUE NOT NULL, -- ABR-TIMESTAMP-RANDOM
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Nullable for anonymous
    type VARCHAR(50) NOT NULL, -- physical, emotional, spiritual, sexual, financial, other
    description TEXT NOT NULL,
    incident_date DATE,
    location VARCHAR(500),
    is_anonymous BOOLEAN DEFAULT false,
    wants_follow_up BOOLEAN DEFAULT false,
    contact_preference VARCHAR(255),
    additional_notes TEXT,
    status VARCHAR(20) DEFAULT 'received', -- received, reviewed, investigating, resolved
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- IMPORTANT: This table contains sensitive data - ensure proper access controls
CREATE INDEX IF NOT EXISTS idx_abuse_reports_status ON abuse_reports(status);

-- =====================
-- 9. MUTUAL HELP (S'entraider)
-- =====================
CREATE TABLE IF NOT EXISTS mutual_help (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- need, offer
    category VARCHAR(50) NOT NULL, -- transport, education, financial, housing, food, other
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(500),
    is_urgent BOOLEAN DEFAULT false,
    show_phone BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'open', -- open, in-progress, closed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mutual_help_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    help_id UUID NOT NULL REFERENCES mutual_help(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================
-- 10. MARKETPLACE (Acheter/Vendre)
-- =====================
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    category VARCHAR(50) NOT NULL, -- books, instruments, clothing, electronics, other
    type VARCHAR(20) DEFAULT 'sell', -- sell, buy, exchange
    condition VARCHAR(20) DEFAULT 'good', -- new, excellent, good, fair
    images JSONB DEFAULT '[]'::jsonb,
    location VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active', -- active, sold, closed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON marketplace_listings(category);

-- =====================
-- 11. LIBRARY (Bibliothèque)
-- =====================
CREATE TABLE IF NOT EXISTS library_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    isbn VARCHAR(20),
    category VARCHAR(50), -- bible, theology, devotional, biography, family, leadership, youth, children
    cover_url VARCHAR(500),
    quantity INTEGER DEFAULT 1,
    published_year INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP NOT NULL,
    returned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_loans_user ON library_loans(user_id, returned_at);

-- =====================
-- 12. AUDIOBOOKS (Livres audio)
-- =====================
CREATE TABLE IF NOT EXISTS audiobooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    narrator VARCHAR(255),
    description TEXT,
    category VARCHAR(50), -- bible, sermons, books, testimonies, children
    cover_url VARCHAR(500),
    audio_url VARCHAR(500),
    duration VARCHAR(50), -- Ex: "8h 30min"
    is_free BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audiobook_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audiobook_id UUID NOT NULL REFERENCES audiobooks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_position INTEGER DEFAULT 0, -- in seconds
    progress_percent INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(audiobook_id, user_id)
);

-- =====================
-- 13. MUSIC (Musique gospel)
-- =====================
CREATE TABLE IF NOT EXISTS music_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    photo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS music_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist_id UUID REFERENCES music_artists(id) ON DELETE SET NULL,
    artist_name VARCHAR(255) NOT NULL,
    album_name VARCHAR(255),
    genre VARCHAR(50) DEFAULT 'gospel', -- worship, gospel, hymns, contemporary
    duration VARCHAR(20), -- Ex: "5:23"
    cover_url VARCHAR(500),
    audio_url VARCHAR(500),
    play_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS music_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url VARCHAR(500),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playlist_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID NOT NULL REFERENCES music_playlists(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES music_tracks(id) ON DELETE CASCADE,
    position INTEGER,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(playlist_id, track_id)
);

-- =====================
-- 14. SONGBOOK (Cantiques)
-- =====================
CREATE TABLE IF NOT EXISTS songbook (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INTEGER, -- Hymn number if applicable
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    category VARCHAR(50), -- worship, hymns, christmas, easter, communion, children
    first_line VARCHAR(500), -- First line of lyrics for search
    lyrics TEXT NOT NULL,
    chords_lyrics TEXT, -- Lyrics with chord notations
    audio_url VARCHAR(500),
    has_chords BOOLEAN DEFAULT false,
    has_audio BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS songbook_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id UUID NOT NULL REFERENCES songbook(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(song_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_songbook_number ON songbook(number);
CREATE INDEX IF NOT EXISTS idx_songbook_title ON songbook(title);

-- =====================
-- 15. GALLERY (Galerie photos)
-- =====================
CREATE TABLE IF NOT EXISTS gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    category VARCHAR(50), -- worship, baptism, retreat, event, celebration
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    caption VARCHAR(500),
    taken_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_albums_date ON gallery_albums(event_date DESC);

-- =====================
-- 16. TRANSPORT (Navette)
-- =====================
CREATE TABLE IF NOT EXISTS transport_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stops JSONB DEFAULT '[]'::jsonb, -- Array of stop names
    departure_time TIME,
    return_time TIME,
    capacity INTEGER DEFAULT 15,
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES transport_routes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    departure_time TIME NOT NULL,
    return_time TIME,
    capacity INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES transport_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pickup_stop VARCHAR(255),
    passengers INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, cancelled
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transport_schedules_date ON transport_schedules(date);
CREATE INDEX IF NOT EXISTS idx_transport_bookings_user ON transport_bookings(user_id, status);

-- =============================================================================
-- GRANTS (Permissions)
-- =============================================================================
-- Si vous utilisez un utilisateur spécifique pour l'application, accordez les permissions:
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- =============================================================================
-- VERIFICATION
-- =============================================================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tables.table_name) as column_count
FROM information_schema.tables tables
WHERE table_schema = 'public'
AND table_name IN (
    'news', 'news_likes', 'news_comments',
    'alerts', 'alert_acknowledgements',
    'prayer_cells', 'prayer_cell_members', 'prayer_cell_meetings',
    'church_services', 'service_requests',
    'followup_requests', 'followups',
    'questions',
    'conflict_mediations',
    'abuse_reports',
    'mutual_help', 'mutual_help_responses',
    'marketplace_listings', 'marketplace_messages',
    'library_books', 'library_loans',
    'audiobooks', 'audiobook_progress',
    'music_artists', 'music_tracks', 'music_playlists', 'playlist_tracks',
    'songbook', 'songbook_favorites',
    'gallery_albums', 'gallery_photos',
    'transport_routes', 'transport_schedules', 'transport_bookings'
)
ORDER BY table_name;
