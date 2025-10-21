/**
 * Test avec la nouvelle base Supabase et le package postgres
 */

import postgres from 'postgres';

async function testNewSupabase() {
  console.log('🚀 TEST NOUVELLE BASE SUPABASE AVEC POSTGRES');
  console.log('=' .repeat(60));
  
  // Nouvelle URL avec le mot de passe VhdChurch2025 (recommandé) ou Masonngozulu2025
  const databaseUrl = 'postgresql://postgres:VhdChurch2025@db.yckqzuugkjzcemaxbwji.supabase.co:5432/postgres';
  
  console.log('🌐 Nouvelle URL:', databaseUrl.replace(/:([^@]+)@/, ':****@'));
  console.log('');
  
  try {
    console.log('🔗 Connexion avec postgres package...');
    
    const sql = postgres(databaseUrl, {
      ssl: 'require',
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10
    });
    
    // Test de connectivité
    console.log('⏳ Test de connectivité...');
    const result = await sql`SELECT NOW() as server_time, version() as pg_version`;
    
    console.log('✅ CONNEXION RÉUSSIE !');
    console.log('⏰ Heure serveur:', result[0].server_time);
    console.log('🗄️  PostgreSQL:', result[0].pg_version.substring(0, 50) + '...');
    
    // Test des permissions et informations de base
    console.log('\n🔐 Test des permissions...');
    const dbInfo = await sql`
      SELECT 
        current_user as user_name,
        current_database() as database_name,
        has_database_privilege(current_user, current_database(), 'CREATE') as can_create,
        has_database_privilege(current_user, current_database(), 'CONNECT') as can_connect
    `;
    
    console.log('👤 Utilisateur:', dbInfo[0].user_name);
    console.log('🗄️  Base:', dbInfo[0].database_name);
    console.log('🔧 Peut créer:', dbInfo[0].can_create ? '✅' : '❌');
    console.log('🔌 Peut connecter:', dbInfo[0].can_connect ? '✅' : '❌');
    
    // Test de création de schéma pour VHD Church
    console.log('\n🛠️  Test création schéma VHD Church...');
    
    // Création table utilisateurs (comme dans notre schéma Prisma)
    await sql`
      CREATE TABLE IF NOT EXISTS vhd_users_test (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'FIDELE' CHECK (role IN ('ADMIN', 'PASTOR', 'FIDELE')),
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ Table utilisateurs créée');
    
    // Insert de Chris Kasongo (admin intégré)
    const adminPassword = '$2a$10$example.hash.for.Qualis@2025'; // Hash fictif pour le test
    
    await sql`
      INSERT INTO vhd_users_test (
        email, password_hash, first_name, last_name, phone, role, status
      ) VALUES (
        'admin@vhd.app', ${adminPassword}, 'Chris', 'Kasongo', '+243000000000', 'ADMIN', 'ACTIVE'
      ) 
      ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role,
        updated_at = NOW()
    `;
    
    console.log('✅ Admin Chris Kasongo inséré/mis à jour');
    
    // Vérification de l'admin
    const admin = await sql`
      SELECT id, email, first_name, last_name, role, status, created_at
      FROM vhd_users_test 
      WHERE email = 'admin@vhd.app'
    `;
    
    if (admin.length > 0) {
      console.log('✅ Admin vérifié:');
      console.log(`   👤 ${admin[0].first_name} ${admin[0].last_name}`);
      console.log(`   📧 ${admin[0].email}`);
      console.log(`   🎯 ${admin[0].role} (${admin[0].status})`);
      console.log(`   📅 Créé: ${admin[0].created_at}`);
    }
    
    // Test d'une requête plus complexe
    console.log('\n📊 Test requête complexe...');
    const stats = await sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'ADMIN') as admin_count,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_count
      FROM vhd_users_test
    `;
    
    console.log('📈 Statistiques:');
    console.log(`   👥 Total utilisateurs: ${stats[0].total_users}`);
    console.log(`   👑 Administrateurs: ${stats[0].admin_count}`);
    console.log(`   ✅ Actifs: ${stats[0].active_count}`);
    
    // Nettoyage
    await sql`DROP TABLE vhd_users_test`;
    console.log('✅ Table test supprimée');
    
    // Fermeture de la connexion
    await sql.end();
    console.log('✅ Connexion fermée');
    
    console.log('\n🎉 NOUVELLE BASE SUPABASE PARFAITEMENT FONCTIONNELLE !');
    return databaseUrl;
    
  } catch (error) {
    console.log('❌ ERREUR:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔑 Problème de mot de passe. Essayons avec Masonngozulu2025...');
      
      // Test avec l'autre mot de passe
      const altUrl = 'postgresql://postgres:Masonngozulu2025@db.yckqzuugkjzcemaxbwji.supabase.co:5432/postgres';
      return await testWithAlternativePassword(altUrl);
    }
    
    return null;
  }
}

async function testWithAlternativePassword(altUrl) {
  console.log('🔄 Test avec mot de passe alternatif...');
  
  try {
    const sql = postgres(altUrl, { ssl: 'require', max: 1 });
    const result = await sql`SELECT NOW() as test_time`;
    await sql.end();
    
    console.log('✅ Connexion alternative réussie !');
    return altUrl;
    
  } catch (error) {
    console.log('❌ Échec avec les deux mots de passe');
    console.log('💡 Suggestions:');
    console.log('1. Vérifiez le mot de passe dans Supabase Dashboard');
    console.log('2. Essayez de reset le mot de passe vers: VhdChurch2025');
    console.log('3. Vérifiez que la base est bien active (pas en pause)');
    return null;
  }
}

console.log('⏳ Démarrage du test...');
testNewSupabase()
  .then(workingUrl => {
    if (workingUrl) {
      console.log('\n' + '=' .repeat(60));
      console.log('🎯 SUCCÈS - PROCHAINES ÉTAPES');
      console.log('=' .repeat(60));
      console.log('1. ✅ Base Supabase opérationnelle');
      console.log('2. 🔄 Mettre à jour DATABASE_URL dans Vercel');
      console.log('3. 🚀 Redéployer avec Chris Kasongo intégré');
      console.log('4. 🧪 Tester l\'application finale');
      console.log('\n🔧 URL pour Vercel:');
      console.log(workingUrl);
    } else {
      console.log('\n❌ Problème de connexion - assistance nécessaire');
    }
  })
  .catch(error => {
    console.log('💥 Erreur globale:', error.message);
  });