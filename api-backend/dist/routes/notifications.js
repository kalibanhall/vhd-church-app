"use strict";
/**
 * Routes notifications
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
 * GET /notifications - Récupérer les notifications d'un utilisateur
 */
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { userId, unread } = req.query;
        const authUserId = req.user?.id;
        const targetUserId = userId || authUserId;
        if (!targetUserId) {
            return res.status(400).json({
                success: false,
                error: 'userId requis'
            });
        }
        let query = supabase
            .from('notifications')
            .select('*')
            .eq('user_id', targetUserId);
        // Filtrer par statut de lecture si demandé
        if (unread === 'true') {
            query = query.eq('is_read', false);
        }
        const { data: notifications, error } = await query
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) {
            console.error('❌ Erreur récupération notifications:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération des notifications'
            });
        }
        const { count: unreadCount } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', targetUserId)
            .eq('is_read', false);
        res.json({
            success: true,
            data: notifications || [],
            unreadCount: unreadCount || 0
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
 * PATCH /notifications/mark-read - Marquer des notifications comme lues
 */
router.patch('/mark-read', auth_1.authenticate, async (req, res) => {
    try {
        const { notificationIds, userId } = req.body;
        const authUserId = req.user?.id;
        const targetUserId = userId || authUserId;
        if (!notificationIds || !Array.isArray(notificationIds)) {
            return res.status(400).json({
                success: false,
                error: 'notificationIds (array) requis'
            });
        }
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true, updated_at: new Date().toISOString() })
            .in('id', notificationIds)
            .eq('user_id', targetUserId);
        if (error) {
            console.error('❌ Erreur mise à jour notifications:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour des notifications'
            });
        }
        res.json({
            success: true,
            message: 'Notifications marquées comme lues'
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
 * PATCH /notifications/:id - Marquer une notification comme lue
 */
router.patch('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const authUserId = req.user?.id;
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', authUserId);
        if (error) {
            console.error('❌ Erreur mise à jour notification:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour de la notification'
            });
        }
        res.json({
            success: true,
            message: 'Notification marquée comme lue'
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
//# sourceMappingURL=notifications.js.map