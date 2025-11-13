"use strict";
/**
 * Routes donations
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
 * GET /donations - Récupérer toutes les donations
 */
router.get('/', async (req, res) => {
    try {
        const { data: donations, error } = await supabase
            .from('donations')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('❌ Erreur récupération donations:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des donations'
            });
        }
        res.json({
            success: true,
            data: donations || []
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
 * POST /donations - Créer une nouvelle donation
 */
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const authUser = req.user;
        const { amount, method, category, message } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Montant invalide'
            });
        }
        const { data: donation, error } = await supabase
            .from('donations')
            .insert([{
                user_id: authUser.id,
                amount,
                method: method || 'BANK_TRANSFER',
                category: category || 'GENERAL',
                message,
                status: 'PENDING',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();
        if (error) {
            console.error('❌ Erreur création donation:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de la donation'
            });
        }
        res.status(201).json({
            success: true,
            data: donation
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
//# sourceMappingURL=donations.js.map