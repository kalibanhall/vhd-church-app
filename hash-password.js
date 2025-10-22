const bcrypt = require('bcryptjs')

async function hashPassword() {
  const password = 'password'
  const hashedPassword = await bcrypt.hash(password, 12)
  console.log(`Password: ${password}`)
  console.log(`Hashed: ${hashedPassword}`)
  
  // Test
  const isValid = await bcrypt.compare(password, hashedPassword)
  console.log(`Valid: ${isValid}`)
}

hashPassword().catch(console.error)