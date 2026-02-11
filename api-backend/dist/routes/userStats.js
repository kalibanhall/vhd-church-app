"use strict";
/**
 * @fileoverview Route pour récupérer les statistiques d'un utilisateur
 * @author MyChurchApp Management System
 * @version 1.0.0
 *
 * GET /v1/user/:userId/stats - Récupère le nombre de dons, RDV, prières et témoignages
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_js_1 = require("@supabase/supabase-js");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Initialize Supabase client
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '');
/**
 * Récupère les statistiques d'un utilisateur
 * @route GET /v1/user/:userId/stats
 * @access Private
 */
router.get('/:userId/stats', auth_1.authenticate, async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUser = req.user;
        // Vérifier que l'utilisateur ne peut voir que ses propres stats (sauf admin/pastor)
        if (requestingUser.id !== userId && requestingUser.role !== 'ADMIN' && requestingUser.role !== 'PASTOR') {
            console.log(`⚠️  User ${requestingUser.id} (role: ${requestingUser.role}) tried to access stats of user ${userId}`);
            return res.status(403).json({
                error: 'Accès refusé',
                message: 'Vous ne pouvez voir que vos propres statistiques'
            });
        }
        // Compter les dons
        const { count: donationsCount } = await supabase
            .from('donations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        // Compter les rendez-vous
        const { count: appointmentsCount } = await supabase
            .from('appointments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        // Compter les prières
        const { count: prayersCount } = await supabase
            .from('prayers')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        // Compter les témoignages
        const { count: testimoniesCount } = await supabase
            .from('testimonies')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        const stats = {
            donations: donationsCount || 0,
            appointments: appointmentsCount || 0,
            prayers: prayersCount || 0,
            testimonies: testimoniesCount || 0
        };
        console.log(`📊 Stats pour user ${userId}:`, stats);
        res.json(stats);
    }
    catch (error) {
        console.error('❌ Erreur lors de la récupération des stats:', error);
        res.status(500).json({
            error: 'Erreur serveur',
            message: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=userStats.js.map