"use strict";
/**
 * =============================================================================
 * ROUTE API: TRANSPORT (Navette)
 * =============================================================================
 *
 * Auteur: CHRIS NGOZULU KASONGO (KalibanHall)
 * GitHub: https://github.com/KalibanHall
 *
 * Endpoints:
 * - GET /transport/routes - Routes de navette disponibles
 * - GET /transport/schedule - Horaires
 * - POST /transport/book - Réserver une place
 * - GET /transport/my-bookings - Mes réservations
 * - DELETE /transport/bookings/:id - Annuler une réservation
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
// GET - Routes de navette
router.get('/routes', async (req, res) => {
    try {
        try {
            const routes = await (0, database_1.default) `
        SELECT * FROM transport_routes
        WHERE is_active = true
        ORDER BY name ASC
      `;
            res.json({
                success: true,
                routes: routes.map(r => ({
                    id: r.id,
                    name: r.name,
                    description: r.description,
                    stops: r.stops,
                    departureTime: r.departure_time,
                    returnTime: r.return_time,
                    capacity: r.capacity,
                    driver: r.driver_name,
                    contact: r.driver_phone,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                routes: getMockRoutes(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la récupération',
        });
    }
});
// GET - Horaires du prochain dimanche
router.get('/schedule', async (req, res) => {
    try {
        const date = req.query.date || getNextSunday();
        try {
            const schedule = await (0, database_1.default) `
        SELECT 
          ts.*,
          tr.name as route_name,
          tr.stops,
          (SELECT COUNT(*) FROM transport_bookings WHERE schedule_id = ts.id AND status = 'confirmed') as booked
        FROM transport_schedules ts
        JOIN transport_routes tr ON ts.route_id = tr.id
        WHERE ts.date = ${date}
        ORDER BY ts.departure_time ASC
      `;
            res.json({
                success: true,
                date,
                schedule: schedule.map(s => ({
                    id: s.id,
                    routeId: s.route_id,
                    routeName: s.route_name,
                    stops: s.stops,
                    departureTime: s.departure_time,
                    returnTime: s.return_time,
                    capacity: s.capacity,
                    booked: s.booked,
                    available: s.capacity - s.booked,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                date,
                schedule: getMockSchedule(),
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur',
        });
    }
});
// POST - Réserver une place
router.post('/book', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { scheduleId, pickupStop, passengers } = req.body;
        try {
            // Vérifier la disponibilité
            const [schedule] = await (0, database_1.default) `
        SELECT 
          ts.*,
          (SELECT COUNT(*) FROM transport_bookings WHERE schedule_id = ts.id AND status = 'confirmed') as booked
        FROM transport_schedules ts
        WHERE ts.id = ${scheduleId}
      `;
            if (!schedule) {
                return res.status(404).json({
                    success: false,
                    error: 'Horaire non trouvé',
                });
            }
            const passengerCount = passengers || 1;
            if (schedule.capacity - schedule.booked < passengerCount) {
                return res.status(400).json({
                    success: false,
                    error: 'Pas assez de places disponibles',
                });
            }
            const [booking] = await (0, database_1.default) `
        INSERT INTO transport_bookings (
          schedule_id, user_id, pickup_stop, passengers, status, created_at
        ) VALUES (
          ${scheduleId}, ${userId}, ${pickupStop}, ${passengerCount}, 'confirmed', NOW()
        )
        RETURNING *
      `;
            res.status(201).json({
                success: true,
                message: `Réservation confirmée pour ${passengerCount} personne(s)`,
                booking: {
                    id: booking.id,
                    scheduleId: booking.schedule_id,
                    pickupStop: booking.pickup_stop,
                    passengers: booking.passengers,
                    status: booking.status,
                },
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                message: 'Réservation enregistrée (mode démo)',
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error booking transport:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la réservation',
        });
    }
});
// GET - Mes réservations
router.get('/my-bookings', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        try {
            const bookings = await (0, database_1.default) `
        SELECT 
          tb.*,
          ts.date,
          ts.departure_time,
          ts.return_time,
          tr.name as route_name
        FROM transport_bookings tb
        JOIN transport_schedules ts ON tb.schedule_id = ts.id
        JOIN transport_routes tr ON ts.route_id = tr.id
        WHERE tb.user_id = ${userId}
        AND ts.date >= CURRENT_DATE
        ORDER BY ts.date ASC, ts.departure_time ASC
      `;
            res.json({
                success: true,
                bookings: bookings.map(b => ({
                    id: b.id,
                    date: b.date,
                    routeName: b.route_name,
                    departureTime: b.departure_time,
                    returnTime: b.return_time,
                    pickupStop: b.pickup_stop,
                    passengers: b.passengers,
                    status: b.status,
                })),
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                bookings: [],
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur',
        });
    }
});
// DELETE - Annuler une réservation
router.delete('/bookings/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        try {
            await (0, database_1.default) `
        UPDATE transport_bookings 
        SET status = 'cancelled'
        WHERE id = ${id} AND user_id = ${userId}
      `;
            res.json({
                success: true,
                message: 'Réservation annulée',
            });
        }
        catch (dbError) {
            res.json({
                success: true,
                message: 'Réservation annulée (mode démo)',
                _mock: true,
            });
        }
    }
    catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur',
        });
    }
});
// Helper functions
function getNextSunday() {
    const today = new Date();
    const daysUntilSunday = (7 - today.getDay()) % 7 || 7;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    return nextSunday.toISOString().split('T')[0];
}
function getMockRoutes() {
    return [
        {
            id: '1',
            name: 'Route Gombe-Lemba',
            description: 'Dessert les communes de Gombe et Lemba',
            stops: ['Marché Central Gombe', 'Rond-point Forescom', 'Église MyChurchApp Lemba'],
            departureTime: '08:30',
            returnTime: '13:00',
            capacity: 15,
            driver: 'Paul Tshimanga',
            contact: '+243 81 234 56 78',
        },
        {
            id: '2',
            name: 'Route Ngaliema-Binza',
            description: 'Dessert les quartiers de Ngaliema et Binza',
            stops: ['Clinique Ngaliema', 'Binza UPN', 'Église MyChurchApp Lemba'],
            departureTime: '08:45',
            returnTime: '13:00',
            capacity: 12,
            driver: 'Jean Kalala',
            contact: '+243 99 876 54 32',
        },
    ];
}
function getMockSchedule() {
    return [
        {
            id: '1',
            routeId: '1',
            routeName: 'Route Nord',
            stops: ['Gare du Nord', 'Place de la République', 'Église'],
            departureTime: '08:30',
            returnTime: '13:00',
            capacity: 15,
            booked: 8,
            available: 7,
        },
        {
            id: '2',
            routeId: '2',
            routeName: 'Route Sud',
            stops: ['Place d\'Italie', 'Montparnasse', 'Église'],
            departureTime: '08:45',
            returnTime: '13:00',
            capacity: 12,
            booked: 5,
            available: 7,
        },
    ];
}
exports.default = router;
//# sourceMappingURL=transport.js.map