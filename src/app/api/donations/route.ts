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
import { prisma } from '../../../lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Récupérer toutes les donations de l'utilisateur
    const donations = await prisma.donation.findMany({
      where: {
        userId: decoded.userId
      },
      orderBy: {
        donationDate: 'desc'
      }
    })

    return NextResponse.json({ 
      donations,
      total: donations.reduce((sum: number, d: any) => sum + d.amount, 0)
    })
  } catch (error) {
    console.error('Erreur récupération donations:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
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
      donationType,
      paymentMethod,
      projectId,
      notes
    } = body

    const newDonation = await prisma.donation.create({
      data: {
        amount: parseFloat(amount),
        donationType,
        paymentMethod,
        projectId: projectId || null,
        notes,
        userId: decoded.userId,
        donationDate: new Date(),
        status: 'COMPLETED'
      }
    })

    return NextResponse.json(newDonation, { status: 201 })
  } catch (error) {
    console.error('Erreur création donation:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}