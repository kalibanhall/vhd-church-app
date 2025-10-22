const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Initialisation de la base de données PostgreSQL...');

// Vérifier si pg est installé
try {
  require('pg');
  console.log('✅ Module pg détecté');
} catch (error) {
  console.log('📦 Installation du module pg...');
  execSync('npm install pg', { stdio: 'inherit' });
  console.log('✅ Module pg installé');
}

// Exécuter le script d'initialisation
try {
  const initScript = path.join(__dirname, 'init-database-direct.js');
  console.log('🔧 Exécution du script d\'initialisation...');
  execSync(`node "${initScript}"`, { stdio: 'inherit' });
  console.log('🎉 Base de données initialisée avec succès !');
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation:', error.message);
  process.exit(1);
}