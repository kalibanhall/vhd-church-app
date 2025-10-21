import postgres from 'postgres';

const poolerUrl = 'postgresql://postgres.yckqzuugkjzcemaxbwji:VhdChurch2025@aws-1-eu-west-2.pooler.supabase.com:6543/postgres';

async function recreateUsersTable() {
  console.log('🔧 Connexion au Transaction Pooler pour recréer la table users...');
  const sql = postgres(poolerUrl, { ssl: 'require', prepare: false });

  try {
    console.log('🗑️ Suppression de la table users existante...');
    await sql`DROP TABLE IF EXISTS public.users CASCADE;`;
    
    console.log('⏳ Création de la table users avec le schéma Prisma exact...');
    await sql`
      CREATE TABLE public.users (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'FIDELE',
        status TEXT DEFAULT 'ACTIVE',
        birth_date TIMESTAMPTZ,
        address TEXT,
        profile_image_url TEXT,
        membership_date TIMESTAMPTZ NOT NULL DEFAULT now(),
        membership_number TEXT UNIQUE,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        baptism_date TIMESTAMPTZ,
        marital_status TEXT,
        profession TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `;

    console.log('✅ Table users recréée avec le bon schéma');

    // Créer l'admin directement via SQL pour éviter les problèmes Prisma
    console.log('👤 Création de Chris Kasongo directement...');
    
    const adminId = 'admin-chris-kasongo-' + Date.now();
    const adminEmail = 'admin@vhd.app';
    const adminPassword = 'Qualis@2025';
    
    // Hash simple pour test (en production utiliser bcrypt)
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash(adminPassword, 10);
    
    await sql`
      INSERT INTO public.users (
        id, first_name, last_name, email, phone, password_hash, 
        role, status, membership_date, membership_number
      ) VALUES (
        ${adminId}, 'Chris', 'Kasongo', ${adminEmail}, '+243 999 999 999',
        ${passwordHash}, 'ADMIN', 'ACTIVE', now(), 'ADM001'
      )
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        updated_at = now();
    `;

    console.log('✅ Admin Chris Kasongo créé directement');

    // Vérifier l'admin créé
    const admin = await sql`
      SELECT id, first_name, last_name, email, role, status, membership_number
      FROM public.users 
      WHERE email = ${adminEmail};
    `;

    if (admin.length > 0) {
      console.log('🎉 Admin vérifié:');
      console.log(`  👤 ${admin[0].first_name} ${admin[0].last_name}`);
      console.log(`  📧 ${admin[0].email}`);
      console.log(`  🎯 ${admin[0].role} (${admin[0].status})`);
      console.log(`  🔢 ${admin[0].membership_number}`);
    }

    await sql.end();
    console.log('🔌 Déconnexion');
    return true;
  } catch (err) {
    console.error('❌ Erreur recréation table:', err.message || err);
    try { await sql.end(); } catch {}
    return false;
  }
}

recreateUsersTable().then(success => {
  if (success) console.log('🎉 Table recréée avec admin : testez /api/init ou directement /auth');
  else console.log('⚠️ Echec : vérifier les logs');
});