import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lwmyferidfbzcnggddob.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Exécution de la migration pour la reconnaissance faciale...\n');

  try {
    // 1. Ajouter la colonne face_descriptor
    console.log('1. Ajout de la colonne face_descriptor...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE membres ADD COLUMN IF NOT EXISTS face_descriptor FLOAT8[];'
    });
    
    if (alterError) {
      console.log('⚠️  Colonne peut-être déjà existante:', alterError.message);
    } else {
      console.log('✅ Colonne face_descriptor ajoutée\n');
    }

    // 2. Créer l'index
    console.log('2. Création de l\'index...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_membres_face_descriptor 
            ON membres(id) 
            WHERE face_descriptor IS NOT NULL;`
    });
    
    if (indexError) {
      console.log('⚠️  Index peut-être déjà existant:', indexError.message);
    } else {
      console.log('✅ Index créé\n');
    }

    // 3. Vérifier le bucket photos
    console.log('3. Vérification du bucket storage...');
    const { data: buckets } = await supabase.storage.listBuckets();
    const photosExists = buckets?.some(b => b.name === 'photos');
    
    if (!photosExists) {
      const { error: bucketError } = await supabase.storage.createBucket('photos', {
        public: true
      });
      
      if (bucketError) {
        console.log('⚠️  Erreur création bucket:', bucketError.message);
      } else {
        console.log('✅ Bucket photos créé\n');
      }
    } else {
      console.log('✅ Bucket photos existe déjà\n');
    }

    console.log('🎉 Migration terminée avec succès!\n');
    console.log('📝 Prochaines étapes:');
    console.log('   1. Accédez à /facial-enrollment pour enregistrer des visages');
    console.log('   2. Accédez à /facial-attendance pour le pointage facial');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

runMigration();
