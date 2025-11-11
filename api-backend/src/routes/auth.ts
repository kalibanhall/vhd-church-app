/**
 * Routes d'authentification
 * @author CHRIS NGOZULU KASONGO (KalibanHall)
 */

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * POST /auth/register - Inscription d'un nouvel utilisateur
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: hashedPassword,
          first_name: firstName || '',
          last_name: lastName || '',
          phone: phone || '',
          role: 'member'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la création du compte'
      });
    }

    // Générer un token JWT
    const tokenOptions: any = { expiresIn: JWT_EXPIRES_IN };
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      JWT_SECRET,
      tokenOptions
    );

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur serveur lors de l\'inscription',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

/**
 * POST /auth/login - Connexion d'un utilisateur
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    // Récupérer l'utilisateur
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('🔍 Login attempt for:', email);
    console.log('🔍 User found:', user ? 'Yes' : 'No');

    if (error || !user) {
      console.log('❌ User not found or error:', error);
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    console.log('🔍 User role:', user.role);
    console.log('🔍 User has password_hash:', user.password_hash ? 'Yes' : 'No');

    // Vérifier le statut
    if (user.status && user.status.toLowerCase() !== 'active') {
      console.log('❌ User status inactive:', user.status);
      return res.status(403).json({
        success: false,
        error: 'Compte désactivé. Contactez l\'administrateur.'
      });
    }

    // Vérifier le mot de passe
    console.log('🔐 Comparing passwords...');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('🔐 Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Générer un token JWT
    const tokenOptions: any = { expiresIn: JWT_EXPIRES_IN };
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      tokenOptions
    );

    // Mettre à jour la dernière connexion (si la colonne existe)
    await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la connexion'
    });
  }
});

/**
 * POST /auth/logout - Déconnexion (optionnel, pour compatibilité)
 */
router.post('/logout', async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

/**
 * GET /auth/me - Récupérer l'utilisateur connecté
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    console.log('🔍 GET /auth/me called');
    const authHeader = req.headers.authorization;
    
    console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header or invalid format');
      return res.status(401).json({
        success: false,
        error: 'Non autorisé'
      });
    }

    const token = authHeader.substring(7);
    console.log('🔍 Token received, length:', token.length);
    
    const decoded: any = jwt.verify(token, JWT_SECRET);
    console.log('🔍 Token decoded, user ID:', decoded.id);

    // Récupérer l'utilisateur
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, phone, profile_image_url, status')
      .eq('id', decoded.id)
      .single();

    console.log('🔍 User found in DB:', user ? 'Yes' : 'No');
    
    if (error || !user) {
      console.log('❌ User not found:', error);
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    console.log('✅ Returning user data for:', user.email);
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        phone: user.phone,
        avatar: user.profile_image_url
      }
    });
  } catch (error: any) {
    console.error('❌ Auth me error:', error);
    res.status(401).json({
      success: false,
      error: 'Token invalide'
    });
  }
});

export default router;
