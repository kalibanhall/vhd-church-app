-- Script d'initialisation de la base de données My Church App
-- Création d'extensions PostgreSQL utiles

-- Extension pour les UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour la recherche textuelle complète
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Extension pour les fonctions de géolocalisation (optionnel)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- Création d'un utilisateur de lecture seule pour les rapports
CREATE USER church_readonly WITH PASSWORD 'readonly_2025';

-- Configuration des paramètres par défaut
SET timezone = 'UTC';

-- Index pour améliorer les performances
-- Ces index seront créés automatiquement par Prisma, mais on peut les optimiser ici si nécessaire

-- Commentaires sur la base de données
COMMENT ON DATABASE church_db IS 'Base de données pour l''application de gestion d''église My Church App';

-- Affichage du statut
SELECT 'Base de données My Church App initialisée avec succès!' as status;