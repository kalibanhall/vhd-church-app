import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })
import { prisma } from '../../../../lib/prisma'
import { verifyAuthentication } from '../../../../lib/auth-middleware'

export async function GET(request: NextRequest) {
  const verification = await verifyAuthentication(request)
  
  if (!verification.success) {
    return NextResponse.json({ error: verification.error }, { status: verification.status || 401 })
  }

  try {
    const pastorsRes = await sql`
      SELECT id, first_name AS "firstName", last_name AS "lastName", email, phone, profile_image_url AS "profileImageUrl"
      FROM users
      WHERE role IN ('PASTOR', 'ADMIN') AND status = 'ACTIVE'
      ORDER BY first_name ASC
    `
    const pastors = pastorsRes;
    return NextResponse.json({ success: true, pastors })
  } catch (error) {
    console.error('Erreur récupération pasteurs:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des pasteurs' }, { status: 500 })
  }
}