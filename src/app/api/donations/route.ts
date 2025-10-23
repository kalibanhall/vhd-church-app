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
 * =============================================================================
 */

import { NextRequest, NextResponse } from 'next/server'

import jwt from 'jsonwebtoken'
import postgres from 'postgres'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' })

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any
    // Récupérer toutes les donations de l'utilisateur
    const donations = await sql`
      SELECT * FROM donations WHERE user_id = ${decoded.userId} ORDER BY donation_date DESC
    `
    return NextResponse.json({
      donations,
      total: donations.reduce((sum: number, d: any) => sum + Number(d.amount), 0)
    })
  } catch (error) {
    console.error('Erreur récupération donations:', error)
    return NextResponse.json({ error: 'Erreur serveur', details: error instanceof Error ? error.message : error }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const body = await request.json()
    const {
      amount,
      currency,
      donationType,
      paymentMethod,
      projectName,
      notes
    } = body

    // Validation stricte des champs
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Montant invalide ou manquant' }, { status: 400 })
    }
    if (!donationType || typeof donationType !== 'string') {
      return NextResponse.json({ error: 'Type de don manquant ou invalide' }, { status: 400 })
    }
    if (!paymentMethod || typeof paymentMethod !== 'string') {
      return NextResponse.json({ error: 'Méthode de paiement manquante ou invalide' }, { status: 400 })
    }

    // Récupérer l'id du projet si projetName fourni
    let projectId = null
    if (donationType === 'PROJECT' && projectName) {
      const project = await sql`
        SELECT id FROM donation_projects WHERE project_name = ${projectName} LIMIT 1
      `
      if (project.length > 0) projectId = project[0].id
    }
    const result = await sql`
      INSERT INTO donations (user_id, amount, donation_type, payment_method, project_id, notes, donation_date, status)
      VALUES (${decoded.userId}, ${amount}, ${donationType}, ${paymentMethod}, ${projectId}, ${notes}, NOW(), 'COMPLETED')
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error('Erreur création donation:', error)
    return NextResponse.json({ error: 'Erreur serveur', details: error instanceof Error ? error.message : error }, { status: 500 })
  }
}