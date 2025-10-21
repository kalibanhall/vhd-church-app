import postgres from 'postgres';

const poolerUrl = 'postgresql://postgres.yckqzuugkjzcemaxbwji:VhdChurch2025@aws-1-eu-west-2.pooler.supabase.com:6543/postgres';

async function createUsersTable() {
  console.log('🔧 Connexion au Transaction Pooler...');
  const sql = postgres(poolerUrl, { ssl: 'require', prepare: false });

  try {
    console.log('⏳ Création de la table `users` si elle n\'existe pas...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.users (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'FIDELE',
        status TEXT DEFAULT 'ACTIVE',
        birth_date TIMESTAMP WITH TIME ZONE,
        address TEXT,
        profile_image_url TEXT,
        membership_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        membership_number TEXT UNIQUE,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        baptism_date TIMESTAMP WITH TIME ZONE,
        marital_status TEXT,
        profession TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    console.log('✅ Table `users` créée ou déjà existante.');

    // Optionnel: create minimal other tables referenced by init (if needed)
    // For now we'll create a simple roles table if referenced (not necessary)

    await sql.end();
    console.log('🔌 Déconnexion');
    return true;
  } catch (err) {
    console.error('❌ Erreur création table users:', err.message || err);
    try { await sql.end(); } catch {}
    return false;
  }
}

createUsersTable().then(success => {
  if (success) console.log('🎉 Prêt : exécutez maintenant /api/init');
  else console.log('⚠️ Echec : vérifier les logs et réessayer');
});