"use strict";
/**
 * Routes prédications (preachings/sermons)
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
 * GET /preachings - Récupérer toutes les prédications
 */
router.get('/', async (req, res) => {
    try {
        console.log('🎥 Récupération des prédications');
        const { data: preachings, error } = await supabase
            .from('preachings')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('❌ Erreur récupération prédications:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des prédications'
            });
        }
        res.json({
            success: true,
            data: preachings || []
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
 * GET /preachings/:id - Récupérer une prédication par ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: preaching, error } = await supabase
            .from('preachings')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            console.error('❌ Erreur récupération prédication:', error);
            return res.status(404).json({
                success: false,
                error: 'Prédication non trouvée'
            });
        }
        res.json({
            success: true,
            data: preaching
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
 * POST /preachings - Créer une nouvelle prédication (ADMIN/PASTOR uniquement)
 */
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const authUser = req.user;
        // Vérifier les permissions
        if (authUser.role !== 'ADMIN' && authUser.role !== 'PASTOR') {
            return res.status(403).json({
                success: false,
                error: 'Accès réservé aux administrateurs et pasteurs'
            });
        }
        const { title, description, videoUrl, thumbnailUrl, speaker, duration, category } = req.body;
        const { data: preaching, error } = await supabase
            .from('preachings')
            .insert([{
                title,
                description,
                video_url: videoUrl,
                thumbnail_url: thumbnailUrl,
                speaker,
                duration,
                category,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();
        if (error) {
            console.error('❌ Erreur création prédication:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la création de la prédication'
            });
        }
        res.status(201).json({
            success: true,
            data: preaching
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
 * PUT /preachings/:id - Modifier une prédication (ADMIN/PASTOR uniquement)
 */
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const authUser = req.user;
        const { id } = req.params;
        // Vérifier les permissions
        if (authUser.role !== 'ADMIN' && authUser.role !== 'PASTOR') {
            return res.status(403).json({
                success: false,
                error: 'Accès réservé aux administrateurs et pasteurs'
            });
        }
        const { title, description, videoUrl, thumbnailUrl, speaker, duration, category } = req.body;
        const { data: preaching, error } = await supabase
            .from('preachings')
            .update({
            title,
            description,
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl,
            speaker,
            duration,
            category,
            updated_at: new Date().toISOString()
        })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            console.error('❌ Erreur mise à jour prédication:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour de la prédication'
            });
        }
        res.json({
            success: true,
            data: preaching
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
 * DELETE /preachings/:id - Supprimer une prédication (ADMIN uniquement)
 */
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const authUser = req.user;
        const { id } = req.params;
        // Vérifier les permissions
        if (authUser.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Accès réservé aux administrateurs'
            });
        }
        const { error } = await supabase
            .from('preachings')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('❌ Erreur suppression prédication:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression de la prédication'
            });
        }
        res.json({
            success: true,
            message: 'Prédication supprimée avec succès'
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
//# sourceMappingURL=preachings.js.map