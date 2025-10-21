/**
 * Test de toutes les variations possibles d'URL Supabase
 */

console.log('🔍 DIAGNOSTIC COMPLET URL SUPABASE');
console.log('=' .repeat(60));

// Variations d'URL à tester
const urlVariations = [
  // Format classique
  'postgresql://postgres:Qualis%402025@db.dvdlrkffaxmflmdywhru.supabase.co:5432/postgres',
  
  // Avec SSL
  'postgresql://postgres:Qualis%402025@db.dvdlrkffaxmflmdywhru.supabase.co:5432/postgres?sslmode=require',
  
  // Port 6543 (pooler)
  'postgresql://postgres:Qualis%402025@db.dvdlrkffaxmflmdywhru.supabase.co:6543/postgres',
  
  // Direct (sans pooler)
  'postgresql://postgres.dvdlrkffaxmflmdywhru:Qualis%402025@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  
  // Nouveau format Supabase v2
  'postgresql://postgres:Qualis%402025@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
];

console.log('📋 URLs à vérifier dans votre dashboard Supabase:');
console.log('');

urlVariations.forEach((url, index) => {
  console.log(`${index + 1}. ${url.replace(/:([^@%]+)(@|%40)/, ':****@')}`);
});

console.log('');
console.log('🎯 INSTRUCTIONS:');
console.log('1. Allez sur https://supabase.com/dashboard/project/dvdlrkffaxmflmdywhru/settings/database');
console.log('2. Trouvez la section "Connection string"');
console.log('3. Copiez exactement l\'URL PostgreSQL fournie');
console.log('4. Remplacez [YOUR-PASSWORD] par votre vrai mot de passe');
console.log('5. Utilisez cette URL exacte dans Vercel');
console.log('');

console.log('🔧 VÉRIFICATIONS IMPORTANTES:');
console.log('- Vérifiez que la base de données est bien créée');
console.log('- Vérifiez que vous n\'êtes pas en mode "pause"');
console.log('- Vérifiez les paramètres de connexion (pooler vs direct)');
console.log('- Vérifiez la région (eu-central-1, us-east-1, etc.)');
console.log('');

console.log('⚡ FORMAT ATTENDU:');
console.log('postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres');
console.log('');

console.log('🌐 Projet Supabase détecté: dvdlrkffaxmflmdywhru');
console.log('📍 URL dashboard: https://supabase.com/dashboard/project/dvdlrkffaxmflmdywhru');