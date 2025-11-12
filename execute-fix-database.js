/**
 * Script pour exécuter les correctifs SQL sur Supabase PostgreSQL
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration Supabase
const supabaseUrl = 'https://lwmyferidfbzcnggddob.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3bXlmZXJpZGZiemNuZ2dkZG9iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzgzNTY4NywiZXhwIjoyMDQzNDExNjg3fQ.vy5VQoN8Z3_YMhQFBUE3PwNbZPdQ-cP1RvCRsZyR3r0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile() {
  try {
    console.log('📝 Lecture du fichier SQL...');
    const sqlContent = fs.readFileSync(path.join(__dirname, 'fix-database.sql'), 'utf8');
    
    // Diviser en commandes individuelles
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--') && cmd !== 'COMMIT');

    console.log(`✅ ${commands.length} commandes SQL à exécuter\n`);

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      if (!cmd) continue;

      console.log(`🔄 Exécution commande ${i + 1}/${commands.length}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: cmd });
      
      if (error) {
        console.error(`❌ Erreur sur commande ${i + 1}:`, error.message);
        // Continuer quand même pour les autres commandes
      } else {
        console.log(`✅ Commande ${i + 1} exécutée avec succès`);
      }
    }

    console.log('\n🎉 Correctifs terminés!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

executeSQLFile();
