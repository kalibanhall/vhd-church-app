/**
 * Guide d'aide pour configuration Supabase + Vercel
 */

console.log('🗄️ GUIDE CONFIGURATION SUPABASE + VERCEL');
console.log('=' .repeat(60));

console.log('\n📋 ÉTAPE 1: RÉCUPÉRER URL SUPABASE');
console.log('-'.repeat(40));
console.log('1. 📍 Dans Supabase Dashboard');
console.log('2. 🔧 Settings → Database');
console.log('3. 📋 Section "Connection string"');
console.log('4. 📝 Copier l\'URI (postgresql://postgres.xxx...)');
console.log('5. 🔑 Remplacer [YOUR-PASSWORD] par votre mot de passe');

console.log('\n📋 ÉTAPE 2: CONFIGURER VERCEL');
console.log('-'.repeat(40));
console.log('1. 🌐 Aller sur: https://vercel.com/dashboard');
console.log('2. 📂 Sélectionner votre projet "vhd-church-app"'); 
console.log('3. ⚙️ Settings → Environment Variables');
console.log('4. ➕ Add new variable:');
console.log('   - Name: DATABASE_URL');
console.log('   - Value: [Votre URL Supabase complète]');
console.log('   - Environment: Production');
console.log('5. 💾 Save');

console.log('\n📋 ÉTAPE 3: REDÉPLOIEMENT AUTOMATIQUE');
console.log('-'.repeat(40));
console.log('1. ⏳ Vercel redéploie automatiquement (1-2 min)');
console.log('2. 🗄️ Le schéma PostgreSQL sera créé automatiquement');
console.log('3. 🧪 Tester: https://votre-url.vercel.app/api/init');

console.log('\n📋 EXEMPLE D\'URL SUPABASE:');
console.log('-'.repeat(40));
console.log('🔗 Format: postgresql://postgres.PROJECT_ID:PASSWORD@HOST:5432/postgres');
console.log('📝 Exemple: postgresql://postgres.abcd1234:MonMotDePasse123@db-xxx.supabase.co:5432/postgres');

console.log('\n🚀 VARIABLES VERCEL RECOMMANDÉES:');
console.log('-'.repeat(40));
console.log('DATABASE_URL = postgresql://postgres.xxx...');
console.log('JWT_SECRET = une-cle-secrete-longue-et-securisee');
console.log('NODE_ENV = production');
console.log('NEXTAUTH_URL = https://votre-url.vercel.app');

console.log('\n✅ APRÈS CONFIGURATION:');
console.log('-'.repeat(40));
console.log('1. 🗄️ Tables créées automatiquement dans Supabase');
console.log('2. 🔧 /api/init disponible pour initialiser l\'admin');
console.log('3. 👤 Chris Kasongo créé avec admin@vhd.app / Qualis@2025');

console.log('\n' + '='.repeat(60));
console.log('🎯 PRÊT À CONFIGURER VERCEL ?');
console.log('Donnez-moi votre URL Supabase et je vous aide pour les variables !');
console.log('=' .repeat(60));