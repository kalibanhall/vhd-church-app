/**
 * Checklist variables d'environnement Vercel
 */

console.log('✅ CHECKLIST VARIABLES VERCEL');
console.log('=' .repeat(60));

const requiredVars = [
  {
    name: 'DATABASE_URL',
    value: 'postgresql://postgres.yckqzuugkjzcemaxbwji:VhdChurch2025@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
    critical: true,
    description: 'URL Prisma pour Transaction Pooler'
  },
  {
    name: 'JWT_SECRET',
    value: 'vhd-church-app-chris-kasongo-jwt-secret-production-2025-qualis-super-secure-key',
    critical: true,
    description: 'Secret pour les tokens d\'authentification'
  },
  {
    name: 'NODE_ENV',
    value: 'production',
    critical: true,
    description: 'Mode de production'
  },
  {
    name: 'NEXTAUTH_URL',
    value: 'https://vhd-church-app.vercel.app',
    critical: true,
    description: 'URL de base pour l\'authentification'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    value: 'https://yckqzuugkjzcemaxbwji.supabase.co',
    critical: false,
    description: 'URL publique Supabase (pour client-side)'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlja3F6dXVna2p6Y2VtYXhid2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0MzQ1MzEsImV4cCI6MjA0NTAxMDUzMX0.LAOjYWks67USZjR7Hsudsuc',
    critical: false,
    description: 'Clé anonyme Supabase (pour client-side)'
  }
];

console.log('🔍 VARIABLES À VÉRIFIER DANS VERCEL:');
console.log('');

requiredVars.forEach((variable, index) => {
  const priority = variable.critical ? '🚨 CRITIQUE' : '📋 OPTIONNEL';
  console.log(`${index + 1}. ${variable.name} ${priority}`);
  console.log(`   📝 Valeur: ${variable.value.substring(0, 50)}...`);
  console.log(`   💡 Description: ${variable.description}`);
  console.log('');
});

console.log('🎯 PRIORITÉS DE VÉRIFICATION:');
console.log('');
console.log('1. DATABASE_URL → doit être exactement la valeur du Transaction Pooler');
console.log('2. JWT_SECRET → doit être défini pour l\'authentification');
console.log('3. NODE_ENV → doit être "production"');
console.log('4. NEXTAUTH_URL → doit pointer vers vhd-church-app.vercel.app');
console.log('');

console.log('🚨 ERREURS COMMUNES:');
console.log('- DATABASE_URL avec mauvais mot de passe');
console.log('- JWT_SECRET manquant ou vide');
console.log('- Espaces ou caractères invisibles dans les valeurs');
console.log('- Variables non définies pour "Production" environment');
console.log('');

console.log('🔧 APRÈS CORRECTION:');
console.log('1. Sauvegarder les variables');
console.log('2. Redéployer l\'application');
console.log('3. Tester /api/health puis /api/debug');
console.log('4. Tester /api/init pour Chris Kasongo');
console.log('');

console.log('💡 Si problème persiste:');
console.log('- Vérifier les logs dans Functions tab');
console.log('- Tester la connexion DB avec notre script de test');
console.log('- Considérer une nouvelle base Supabase si nécessaire');