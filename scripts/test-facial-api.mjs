#!/usr/bin/env node

/**
 * Script de test - API Routes Reconnaissance Faciale
 * Teste tous les endpoints de la Phase 4
 */

import http from 'http';

const API_BASE = 'http://localhost:3000';

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: body ? JSON.parse(body) : null
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoint(name, path, method = 'GET', data = null, expectedStatus = 200) {
  try {
    log(`\n  Testing: ${name}...`, 'blue');
    const result = await makeRequest(path, method, data);
    
    if (result.status === expectedStatus) {
      log(`  ✓ ${name} - Status ${result.status}`, 'green');
      return true;
    } else {
      log(`  ✗ ${name} - Expected ${expectedStatus}, got ${result.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`  ✗ ${name} - Error: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n🧪 Test des API Routes - Reconnaissance Faciale\n', 'yellow');
  
  const tests = [];
  
  // 1. Test Descriptors
  log('1️⃣  Descriptors API', 'yellow');
  tests.push(await testEndpoint(
    'GET /api/facial-recognition/descriptors',
    '/api/facial-recognition/descriptors?userId=test-user-id',
    'GET',
    null,
    200
  ));
  
  // 2. Test Verify
  log('\n2️⃣  Verify API', 'yellow');
  const mockDescriptor = Array(128).fill(0).map(() => Math.random());
  tests.push(await testEndpoint(
    'POST /api/facial-recognition/verify',
    '/api/facial-recognition/verify',
    'POST',
    { descriptor: mockDescriptor },
    200
  ));
  
  // 3. Test Sessions
  log('\n3️⃣  Sessions API', 'yellow');
  tests.push(await testEndpoint(
    'GET /api/facial-recognition/sessions',
    '/api/facial-recognition/sessions?status=ACTIVE',
    'GET',
    null,
    200
  ));
  
  // 4. Test Check-in
  log('\n4️⃣  Check-in API', 'yellow');
  tests.push(await testEndpoint(
    'GET /api/facial-recognition/check-in',
    '/api/facial-recognition/check-in/test-session-id',
    'GET',
    null,
    200
  ));
  
  // 5. Test Stats
  log('\n5️⃣  Stats API', 'yellow');
  tests.push(await testEndpoint(
    'GET /api/facial-recognition/stats',
    '/api/facial-recognition/stats?period=30',
    'GET',
    null,
    200
  ));
  
  // 6. Test Cameras
  log('\n6️⃣  Cameras API', 'yellow');
  tests.push(await testEndpoint(
    'GET /api/facial-recognition/cameras',
    '/api/facial-recognition/cameras',
    'GET',
    null,
    200
  ));
  
  // Résultats
  const passed = tests.filter(t => t).length;
  const total = tests.length;
  
  log('\n' + '='.repeat(50), 'yellow');
  log(`\n📊 Résultats: ${passed}/${total} tests passés`, passed === total ? 'green' : 'red');
  
  if (passed === total) {
    log('\n✅ Tous les tests API sont passés!', 'green');
    log('\n🎉 Backend reconnaissance faciale: FONCTIONNEL\n', 'green');
  } else {
    log(`\n⚠️  ${total - passed} test(s) échoué(s)`, 'red');
    log('\n💡 Vérifiez que le serveur Next.js est démarré (npm run dev)\n', 'yellow');
  }
}

// Vérifier si le serveur est accessible
async function checkServer() {
  try {
    await makeRequest('/', 'GET');
    return true;
  } catch {
    return false;
  }
}

// Exécuter les tests
(async () => {
  log('🔍 Vérification du serveur...', 'blue');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    log('\n❌ Serveur Next.js non accessible sur http://localhost:3000', 'red');
    log('💡 Démarrez le serveur avec: npm run dev\n', 'yellow');
    process.exit(1);
  }
  
  log('✓ Serveur accessible\n', 'green');
  
  await runTests();
})();
