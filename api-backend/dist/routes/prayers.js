"use strict";
/**
 * Routes prières
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
 * GET /prayers - Récupérer toutes les prières
 */
router.get('/', async (req, res) => {
    try {
        const { data: prayers, error } = await supabase
            .from('prayers')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('❌ Erreur récupération prières:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des prières'
            });
        }
        res.json({
            success: true,
            data: prayers || []
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
 * POST /prayers - Créer une nouvelle prière
 */
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const authUser = req.user;
        const { title, description, isAnonymous } = req.body;
        const { data: prayer, error } = await supabase
            .from('prayers')
            .insert([{
                user_id: authUser.id,
                title,
                description,
                is_anonymous: isAnonymous || false,
                status: 'PENDING',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        if (error) {
            console.error('❌ Erreur création prière:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de la prière'
            });
        }
        res.status(201).json({
            success: true,
            data: prayer
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
//# sourceMappingURL=prayers.js.map