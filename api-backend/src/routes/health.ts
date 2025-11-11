import { Router, Request, Response } from 'express';
import sql from '../config/database';

const router = Router();

/**
 * GET /health - Health check endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Test database connection
    const result = await sql`SELECT 1 as test`;
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: result.length > 0 ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
