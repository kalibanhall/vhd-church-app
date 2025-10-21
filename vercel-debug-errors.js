/**
 * Diagnostic des erreurs de déploiement Vercel
 */

console.log('🚨 DIAGNOSTIC ERREURS VERCEL');
console.log('=' .repeat(60));

console.log('📋 ERREURS IDENTIFIÉES:');
console.log('');

console.log('1️⃣  ERREUR 401 - Token d\'authentification manquant');
console.log('   - L\'API /api/auth/me ne trouve pas de token');
console.log('   - Problème de JWT_SECRET ou de cookies');
console.log('   - AuthContext ne peut pas vérifier l\'utilisateur');
console.log('');

console.log('2️⃣  ERREUR 500 - API auth/login');
console.log('   - Erreur serveur lors de la connexion');
console.log('   - Probablement base de données non accessible');
console.log('   - Ou problème de variables d\'environnement');
console.log('');

console.log('3️⃣  ERREUR 404 - favicon.ico');
console.log('   - Erreur mineure, favicon manquant');
console.log('   - N\'affecte pas le fonctionnement');
console.log('');

console.log('🔧 ACTIONS CORRECTIVES:');
console.log('');

console.log('1️⃣  Vérifier DATABASE_URL dans Vercel');
console.log('   - Aller dans Environment Variables');
console.log('   - Confirmer que DATABASE_URL est exactement:');
console.log('   postgresql://postgres.yckqzuugkjzcemaxbwji:VhdChurch2025@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true');
console.log('');

console.log('2️⃣  Vérifier JWT_SECRET');
console.log('   - Doit être défini dans Vercel');
console.log('   - Valeur: vhd-church-app-chris-kasongo-jwt-secret-production-2025-qualis-super-secure-key');
console.log('');

console.log('3️⃣  Tester l\'initialisation');
console.log('   - Aller sur: https://vhd-church-app.vercel.app/api/init');
console.log('   - Doit créer Chris Kasongo automatiquement');
console.log('   - Si erreur 500, problème de base de données');
console.log('');

console.log('4️⃣  Vérifier les logs Vercel');
console.log('   - Functions tab dans Vercel Dashboard');
console.log('   - Voir les erreurs détaillées des API routes');
console.log('');

console.log('🧪 TESTS IMMÉDIATS:');
console.log('');

console.log('A) Test base de données:');
console.log('   curl https://vhd-church-app.vercel.app/api/init');
console.log('');

console.log('B) Test santé API:');
console.log('   curl https://vhd-church-app.vercel.app/api/health');
console.log('');

console.log('C) Test variables env:');
console.log('   curl https://vhd-church-app.vercel.app/api/debug/env');
console.log('');

console.log('💡 SOLUTION RAPIDE:');
console.log('1. Redéployer après avoir vérifié toutes les variables');
console.log('2. Tester /api/init en premier');
console.log('3. Si ça marche, l\'auth devrait suivre');
console.log('');

console.log('🔍 URL pour debug: https://vercel.com/kalibanhalls-projects/vhd-church-app/functions');
console.log('📞 On peut aussi créer une API de debug si besoin');