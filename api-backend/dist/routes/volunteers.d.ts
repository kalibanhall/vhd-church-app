/**
 * =============================================================================
 * ROUTE API: VOLUNTEERS (Bénévolat/Service)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /volunteers/teams - Liste des équipes de service
 * - GET /volunteers/teams/:id - Détail d'une équipe
 * - POST /volunteers/teams - Créer une équipe (admin)
 * - PUT /volunteers/teams/:id - Modifier une équipe (admin)
 * - DELETE /volunteers/teams/:id - Supprimer une équipe (admin)
 * - POST /volunteers/register - S'inscrire comme bénévole
 * - GET /volunteers/registrations - Liste des inscriptions (admin)
 * - PUT /volunteers/registrations/:id - Approuver/Rejeter inscription (admin)
 * - GET /volunteers/my-registrations - Mes inscriptions
 *
 * =============================================================================
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=volunteers.d.ts.map