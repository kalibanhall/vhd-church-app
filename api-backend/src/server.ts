import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import membersRoutes from './routes/members';
import donationsRoutes from './routes/donations';
import preachingsRoutes from './routes/preachings';
import appointmentsRoutes from './routes/appointments';
import prayersRoutes from './routes/prayers';
import testimoniesRoutes from './routes/testimonies';
import analyticsRoutes from './routes/analytics';
import healthRoutes from './routes/health';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 10000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://vhd-church-app.vercel.app',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow development mode
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Allow all Vercel preview deployments (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    // Allow localhost for development
    if (origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'VHD Church API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      api: `/${API_VERSION}`,
      docs: '/docs',
    },
  });
});

// API Routes
app.use(`/${API_VERSION}/health`, healthRoutes);
app.use(`/${API_VERSION}/auth`, authRoutes);
app.use(`/${API_VERSION}/members`, membersRoutes);
app.use(`/${API_VERSION}/donations`, donationsRoutes);
app.use(`/${API_VERSION}/preachings`, preachingsRoutes);
app.use(`/${API_VERSION}/appointments`, appointmentsRoutes);
app.use(`/${API_VERSION}/prayers`, prayersRoutes);
app.use(`/${API_VERSION}/testimonies`, testimoniesRoutes);
app.use(`/${API_VERSION}/analytics`, analyticsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         VHD Church API Backend - Running                   ║
║                                                            ║
║  Environment: ${process.env.NODE_ENV || 'development'}                              ║
║  Port:        ${PORT}                                      ║
║  Version:     ${API_VERSION}                                           ║
║                                                            ║
║  Ready to accept connections!                              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
