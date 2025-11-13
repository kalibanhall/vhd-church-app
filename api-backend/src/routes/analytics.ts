/**
 * Routes analytics - Statistiques admin
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

/**
 * GET /analytics - Récupérer les statistiques complètes
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    console.log('📊 Récupération des analytics');

    // Dates pour les calculs
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 1. Statistiques des membres
    const { count: totalMembers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE');

    const { count: newMembersThisMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE')
      .gte('created_at', startOfMonth.toISOString());

    const { count: newMembersLastMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACTIVE')
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfMonth.toISOString());

    // 2. Statistiques des donations
    const { data: donationsThisMonth } = await supabase
      .from('donations')
      .select('amount')
      .gte('created_at', startOfMonth.toISOString());

    const totalDonationsThisMonth = donationsThisMonth?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

    const { data: donationsLastMonth } = await supabase
      .from('donations')
      .select('amount')
      .gte('created_at', startOfLastMonth.toISOString())
      .lt('created_at', startOfMonth.toISOString());

    const totalDonationsLastMonth = donationsLastMonth?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

    const { data: donationsThisYear } = await supabase
      .from('donations')
      .select('amount')
      .gte('created_at', startOfYear.toISOString());

    const totalDonationsThisYear = donationsThisYear?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

    // 3. Statistiques des prières
    const { count: totalPrayers } = await supabase
      .from('prayers')
      .select('*', { count: 'exact', head: true });

    const { count: prayersThisMonth } = await supabase
      .from('prayers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // 4. Statistiques des témoignages
    const { count: totalTestimonies } = await supabase
      .from('testimonies')
      .select('*', { count: 'exact', head: true });

    const { count: testimoniesThisMonth } = await supabase
      .from('testimonies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // 5. Statistiques des rendez-vous
    const { count: totalAppointments } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    const { count: appointmentsThisMonth } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Calcul des croissances
    const memberGrowth = newMembersLastMonth > 0 
      ? ((newMembersThisMonth || 0) - newMembersLastMonth) / newMembersLastMonth * 100 
      : 0;

    const donationGrowth = totalDonationsLastMonth > 0
      ? (totalDonationsThisMonth - totalDonationsLastMonth) / totalDonationsLastMonth * 100
      : 0;

    res.json({
      success: true,
      data: {
        members: {
          total: totalMembers || 0,
          newThisMonth: newMembersThisMonth || 0,
          newLastMonth: newMembersLastMonth || 0,
          growth: Math.round(memberGrowth * 10) / 10
        },
        donations: {
          totalThisMonth: totalDonationsThisMonth,
          totalLastMonth: totalDonationsLastMonth,
          totalThisYear: totalDonationsThisYear,
          growth: Math.round(donationGrowth * 10) / 10,
          count: donationsThisMonth?.length || 0
        },
        prayers: {
          total: totalPrayers || 0,
          thisMonth: prayersThisMonth || 0
        },
        testimonies: {
          total: totalTestimonies || 0,
          thisMonth: testimoniesThisMonth || 0
        },
        appointments: {
          total: totalAppointments || 0,
          thisMonth: appointmentsThisMonth || 0
        },
        engagement: {
          activeUsers: totalMembers || 0,
          rate: totalMembers ? Math.round((newMembersThisMonth || 0) / totalMembers * 100) : 0
        }
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;

