import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined in .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  token?: string;
}

/**
 * Middleware d'authentification
 * Vérifie le token JWT dans le header Authorization
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as { id: string; userId?: string; email: string; role: string };

        // Support both 'id' and 'userId' for backwards compatibility
        const userId = decoded.id || decoded.userId;

        req.user = {
          id: userId,
          email: decoded.email,
          role: decoded.role,
        };

        console.log('✅ JWT custom decoded, user ID:', userId);
      } catch (jwtError) {
        res.status(401).json({
          success: false,
          error: 'Token invalide ou expiré',
        });
        return;
      }
    } else {
      // Token Supabase valide
      req.user = {
        id: user.id,
        email: user.email!,
        role: (user.user_metadata?.role as string) || 'member',
      };

      console.log('✅ Supabase token valid, user ID:', user.id);
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur d\'authentification',
    });
  }
};

/**
 * Middleware pour vérifier le rôle admin
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
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

/**
 * Middleware pour vérifier le rôle pasteur ou admin
 */
export const requirePastorOrAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
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
