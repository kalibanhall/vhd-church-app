"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePastorOrAdmin = exports.requireAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
// Charger les variables d'environnement
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined in .env file');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
/**
 * Middleware d'authentification
 * Vérifie le token JWT dans le header Authorization
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Token d\'authentification manquant',
            });
            return;
        }
        const token = authHeader.substring(7);
        req.token = token;
        // Vérifier avec Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            // Fallback: vérifier avec JWT custom
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                // Support both 'id' and 'userId' for backwards compatibility
                const userId = decoded.id || decoded.userId;
                req.user = {
                    id: userId,
                    email: decoded.email,
                    role: decoded.role,
                };
                console.log('✅ JWT custom decoded, user ID:', userId);
            }
            catch (jwtError) {
                res.status(401).json({
                    success: false,
                    error: 'Token invalide ou expiré',
                });
                return;
            }
        }
        else {
            // Token Supabase valide
            req.user = {
                id: user.id,
                email: user.email,
                role: user.user_metadata?.role || 'member',
            };
            console.log('✅ Supabase token valid, user ID:', user.id);
        }
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur d\'authentification',
        });
    }
};
exports.authenticate = authenticate;
/**
 * Middleware pour vérifier le rôle admin
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Non authentifié',
        });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: 'Accès réservé aux administrateurs',
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware pour vérifier le rôle pasteur ou admin
 */
const requirePastorOrAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Non authentifié',
        });
        return;
    }
    if (req.user.role !== 'admin' && req.user.role !== 'pasteur') {
        res.status(403).json({
            success: false,
            error: 'Accès réservé aux administrateurs et pasteurs',
        });
        return;
    }
    next();
};
exports.requirePastorOrAdmin = requirePastorOrAdmin;
//# sourceMappingURL=auth.js.map