import { Request, Response, NextFunction } from 'express';
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
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware pour vérifier le rôle admin
 */
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware pour vérifier le rôle pasteur ou admin
 */
export declare const requirePastorOrAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map