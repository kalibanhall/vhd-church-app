"use strict";
/**
 * Routes témoignages
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
 * GET /testimonies - Récupérer tous les témoignages
 */
router.get('/', async (req, res) => {
    try {
        const { status, userId, userOnly } = req.query;
        let query = supabase
            .from('testimonies')
            .select('*');
        // Filtrer par statut si demandé (pending = is_approved false)
        if (status) {
            if (String(status).toLowerCase() === 'pending') {
                query = query.eq('is_approved', false);
            }
            else if (String(status).toLowerCase() === 'approved') {
                query = query.eq('is_approved', true);
            }
        }
        // Filtrer par utilisateur si demandé
        if (userId) {
            query = query.eq('user_id', userId);
        }
        else if (userOnly === 'true' && req.user?.id) {
            query = query.eq('user_id', req.user.id);
        }
        const { data: testimonies, error } = await query.order('created_at', { ascending: false });
        if (error) {
            console.error('❌ Erreur récupération témoignages:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des témoignages'
            });
        }
        res.json({
            success: true,
            data: testimonies || []
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
 * POST /testimonies - Créer un nouveau témoignage
 */
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const authUser = req.user;
        const { title, content, isAnonymous, category } = req.body;
        const { data: testimony, error } = await supabase
            .from('testimonies')
            .insert([{
                user_id: authUser.id,
                title,
                content,
                is_anonymous: isAnonymous || false,
                is_approved: false,
                is_published: false,
                category: category || 'GENERAL',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        if (error) {
            console.error('❌ Erreur création témoignage:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la création du témoignage'
            });
        }
        res.status(201).json({
            success: true,
            data: testimony
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
//# sourceMappingURL=testimonies.js.map