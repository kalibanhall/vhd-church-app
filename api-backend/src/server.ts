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
import facialRecognitionRoutes from './routes/facialRecognition';
import notificationsRoutes from './routes/notifications';
import pollsRoutes from './routes/polls';
import pastorRoutes from './routes/pastor';
import userStatsRoutes from './routes/userStats';
import activitiesRoutes from './routes/activities';
import volunteersRoutes from './routes/volunteers';
import trainingRoutes from './routes/training';
import notesRoutes from './routes/notes';
import helpRequestsRoutes from './routes/helpRequests';

// New feature routes - Added by KalibanHall
import newsRoutes from './routes/news';
import alertsRoutes from './routes/alerts';
import prayerCellsRoutes from './routes/prayerCells';
import servicesRoutes from './routes/services';
import followupRoutes from './routes/followup';
import questionsRoutes from './routes/questions';
import conflictsRoutes from './routes/conflicts';
import abuseReportsRoutes from './routes/abuseReports';
import mutualHelpRoutes from './routes/mutualHelp';
import marketplaceRoutes from './routes/marketplace';
import libraryRoutes from './routes/library';
import audiobooksRoutes from './routes/audiobooks';
import musicRoutes from './routes/music';
import songbookRoutes from './routes/songbook';
import galleryRoutes from './routes/gallery';
import transportRoutes from './routes/transport';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 10000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://mychurchapp.vercel.app',
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
    name: 'MyChurchApp API',
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
app.use(`/${API_VERSION}/facial-recognition`, facialRecognitionRoutes);
app.use(`/${API_VERSION}/notifications`, notificationsRoutes);
app.use(`/${API_VERSION}/polls`, pollsRoutes);
// app.use(`/${API_VERSION}/pastor`, pastorRoutes); // Temporarily disabled - tables don't exist
app.use(`/${API_VERSION}/user`, userStatsRoutes);
app.use(`/${API_VERSION}/activities`, activitiesRoutes);
app.use(`/${API_VERSION}/volunteers`, volunteersRoutes);
app.use(`/${API_VERSION}/training`, trainingRoutes);
app.use(`/${API_VERSION}/notes`, notesRoutes);
app.use(`/${API_VERSION}/help-requests`, helpRequestsRoutes);

// New feature routes - Added by KalibanHall
app.use(`/${API_VERSION}/news`, newsRoutes);
app.use(`/${API_VERSION}/alerts`, alertsRoutes);
app.use(`/${API_VERSION}/prayer-cells`, prayerCellsRoutes);
app.use(`/${API_VERSION}/services`, servicesRoutes);
app.use(`/${API_VERSION}/followup`, followupRoutes);
app.use(`/${API_VERSION}/questions`, questionsRoutes);
app.use(`/${API_VERSION}/conflicts`, conflictsRoutes);
app.use(`/${API_VERSION}/abuse-reports`, abuseReportsRoutes);
app.use(`/${API_VERSION}/mutual-help`, mutualHelpRoutes);
app.use(`/${API_VERSION}/marketplace`, marketplaceRoutes);
app.use(`/${API_VERSION}/library`, libraryRoutes);
app.use(`/${API_VERSION}/audiobooks`, audiobooksRoutes);
app.use(`/${API_VERSION}/music`, musicRoutes);
app.use(`/${API_VERSION}/songbook`, songbookRoutes);
app.use(`/${API_VERSION}/gallery`, galleryRoutes);
app.use(`/${API_VERSION}/transport`, transportRoutes);

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
║         MyChurchApp API Backend - Running                   ║
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
