"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = __importDefault(require("../config/database"));
const router = (0, express_1.Router)();
/**
 * GET /health - Health check endpoint
 */
router.get('/', async (req, res) => {
    try {
        // Test database connection
        const result = await (0, database_1.default) `SELECT 1 as test`;
        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: result.length > 0 ? 'connected' : 'disconnected',
            environment: process.env.NODE_ENV || 'development',
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.js.map