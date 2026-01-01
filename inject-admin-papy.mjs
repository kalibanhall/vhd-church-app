import postgres from 'postgres';
import bcrypt from 'bcryptjs';

// Configuration Supabase (URL correcte depuis .env.example)
const poolerUrl = 'postgresql://postgres.lwmyferidfbzcnggddob:QualisApp2025@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function injectAdmin() {
  console.log('🔧 Connexion à Supabase...');
  const sql = postgres(poolerUrl, { ssl: 'require', prepare: false });

  try {
    // Données du nouvel admin
    const adminData = {
      firstName: 'Papy',
      lastName: 'Mbavu',
      email: 'Papym@mail.com',
      password: 'PapyM25',
      phone: '+243 000 000 000',
      role: 'ADMIN',
      membershipNumber: 'ADM-PAPY-001'
    };

    console.log('🔐 Hashage du mot de passe...');
    const passwordHash = await bcrypt.hash(adminData.password, 10);

    console.log('👤 Injection de l\'admin Papy Mbavu...');
    
    await sql`
      INSERT INTO public.users (
        id, first_name, last_name, email, phone, password_hash, 
        role, status, membership_date, membership_number
      ) VALUES (
        gen_random_uuid(), 
        ${adminData.firstName}, 
        ${adminData.lastName}, 
        ${adminData.email}, 
        ${adminData.phone},
        ${passwordHash}, 
        ${adminData.role}, 
        'ACTIVE', 
        now(), 
        ${adminData.membershipNumber}
      )
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        status = 'ACTIVE',
        updated_at = now();
    `;

    console.log('✅ Admin injecté avec succès!');

    // Vérification
    const admin = await sql`
      SELECT id, first_name, last_name, email, role, status, membership_number
      FROM public.users 
      WHERE email = ${adminData.email};
    `;

    if (admin.length > 0) {
      console.log('');
      console.log('🎉 ═══════════════════════════════════════');
      console.log('   ADMIN CRÉÉ AVEC SUCCÈS');
      console.log('═══════════════════════════════════════════');
      console.log(`  👤 Nom      : ${admin[0].first_name} ${admin[0].last_name}`);
      console.log(`  📧 Email    : ${admin[0].email}`);
      console.log(`  🔐 Mot de passe : PapyM25`);
      console.log(`  🎯 Rôle     : ${admin[0].role}`);
      console.log(`  ✅ Statut   : ${admin[0].status}`);
      console.log(`  🔢 N° membre: ${admin[0].membership_number}`);
      console.log('═══════════════════════════════════════════');
    }

    await sql.end();
    console.log('🔌 Déconnexion de Supabase');
    
  } catch (err) {
    console.error('❌ Erreur:', err.message || err);
    try { await sql.end(); } catch {}
    process.exit(1);
  }
}

injectAdmin();
