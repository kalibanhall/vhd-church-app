#!/usr/bin/env node

/**
 * Script de déploiement automatique pour Vercel
 * Gère la migration SQLite -> PostgreSQL
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 SCRIPT DE DÉPLOIEMENT VERCEL - VHD CHURCH APP');
console.log('='.repeat(50));

// 1. Sauvegarder le schema SQLite actuel
console.log('📁 Sauvegarde du schema SQLite...');
if (fs.existsSync('prisma/schema.prisma')) {
  fs.copyFileSync('prisma/schema.prisma', 'prisma/schema.sqlite.backup');
  console.log('✅ Schema SQLite sauvegardé');
}

// 2. Remplacer par le schema PostgreSQL pour production
console.log('🔄 Configuration schema PostgreSQL...');
if (fs.existsSync('prisma/schema.production.prisma')) {
  fs.copyFileSync('prisma/schema.production.prisma', 'prisma/schema.prisma');
  console.log('✅ Schema PostgreSQL configuré');
}

// 3. Commit et push vers GitHub
console.log('📤 Commit vers GitHub...');
try {
  // Ajouter le PATH Git si nécessaire
  const gitPath = 'C:\\Program Files\\Git\\cmd';
  process.env.PATH += ';' + gitPath;
  
  execSync('git add -A', { stdio: 'inherit' });
  execSync('git commit -m "DEPLOY: Migration PostgreSQL + corrections Prisma pour Vercel"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
  console.log('✅ Code poussé vers GitHub');
} catch (error) {
  console.log('⚠️  Erreur Git (peut-être rien à committer):', error.message);
}

// 4. Restaurer le schema SQLite pour le développement local
console.log('🔄 Restauration schema SQLite pour développement...');
if (fs.existsSync('prisma/schema.sqlite.backup')) {
  fs.copyFileSync('prisma/schema.sqlite.backup', 'prisma/schema.prisma');
  console.log('✅ Schema SQLite restauré');
}

console.log('\n' + '='.repeat(50));
console.log('🎯 DÉPLOIEMENT LANCÉ !');
console.log('');
console.log('📋 PROCHAINES ÉTAPES:');
console.log('1. ⏳ Attendre le déploiement Vercel (2-3 minutes)');
console.log('2. 🌐 Vérifier sur: https://vercel.com/dashboard');
console.log('3. 🧪 Tester sur: https://vhd-church-app-j29q-r88j7bdy2-kalibanhalls-projects.vercel.app');
console.log('4. 👤 Créer le premier admin: admin@vhd.app');
console.log('');
console.log('🎉 Le schema PostgreSQL sera automatiquement appliqué par Vercel !');
console.log('='.repeat(50));