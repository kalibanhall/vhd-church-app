/**
 * =============================================================================
 * SCRIPT DE MIGRATION AUTOMATIQUE - DÉVELOPPEMENT → PRODUCTION
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * 
 * Description: Détecte automatiquement l'environnement et applique le bon schema
 * - Développement: SQLite (schema.prisma)
 * - Production: PostgreSQL (schema-production.prisma)
 * 
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

// Fonction pour détecter l'environnement
function detectEnvironment() {
  const databaseUrl = process.env.DATABASE_URL || '';
  
  if (databaseUrl.includes('postgresql://') || databaseUrl.includes('postgres://')) {
    return 'production';
  } else if (databaseUrl.includes('file:') || databaseUrl.includes('.db')) {
    return 'development';
  } else if (process.env.NODE_ENV === 'production') {
    return 'production';
  } else {
    return 'development';
  }
}

// Fonction pour copier le bon schema
function setupSchema() {
  const environment = detectEnvironment();
  const sourceFile = environment === 'production' 
    ? './prisma/schema-production.prisma' 
    : './prisma/schema.prisma';
  
  console.log(`🔍 Environnement détecté: ${environment.toUpperCase()}`);
  console.log(`📋 DATABASE_URL: ${process.env.DATABASE_URL || 'Non définie'}`);
  
  if (environment === 'production') {
    console.log('🚀 Configuration pour PRODUCTION (PostgreSQL/Supabase)');
    console.log('   - Enums natifs PostgreSQL');
    console.log('   - Index optimisés pour les performances');
    console.log('   - Contraintes de données renforcées');
    
    // Vérifier que le schema de production existe
    if (!fs.existsSync('./prisma/schema-production.prisma')) {
      console.error('❌ Erreur: schema-production.prisma non trouvé!');
      console.log('💡 Assurez-vous que le fichier schema-production.prisma existe');
      process.exit(1);
    }
    
    // Copier le schema de production
    fs.copyFileSync('./prisma/schema-production.prisma', './prisma/schema.prisma');
    console.log('✅ Schema PostgreSQL activé pour la production');
    
  } else {
    console.log('🛠️ Configuration pour DÉVELOPPEMENT (SQLite)');
    console.log('   - Base de données locale SQLite');
    console.log('   - Schema simplifié pour le développement');
    console.log('✅ Schema SQLite déjà en place');
  }
}

// Fonction pour valider la configuration
function validateConfiguration() {
  const environment = detectEnvironment();
  
  if (environment === 'production') {
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET', 
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Variables d\'environnement manquantes pour la production:');
      missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.log('\n💡 Configurez ces variables dans votre plateforme de déploiement (Vercel/Netlify)');
      return false;
    }
    
    console.log('✅ Toutes les variables d\'environnement sont configurées');
  }
  
  return true;
}

// Exécution du script
try {
  console.log('🔧 Configuration automatique de l\'environnement...\n');
  
  setupSchema();
  
  if (validateConfiguration()) {
    console.log('\n🎯 Configuration terminée avec succès !');
    console.log('\n📋 Prochaines étapes:');
    
    if (detectEnvironment() === 'production') {
      console.log('1. npx prisma generate');
      console.log('2. npx prisma db push');
      console.log('3. npm run build');
      console.log('4. npm start');
    } else {
      console.log('1. npx prisma generate');
      console.log('2. npx prisma db push');
      console.log('3. npm run dev');
    }
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la configuration:', error.message);
  process.exit(1);
}

console.log('\n💡 Développé par CHRIS NGOZULU KASONGO (KalibanHall)');
console.log('🔗 GitHub: https://github.com/KalibanHall');