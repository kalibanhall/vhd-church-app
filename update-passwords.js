const postgres = require('postgres')

const sql = postgres(process.env.DATABASE_URL || 'postgresql://postgres.lwmyferidfbzcnggddob:VhdChurch2025!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require'
})

async function updatePasswords() {
  try {
    // Hash correct pour "password"
    const correctHash = '$2a$12$U4yjaRi3H07JCteJdrQtSeILFIsvHc7HnpmZS6bBcBsfg5l9e9HDy'
    
    await sql`
      UPDATE users 
      SET password = ${correctHash}
      WHERE email IN ('admin@vhd.app', 'pasteur@vhd.app', 'membre@vhd.app')
    `
    
    console.log('✅ Mots de passe mis à jour!')
    
    // Vérification
    const users = await sql`
      SELECT email, name, role FROM users
    `
    
    console.log('📋 Utilisateurs dans la base:')
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name}) - ${user.role}`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error)
    process.exit(1)
  }
}

updatePasswords()