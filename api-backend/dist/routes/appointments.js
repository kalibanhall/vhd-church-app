"use strict";
/**
 * Routes rendez-vous (appointments)
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("@supabase/supabase-js");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Initialize Supabase client
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');
/**
 * GET /appointments - Récupérer tous les rendez-vous (ADMIN/PASTOR)
 */
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const authUser = req.user;
        // Vérifier les permissions
        if (authUser.role !== 'ADMIN' && authUser.role !== 'PASTOR') {
            return res.status(403).json({
                success: false,
                error: 'Accès réservé aux administrateurs et pasteurs'
            });
        }
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select(`
        *,
        user:users!user_id (
          id,
          first_name,
          last_name,
          email
        ),
        pastor:users!pastor_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
            .order('appointment_date', { ascending: true });
        if (error) {
            console.error('❌ Erreur récupération rendez-vous:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des rendez-vous'
            });
        }
        res.json({
            success: true,
            data: appointments || []
        });
    }
    catch (error) {
        console.error('❌ Erreur serveur:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur serveur'
        });
    }
});
/**
 * GET /appointments/member - Récupérer les rendez-vous d'un membre
 */
router.get('/member', auth_1.authenticate, async (req, res) => {
    try {
        const authUser = req.user;
        const { data: appointments, error } = await supabase
            .from('appointments')
            .select(`
        *,
        pastor:users!pastor_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
            .eq('user_id', authUser.id)
            .order('appointment_date', { ascending: true });
        if (error) {
            console.error('❌ Erreur récupération rendez-vous membre:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des rendez-vous'
            });
        }
        res.json({
            success: true,
            appointments: appointments || []
        });
    }
    catch (error) {
        console.error('❌ Erreur serveur:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur serveur'
        });
    }
});
/**
 * POST /appointments - Créer un rendez-vous
 */
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const authUser = req.user;
        const { pastorId, appointmentDate, startTime, endTime, reason } = req.body;
        const { data: appointment, error } = await supabase
            .from('appointments')
            .insert([{
                user_id: authUser.id,
                pastor_id: pastorId,
                appointment_date: appointmentDate,
                start_time: startTime,
                end_time: endTime,
                reason,
                status: 'PENDING',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        if (error) {
            console.error('❌ Erreur création rendez-vous:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la création du rendez-vous'
            });
        }
        res.status(201).json({
            success: true,
            data: appointment
        });
    }
    catch (error) {
        console.error('❌ Erreur serveur:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur serveur'
        });
    }
});
exports.default = router;
//# sourceMappingURL=appointments.js.map