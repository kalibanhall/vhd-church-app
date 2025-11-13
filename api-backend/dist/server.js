"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const members_1 = __importDefault(require("./routes/members"));
const donations_1 = __importDefault(require("./routes/donations"));
const preachings_1 = __importDefault(require("./routes/preachings"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const prayers_1 = __importDefault(require("./routes/prayers"));
const testimonies_1 = __importDefault(require("./routes/testimonies"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const health_1 = __importDefault(require("./routes/health"));
const facialRecognition_1 = __importDefault(require("./routes/facialRecognition"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const polls_1 = __importDefault(require("./routes/polls"));
const pastor_1 = __importDefault(require("./routes/pastor"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 10000;
const API_VERSION = process.env.API_VERSION || 'v1';
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://vhd-church-app.vercel.app',
    'http://localhost:3000',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
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
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging middleware
if (process.env.NODE_ENV === 'production') {
    app.use((0, morgan_1.default)('combined'));
}
else {
    app.use((0, morgan_1.default)('dev'));
}
// Root route
app.get('/', (req, res) => {
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
app.use(`/${API_VERSION}/health`, health_1.default);
app.use(`/${API_VERSION}/auth`, auth_1.default);
app.use(`/${API_VERSION}/members`, members_1.default);
app.use(`/${API_VERSION}/donations`, donations_1.default);
app.use(`/${API_VERSION}/preachings`, preachings_1.default);
app.use(`/${API_VERSION}/appointments`, appointments_1.default);
app.use(`/${API_VERSION}/prayers`, prayers_1.default);
app.use(`/${API_VERSION}/testimonies`, testimonies_1.default);
app.use(`/${API_VERSION}/analytics`, analytics_1.default);
app.use(`/${API_VERSION}/facial-recognition`, facialRecognition_1.default);
app.use(`/${API_VERSION}/notifications`, notifications_1.default);
app.use(`/${API_VERSION}/polls`, polls_1.default);
app.use(`/${API_VERSION}/pastor`, pastor_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=server.js.map