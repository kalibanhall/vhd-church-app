#!/bin/bash
# Script de build pour Vercel
# CHRIS NGOZULU KASONGO (KalibanHall)

echo "🔄 Génération du client Prisma..."
npx prisma generate

echo "🚀 Build de l'application Next.js..."
npx next build

echo "✅ Build terminé avec succès !"