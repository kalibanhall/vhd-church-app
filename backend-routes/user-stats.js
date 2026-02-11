/**
 * @fileoverview Route pour récupérer les statistiques d'un utilisateur
 * @author MyChurchApp Management System
 * @version 1.0.0
 * 
 * GET /v1/user/:userId/stats - Récupère le nombre de dons, RDV, prières et témoignages
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const pool = require('../config/database');

/**
 * Récupère les statistiques d'un utilisateur
 * @route GET /v1/user/:userId/stats
 * @access Private
 */
router.get('/:userId/stats', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Vérifier que l'utilisateur ne peut voir que ses propres stats (sauf admin/pastor)
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin' && req.user.role !== 'pastor') {
      return res.status(403).json({ 
        error: 'Accès refusé',
        message: 'Vous ne pouvez voir que vos propres statistiques' 
      });
    }

    // Compter les dons
    const donationsResult = await pool.query(
      'SELECT COUNT(*) as count FROM donations WHERE user_id = $1',
      [userId]
    );

    // Compter les rendez-vous
    const appointmentsResult = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE user_id = $1',
      [userId]
    );

    // Compter les prières
    const prayersResult = await pool.query(
      'SELECT COUNT(*) as count FROM prayers WHERE user_id = $1',
      [userId]
    );

    // Compter les témoignages
    const testimoniesResult = await pool.query(
      'SELECT COUNT(*) as count FROM testimonies WHERE user_id = $1',
      [userId]
    );

    const stats = {
      donations: parseInt(donationsResult.rows[0].count),
      appointments: parseInt(appointmentsResult.rows[0].count),
      prayers: parseInt(prayersResult.rows[0].count),
      testimonies: parseInt(testimoniesResult.rows[0].count)
    };

    res.json(stats);

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message 
    });
  }
});

module.exports = router;
