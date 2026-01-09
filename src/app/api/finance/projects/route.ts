/**
 * API Routes - Fund Projects Management
 * 
 * GET  /api/finance/projects - Liste des projets de financement
 * POST /api/finance/projects - Créer un projet
 */

import { NextRequest, NextResponse } from 'next/server';
import { FundProjectService } from '@/lib/services/finance-service';

// Stockage temporaire
let projects: any[] = [];
let projectIdCounter = 1;

// Initialiser avec des projets de démonstration
if (projects.length === 0) {
  projects = [
    {
      id: `project_${projectIdCounter++}`,
      name: 'Rénovation du sanctuaire',
      description: 'Rénovation complète du sanctuaire incluant peinture, éclairage et système audio.',
      goalAmount: 50000,
      raisedAmount: 32500,
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      category: 'building',
      image: '/images/renovation.jpg',
      milestones: [
        { id: 'm1', title: 'Première phase - Peinture', targetAmount: 15000, reachedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'm2', title: 'Deuxième phase - Éclairage', targetAmount: 30000, reachedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 'm3', title: 'Troisième phase - Audio', targetAmount: 45000, reachedAt: null },
        { id: 'm4', title: 'Finalisation', targetAmount: 50000, reachedAt: null }
      ],
      donors: [
        { donorId: 'member_1', donorName: 'Jean Dupont', totalAmount: 5000, isAnonymous: false, lastDonation: new Date().toISOString() },
        { donorId: 'anon_1', donorName: 'Anonyme', totalAmount: 2500, isAnonymous: true, lastDonation: new Date().toISOString() }
      ],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: `project_${projectIdCounter++}`,
      name: 'Mission Afrique 2025',
      description: 'Voyage missionnaire au Cameroun pour l\'été 2025.',
      goalAmount: 25000,
      raisedAmount: 8500,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      category: 'mission',
      milestones: [
        { id: 'm1', title: 'Billets d\'avion', targetAmount: 10000, reachedAt: null },
        { id: 'm2', title: 'Hébergement', targetAmount: 18000, reachedAt: null },
        { id: 'm3', title: 'Équipement', targetAmount: 25000, reachedAt: null }
      ],
      donors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let filteredProjects = [...projects];

    if (status) {
      filteredProjects = filteredProjects.filter(p => p.status === status);
    }

    if (category) {
      filteredProjects = filteredProjects.filter(p => p.category === category);
    }

    // Ajouter les calculs de progression
    const projectsWithProgress = filteredProjects.map(project => ({
      ...project,
      progress: FundProjectService.calculateProgress(project),
      statusInfo: FundProjectService.getProjectStatus(project)
    }));

    // Trier par date de création (plus récent d'abord)
    projectsWithProgress.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: projectsWithProgress,
      total: projectsWithProgress.length,
      stats: {
        totalGoal: projects.reduce((sum, p) => sum + p.goalAmount, 0),
        totalRaised: projects.reduce((sum, p) => sum + p.raisedAmount, 0),
        activeProjects: projects.filter(p => p.status === 'active').length
      }
    });
  } catch (error) {
    console.error('[Projects GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, goalAmount, startDate, endDate, category, image, milestones } = body;

    if (!name || !goalAmount) {
      return NextResponse.json(
        { success: false, error: 'Nom et objectif financier sont requis' },
        { status: 400 }
      );
    }

    const newProject = {
      id: `project_${projectIdCounter++}`,
      name,
      description: description || '',
      goalAmount,
      raisedAmount: 0,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      status: 'planning',
      category: category || 'other',
      image: image || null,
      milestones: milestones || [],
      donors: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.push(newProject);

    return NextResponse.json({
      success: true,
      message: 'Projet créé avec succès',
      data: newProject
    }, { status: 201 });
  } catch (error) {
    console.error('[Projects POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}
