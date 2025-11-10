-- Migration pour ajouter la reconnaissance faciale

-- Ajouter la colonne face_descriptor à la table membres
ALTER TABLE membres 
ADD COLUMN IF NOT EXISTS face_descriptor FLOAT8[];

-- Créer un index pour rechercher les membres avec descripteur
CREATE INDEX IF NOT EXISTS idx_membres_face_descriptor 
ON membres(id) 
WHERE face_descriptor IS NOT NULL;

-- Ajouter un commentaire
COMMENT ON COLUMN membres.face_descriptor IS 'Descripteur facial (128 dimensions) pour la reconnaissance faciale';

-- Créer un bucket storage pour les photos si nécessaire
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Politique de storage pour permettre l'upload
CREATE POLICY IF NOT EXISTS "Permettre upload photos authentifié"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

CREATE POLICY IF NOT EXISTS "Permettre lecture photos publique"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');
