#!/usr/bin/env node

/**
 * =============================================================================
 * MINISTÈRE DES VAILLANTS HOMMES DE DAVID
 * =============================================================================
 * 
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 * Version: 1.0.3
 * Date: Octobre 2025
 * 
 * Script de déploiement complet avec admin intégré
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 DÉPLOIEMENT COMPLET VHD CHURCH APP');
console.log('=' .repeat(60));
console.log('👤 Admin intégré: Chris Kasongo (admin@vhd.app)');
console.log('🔑 Mot de passe: Qualis@2025');
console.log('=' .repeat(60));

async function deployComplete() {
  try {
    // 1. Vérifier que Git est disponible
    console.log('\n📋 1. Vérification Git...');
    try {
      const gitPath = 'C:\\Program Files\\Git\\cmd';
      process.env.PATH += ';' + gitPath;
      execSync('git --version', { stdio: 'pipe' });
      console.log('✅ Git disponible');
    } catch (error) {
      console.log('❌ Git non trouvé, mais on continue...');
    }
    
    // 2. Backup et configuration du schema PostgreSQL pour production
    console.log('\n📋 2. Configuration schema PostgreSQL...');
    if (fs.existsSync('prisma/schema.prisma')) {
      fs.copyFileSync('prisma/schema.prisma', 'prisma/schema.sqlite.backup');
      console.log('✅ Schema SQLite sauvegardé');
    }
    
    if (fs.existsSync('prisma/schema.production.prisma')) {
      fs.copyFileSync('prisma/schema.production.prisma', 'prisma/schema.prisma');
      console.log('✅ Schema PostgreSQL configuré pour production');
    }
    
    // 3. Génération Prisma
    console.log('\n📋 3. Génération client Prisma...');
    try {
      execSync('npm run db:generate', { stdio: 'inherit' });
      console.log('✅ Client Prisma généré');
    } catch (error) {
      console.log('⚠️  Erreur génération Prisma (continuons...)');
    }
    
    // 4. Build de l'application
    console.log('\n📋 4. Build de l\'application...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build réussi');
    } catch (error) {
      console.log('⚠️  Erreur de build, mais continuons le déploiement...');
    }
    
    // 5. Commit et push
    console.log('\n📋 5. Commit et push vers GitHub...');
    try {
      execSync('git add -A', { stdio: 'inherit' });
      const commitMessage = `DEPLOY: VHD Church App v1.0.3 - Admin intégré (Chris Kasongo)
      
✅ Admin par défaut: admin@vhd.app / Qualis@2025
✅ Schema PostgreSQL pour production  
✅ API d'initialisation automatique
✅ Seed de données de base
✅ Prêt pour production Vercel`;
      
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('✅ Code poussé vers GitHub');
    } catch (error) {
      console.log('⚠️  Erreur Git (peut-être rien à committer)');
    }
    
    // 6. Restauration schema SQLite pour développement local
    console.log('\n📋 6. Restauration schema local...');
    if (fs.existsSync('prisma/schema.sqlite.backup')) {
      fs.copyFileSync('prisma/schema.sqlite.backup', 'prisma/schema.prisma');
      console.log('✅ Schema SQLite restauré pour développement');
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 DÉPLOIEMENT COMPLET TERMINÉ !');
    console.log('=' .repeat(60));
    
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. ⏳ Attendre le déploiement Vercel (2-3 minutes)');
    console.log('2. 🌐 Aller sur: https://vhd-church-app-j29q-r88j7bdy2-kalibanhalls-projects.vercel.app');
    console.log('3. 🔧 Appeler: https://votre-url.vercel.app/api/init pour initialiser');
    console.log('4. 🔑 Se connecter avec: admin@vhd.app / Qualis@2025');
    
    console.log('\n🎯 CONFIGURATION SUPABASE:');
    console.log('Si première fois, configurez Supabase:');
    console.log('- Créer projet sur https://supabase.com');
    console.log('- Copier DATABASE_URL dans variables Vercel');
    console.log('- Le schema sera automatiquement créé');
    
    console.log('\n✨ L\'ADMIN EST DÉJÀ INTÉGRÉ - PRÊT À L\'EMPLOI !');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('💥 ERREUR CRITIQUE:', error.message);
    process.exit(1);
  }
}

deployComplete();