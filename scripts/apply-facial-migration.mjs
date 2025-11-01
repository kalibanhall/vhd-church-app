#!/usr/bin/env node

/**
 * Script de migration - Reconnaissance Faciale
 * Applique la migration 001_facial_recognition.sql sur Supabase
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Lire DATABASE_URL depuis .env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL\s*=\s*["']?([^"'\n]+)["']?/);

if (!dbUrlMatch) {
  console.error('❌ DATABASE_URL non trouvé dans .env');
  process.exit(1);
}

const DATABASE_URL = dbUrlMatch[1];

// Configuration PostgreSQL
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Début de la migration facial recognition...\n');
    
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '../database/migrations/001_facial_recognition.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Fichier SQL chargé:', sqlPath);
    console.log('📏 Taille:', sql.length, 'caractères\n');
    
    // Exécuter la migration dans une transaction
    await client.query('BEGIN');
    
    console.log('⚙️  Exécution de la migration...\n');
    await client.query(sql);
    
    await client.query('COMMIT');
    
    console.log('✅ Migration appliquée avec succès!\n');
    
    // Vérifier les tables créées
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('face_descriptors', 'attendance_sessions', 'check_ins', 'cameras')
      ORDER BY table_name;
    `);
    
    console.log('📋 Tables créées:');
    tablesResult.rows.forEach(row => {
      console.log('  ✓', row.table_name);
    });
    console.log('');
    
    // Vérifier les vues créées
    const viewsResult = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
        AND table_name IN ('member_attendance_stats', 'session_statistics')
      ORDER BY table_name;
    `);
    
    console.log('👁️  Vues créées:');
    viewsResult.rows.forEach(row => {
      console.log('  ✓', row.table_name);
    });
    console.log('');
    
    // Vérifier les triggers
    const triggersResult = await client.query(`
      SELECT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
        AND trigger_name LIKE '%facial%' OR trigger_name LIKE '%attendance%' OR trigger_name LIKE '%updated_at%'
      ORDER BY trigger_name;
    `);
    
    console.log('⚡ Triggers créés:');
    if (triggersResult.rows.length > 0) {
      triggersResult.rows.forEach(row => {
        console.log(`  ✓ ${row.trigger_name} sur ${row.event_object_table}`);
      });
    } else {
      console.log('  (Utiliser trigger natif updated_at de Supabase)');
    }
    console.log('');
    
    // Compter les index
    const indexesResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename IN ('face_descriptors', 'attendance_sessions', 'check_ins', 'cameras')
      ORDER BY indexname;
    `);
    
    console.log('🔍 Index créés:', indexesResult.rows.length);
    console.log('');
    
    console.log('🎉 Migration complète!\n');
    console.log('Prochaines étapes:');
    console.log('  1. Tester les API routes: npm run test:api');
    console.log('  2. Vérifier dans Supabase Dashboard: Table Editor');
    console.log('  3. Build Android app avec le modèle TFLite\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la migration:', error.message);
    console.error('\nDétails:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter la migration
runMigration().catch(err => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
