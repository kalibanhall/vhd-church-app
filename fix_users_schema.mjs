import postgres from 'postgres';

const poolerUrl = 'postgresql://postgres.yckqzuugkjzcemaxbwji:VhdChurch2025@aws-1-eu-west-2.pooler.supabase.com:6543/postgres';

async function fixUsersTableSchema() {
  console.log('🔧 Connexion au Transaction Pooler pour corriger le schéma...');
  const sql = postgres(poolerUrl, { ssl: 'require', prepare: false });

  try {
    console.log('⏳ Correction du champ membership_number pour permettre NULL...');
    
    // Modifier la colonne pour permettre NULL
    await sql`
      ALTER TABLE public.users 
      ALTER COLUMN membership_number DROP NOT NULL;
    `;
    
    console.log('✅ Champ membership_number modifié (peut être NULL)');

    // Vérifier la structure de la table
    const tableInfo = await sql`
      SELECT column_name, is_nullable, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY column_name;
    `;
    
    console.log('📋 Structure table users:');
    tableInfo.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? '✅ NULL' : '❌ NOT NULL';
      console.log(`  ${col.column_name}: ${col.data_type} ${nullable}`);
    });

    await sql.end();
    console.log('🔌 Déconnexion');
    return true;
  } catch (err) {
    console.error('❌ Erreur correction schéma:', err.message || err);
    try { await sql.end(); } catch {}
    return false;
  }
}

fixUsersTableSchema().then(success => {
  if (success) console.log('🎉 Schéma corrigé : testez maintenant /api/init');
  else console.log('⚠️ Echec : vérifier les logs et réessayer');
});