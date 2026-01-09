/**
 * =============================================================================
 * ROUTE API: TRAINING (Formations/Cours)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /training/courses - Liste des cours
 * - GET /training/courses/:id - Détail d'un cours avec leçons
 * - POST /training/courses - Créer un cours (admin)
 * - PUT /training/courses/:id - Modifier un cours (admin)
 * - DELETE /training/courses/:id - Supprimer un cours (admin)
 * - POST /training/courses/:id/enroll - S'inscrire à un cours
 * - POST /training/lessons/:id/complete - Marquer une leçon comme terminée
 * - GET /training/my-enrollments - Mes inscriptions
 *
 * =============================================================================
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=training.d.ts.map