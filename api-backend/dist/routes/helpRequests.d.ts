/**
 * =============================================================================
 * ROUTE API: HELP REQUESTS (Demandes d'aide)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /help-requests - Liste des demandes (admin: toutes, user: les siennes)
 * - GET /help-requests/:id - Détail d'une demande
 * - POST /help-requests - Créer une demande
 * - PUT /help-requests/:id - Modifier une demande
 * - DELETE /help-requests/:id - Annuler une demande
 * - PUT /help-requests/:id/assign - Assigner une demande (admin)
 * - PUT /help-requests/:id/respond - Répondre à une demande (admin)
 *
 * =============================================================================
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=helpRequests.d.ts.map