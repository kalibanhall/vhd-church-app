/**
 * Test avec Transaction Pooler Supabase (IPv4 compatible)
 */

import postgres from 'postgres';

async function testTransactionPooler() {
  console.log('🎯 TEST TRANSACTION POOLER SUPABASE');
  console.log('=' .repeat(60));
  
  // URL du Transaction Pooler avec les deux mots de passe possibles
  const passwords = ['VhdChurch2025', 'Masonngozulu2025'];
  
  for (const password of passwords) {
    const poolerUrl = `postgresql://postgres.yckqzuugkjzcemaxbwji:${password}@aws-1-eu-west-2.pooler.supabase.com:6543/postgres`;
    
    console.log(`\n🔑 Test avec mot de passe: ${password}`);
    console.log('🌐 URL Pooler:', poolerUrl.replace(/:([^@]+)@/, ':****@'));
    console.log('📍 Port: 6543 (Transaction Pooler)');
    console.log('✅ IPv4 Compatible: OUI');
    
    try {
      console.log('🔗 Connexion au pooler...');
      
      const sql = postgres(poolerUrl, {
        ssl: 'require',
        max: 5,
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: false // Important pour le pooler
      });
      
      // Test de connectivité de base
      console.log('⏳ Test de connectivité...');
      const result = await sql`SELECT NOW() as server_time, current_database() as db_name`;
      
      console.log('✅ CONNEXION POOLER RÉUSSIE !');
      console.log('⏰ Heure serveur:', result[0].server_time);
      console.log('🗄️  Base de données:', result[0].db_name);
      
      // Test des permissions
      console.log('\n🔐 Test des permissions...');
      const permissions = await sql`
        SELECT 
          current_user as user_name,
          has_database_privilege(current_user, current_database(), 'CREATE') as can_create,
          has_database_privilege(current_user, current_database(), 'CONNECT') as can_connect
      `;
      
      console.log('👤 Utilisateur:', permissions[0].user_name);
      console.log('🔧 Peut créer:', permissions[0].can_create ? '✅' : '❌');
      console.log('🔌 Peut connecter:', permissions[0].can_connect ? '✅' : '❌');
      
      // Test de création de schéma VHD Church
      console.log('\n🛠️  Test création schéma VHD Church...');
      
      // Table utilisateurs pour VHD Church
      await sql`
        CREATE TABLE IF NOT EXISTS vhd_users_pooler_test (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          role VARCHAR(20) DEFAULT 'FIDELE',
          status VARCHAR(20) DEFAULT 'ACTIVE',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          CONSTRAINT check_role CHECK (role IN ('ADMIN', 'PASTOR', 'FIDELE')),
          CONSTRAINT check_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING'))
        )
      `;
      
      console.log('✅ Table utilisateurs créée');
      
      // Insertion de Chris Kasongo (admin intégré)
      const adminHash = '$2a$10$example.hash.for.test'; // Hash fictif
      
      await sql`
        INSERT INTO vhd_users_pooler_test (
          email, password_hash, first_name, last_name, phone, role, status
        ) VALUES (
          'admin@vhd.app', ${adminHash}, 'Chris', 'Kasongo', '+243000000000', 'ADMIN', 'ACTIVE'
        ) 
        ON CONFLICT (email) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          role = EXCLUDED.role,
          updated_at = NOW()
      `;
      
      console.log('✅ Admin Chris Kasongo inséré');
      
      // Vérification de l'admin
      const admin = await sql`
        SELECT id, email, first_name, last_name, role, status, created_at
        FROM vhd_users_pooler_test 
        WHERE email = 'admin@vhd.app'
      `;
      
      if (admin.length > 0) {
        console.log('✅ Admin vérifié:');
        console.log(`   👤 ${admin[0].first_name} ${admin[0].last_name}`);
        console.log(`   📧 ${admin[0].email}`);
        console.log(`   🎯 ${admin[0].role} (${admin[0].status})`);
        console.log(`   📅 Créé: ${admin[0].created_at}`);
      }
      
      // Test de table pour les événements (sermons, etc.)
      await sql`
        CREATE TABLE IF NOT EXISTS vhd_events_pooler_test (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          event_type VARCHAR(50) DEFAULT 'SERMON',
          event_date TIMESTAMP NOT NULL,
          created_by INTEGER REFERENCES vhd_users_pooler_test(id),
          status VARCHAR(20) DEFAULT 'PLANNED',
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      console.log('✅ Table événements créée');
      
      // Insertion d'un sermon test
      await sql`
        INSERT INTO vhd_events_pooler_test (
          title, description, event_type, event_date, created_by, status
        ) VALUES (
          'Sermon d''inauguration', 
          'Premier sermon sur la nouvelle plateforme VHD Church', 
          'SERMON', 
          NOW() + INTERVAL '7 days',
          ${admin[0].id},
          'PLANNED'
        )
      `;
      
      console.log('✅ Sermon test créé');
      
      // Statistiques finales
      const stats = await sql`
        SELECT 
          (SELECT COUNT(*) FROM vhd_users_pooler_test) as total_users,
          (SELECT COUNT(*) FROM vhd_events_pooler_test) as total_events,
          (SELECT COUNT(*) FROM vhd_users_pooler_test WHERE role = 'ADMIN') as admin_count
      `;
      
      console.log('\n📊 Statistiques de test:');
      console.log(`   👥 Utilisateurs: ${stats[0].total_users}`);
      console.log(`   📅 Événements: ${stats[0].total_events}`);
      console.log(`   👑 Admins: ${stats[0].admin_count}`);
      
      // Nettoyage
      await sql`DROP TABLE IF EXISTS vhd_events_pooler_test`;
      await sql`DROP TABLE IF EXISTS vhd_users_pooler_test`;
      console.log('✅ Tables test supprimées');
      
      // Fermeture propre
      await sql.end();
      console.log('✅ Connexion fermée');
      
      console.log('\n🎉 TRANSACTION POOLER PARFAITEMENT FONCTIONNEL !');
      console.log('🚀 Prêt pour la production avec Chris Kasongo !');
      
      return poolerUrl;
      
    } catch (error) {
      console.log(`❌ Erreur avec ${password}:`, error.message.substring(0, 100) + '...');
      
      if (error.message.includes('password authentication failed')) {
        console.log('🔑 Problème de mot de passe, test du suivant...');
        continue;
      } else {
        console.log('🔍 Erreur de connexion/réseau');
      }
    }
  }
  
  console.log('\n❌ Aucun mot de passe ne fonctionne');
  console.log('💡 Vérifiez le mot de passe dans Supabase Dashboard');
  return null;
}

console.log('⏳ Test du Transaction Pooler en cours...');
testTransactionPooler()
  .then(workingUrl => {
    if (workingUrl) {
      console.log('\n' + '=' .repeat(60));
      console.log('🎯 SUCCÈS - CONFIGURATION FINALE');
      console.log('=' .repeat(60));
      console.log('✅ Transaction Pooler opérationnel');
      console.log('✅ IPv4 compatible');
      console.log('✅ Chris Kasongo prêt');
      console.log('✅ Schéma VHD Church validé');
      console.log('\n🔧 URL pour Vercel:');
      console.log(workingUrl);
      console.log('\n🚀 PROCHAINES ÉTAPES:');
      console.log('1. Mettre à jour DATABASE_URL dans Vercel');
      console.log('2. Redéployer l\'application');
      console.log('3. Tester /api/init pour Chris Kasongo');
      console.log('4. Application VHD Church en production !');
    } else {
      console.log('\n❌ Problème de mot de passe - réinitialisez dans Supabase');
    }
  })
  .catch(error => {
    console.log('💥 Erreur globale:', error.message);
  });