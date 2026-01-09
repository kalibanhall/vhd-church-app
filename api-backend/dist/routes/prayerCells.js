"use strict";
/**
 * =============================================================================
 * ROUTE API: PRAYER CELLS (Cellules de prière)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /prayer-cells - Liste des cellules
 * - GET /prayer-cells/:id - Détail d'une cellule
 * - GET /prayer-cells/meetings - Prochaines réunions
 * - POST /prayer-cells - Créer une cellule (admin)
 * - POST /prayer-cells/:id/join - Rejoindre une cellule
 * - POST /prayer-cells/:id/leave - Quitter une cellule
 *
 * =============================================================================
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET - Liste des cellules
router.get('/', async (req, res) => {
    try {
        const category = req.query.category;
        try {
            const cells = await (0, database_1.default) `
        SELECT 
          pc.*,
          u.name as leader_name,
          u.phone as leader_phone,
          (SELECT COUNT(*) FROM prayer_cell_members WHERE cell_id = pc.id) as member_count
        FROM prayer_cells pc
        LEFT JOIN users u ON pc.leader_id = u.id
        WHERE pc.is_active = true
        ${category ? (0, database_1.default) `AND pc.category = ${category}` : (0, database_1.default) ``}
        ORDER BY pc.name ASC
      `;
            res.json({
                success: true,
                cells: cells.map(c => ({
                    id: c.id,
                    name: c.name,
                    description: c.description,
                    leader: {
                        id: c.leader_id,
                        name: c.leader_name,
                        phone: c.leader_phone,
                    },
                    location: c.location,
                    schedule: c.schedule,
                    members: c.member_count,
                    maxMembers: c.max_members,
                    category: c.category,
                    isOpen: c.member_count < c.max_members,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                cells: getMockCells(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching prayer cells:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des cellules',
        });
    }
});
// GET - Prochaines réunions
router.get('/meetings', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        try {
            const meetings = await (0, database_1.default) `
        SELECT 
          m.*,
          pc.name as cell_name,
          pc.location as cell_location
        FROM prayer_cell_meetings m
        JOIN prayer_cells pc ON m.cell_id = pc.id
        WHERE m.date >= NOW()
        ORDER BY m.date ASC
        LIMIT 10
      `;
            res.json({
                success: true,
                meetings: meetings.map(m => ({
                    id: m.id,
                    cellId: m.cell_id,
                    cellName: m.cell_name,
                    date: m.date,
                    topic: m.topic,
                    location: m.cell_location,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                meetings: getMockMeetings(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération des réunions',
        });
    }
});
// POST - Rejoindre une cellule
router.post('/:id/join', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        // Vérifier si la cellule existe et a de la place
        const [cell] = await (0, database_1.default) `
      SELECT 
        pc.*,
        (SELECT COUNT(*) FROM prayer_cell_members WHERE cell_id = pc.id) as member_count
      FROM prayer_cells pc
      WHERE pc.id = ${id}
    `;
        if (!cell) {
            return res.status(404).json({
                success: false,
                error: 'Cellule non trouvée',
            });
        }
        if (cell.member_count >= cell.max_members) {
            return res.status(400).json({
                success: false,
                error: 'Cette cellule est complète',
            });
        }
        // Vérifier si déjà membre
        const [existing] = await (0, database_1.default) `
      SELECT id FROM prayer_cell_members WHERE cell_id = ${id} AND user_id = ${userId}
    `;
        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Vous êtes déjà membre de cette cellule',
            });
        }
        await (0, database_1.default) `
      INSERT INTO prayer_cell_members (cell_id, user_id, joined_at)
      VALUES (${id}, ${userId}, NOW())
    `;
        res.json({
            success: true,
            message: 'Vous avez rejoint la cellule',
        });
    }
    catch (error) {
        console.error('Error joining cell:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'inscription',
        });
    }
});
// Mock data
function getMockCells() {
    return [
        {
            id: '1',
            name: 'Cellule Lumière',
            description: 'Cellule de prière pour les jeunes professionnels',
            leader: { name: 'Jean Mukendi', phone: '+243 81 234 56 78' },
            location: 'Avenue Kalemie 45, Limete, Kinshasa',
            schedule: 'Mercredi 19h30',
            members: 12,
            maxMembers: 15,
            category: 'youth',
            isOpen: true,
        },
        {
            id: '2',
            name: 'Cellule Espérance',
            description: 'Groupe de prière familial',
            leader: { name: 'Marie Kabongo', phone: '+243 99 876 54 32' },
            location: 'Boulevard Lumumba 123, Ngaliema, Kinshasa',
            schedule: 'Jeudi 20h00',
            members: 8,
            maxMembers: 12,
            category: 'family',
            isOpen: true,
        },
    ];
}
function getMockMeetings() {
    return [
        {
            id: '1',
            cellId: '1',
            cellName: 'Cellule Lumière',
            date: new Date(Date.now() + 86400000 * 2).toISOString(),
            topic: 'La puissance de la prière',
            location: 'Avenue Kalemie 45, Limete, Kinshasa',
        },
    ];
}
exports.default = router;
//# sourceMappingURL=prayerCells.js.map