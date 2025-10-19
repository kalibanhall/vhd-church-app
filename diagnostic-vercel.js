/**
 * Script de diagnostic complet pour Vercel
 * Teste tous les endpoints et identifie les problèmes
 */

const PRODUCTION_URL = 'https://vhd-church-app-j29q-r88j7bdy2-kalibanhalls-projects.vercel.app';

async function diagnosticComplet() {
  console.log('🔍 DIAGNOSTIC COMPLET VERCEL');
  console.log('=' .repeat(50));
  
  const endpoints = [
    '/',
    '/auth',
    '/api/auth/me',
    '/api/auth/register',
    '/api/auth/login'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🧪 Test: ${endpoint}`);
      console.log('-'.repeat(30));
      
      const response = await fetch(`${PRODUCTION_URL}${endpoint}`, {
        method: endpoint.includes('/api/') ? 'GET' : 'GET',
        headers: {
          'Accept': 'application/json, text/html',
          'User-Agent': 'VHD-Diagnostic/1.0'
        }
      });
      
      console.log(`📊 Statut: ${response.status} ${response.statusText}`);
      console.log(`📋 Content-Type: ${response.headers.get('content-type')}`);
      
      if (response.headers.get('content-type')?.includes('application/json')) {
        try {
          const data = await response.json();
          console.log(`📦 Réponse JSON:`, data);
        } catch (e) {
          console.log(`❌ Erreur parsing JSON:`, e.message);
        }
      } else if (response.headers.get('content-type')?.includes('text/html')) {
        const text = await response.text();
        const preview = text.substring(0, 200);
        console.log(`📄 HTML Preview:`, preview + '...');
        
        if (text.includes('Application error')) {
          console.log('🚨 ERREUR APPLICATION DÉTECTÉE');
        }
        if (text.includes('Build failed')) {
          console.log('🚨 ERREUR BUILD DÉTECTÉE');
        }
        if (text.includes('404')) {
          console.log('🚨 PAGE NON TROUVÉE');
        }
      }
      
      if (response.status >= 500) {
        console.log('🔥 ERREUR SERVEUR - Problème de déploiement probable');
      }
      
    } catch (error) {
      console.log(`💥 ERREUR RÉSEAU: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 RÉSUMÉ DU DIAGNOSTIC');
  console.log('='.repeat(50));
  console.log('');
  console.log('💡 SOLUTIONS POSSIBLES:');
  console.log('1. 🔄 Déploiement Vercel encore en cours (attendre 2-3 min)');
  console.log('2. 🚨 Erreur de build (vérifier logs Vercel)');
  console.log('3. 🗄️ Problème base de données (env variables)');
  console.log('4. 📦 Problème dépendances (package.json)');
  console.log('');
  console.log('🎯 Actions recommandées:');
  console.log('- Vérifier dashboard Vercel pour les logs d\'erreur');
  console.log('- Vérifier les variables d\'environnement (DATABASE_URL, JWT_SECRET)');
  console.log('- Si build ok, tester inscription manuelle via navigateur');
}

async function testConnectiviteBasique() {
  console.log('\n🌐 TEST CONNECTIVITÉ BASIQUE');
  console.log('-'.repeat(30));
  
  try {
    const start = Date.now();
    const response = await fetch(PRODUCTION_URL, { 
      method: 'HEAD',
      timeout: 10000 
    });
    const duration = Date.now() - start;
    
    console.log(`✅ Serveur accessible en ${duration}ms`);
    console.log(`📊 Statut: ${response.status}`);
    console.log(`🌍 Server: ${response.headers.get('server') || 'Inconnu'}`);
    console.log(`🕒 Date: ${response.headers.get('date')}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Serveur inaccessible: ${error.message}`);
    return false;
  }
}

async function main() {
  await testConnectiviteBasique();
  await diagnosticComplet();
}

main().catch(console.error);