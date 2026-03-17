import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { z } from 'zod';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Hasher le refresh token avant stockage
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  nom: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  zone: z.string().min(1),
});

function generateTokens(userId: number, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, nom, email, role, zone, avatar, signalements_count, banned, password_hash FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
      return;
    }

    const user = rows[0];

    if (user.banned) {
      res.status(403).json({ success: false, message: 'Compte suspendu' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    await pool.execute(
      'UPDATE utilisateurs SET refresh_token = ?, last_login = NOW() WHERE id = ?',
      [hashToken(refreshToken), user.id]
    );

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          nom: user.nom,
          email: user.email,
          role: user.role,
          zone: user.zone,
          avatar: user.avatar,
          signalements: user.signalements_count,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Données invalides', errors: error.errors });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nom, email, password, zone } = registerSchema.parse(req.body);

    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      res.status(409).json({ success: false, message: 'Email déjà utilisé' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO utilisateurs (nom, email, password_hash, role, zone, avatar, signalements_count)
       VALUES (?, ?, ?, 'user', ?, '👤', 0)`,
      [nom, email, password_hash, zone]
    );

    const userId = result.insertId;

    const { accessToken, refreshToken } = generateTokens(userId, email, 'user');

    await pool.execute(
      'UPDATE utilisateurs SET refresh_token = ? WHERE id = ?',
      [hashToken(refreshToken), userId]
    );

    res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userId,
          nom,
          email,
          role: 'user',
          zone,
          avatar: '👤',
          signalements: 0,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Données invalides', errors: error.errors });
      return;
    }

    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const loginGoogle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ success: false, message: 'Token Google manquant' });
      return;
    }

    let email: string;
    let nom: string;
    let avatar: string;

    if (process.env.GOOGLE_CLIENT_ID) {

      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload()!;

      email = payload.email!;
      nom = payload.name || email.split('@')[0];
      avatar = payload.picture || '👤';

    } else if (process.env.NODE_ENV === 'development') {

      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString());

      email = payload.email;
      nom = payload.name || email.split('@')[0];
      avatar = payload.picture || '👤';

    } else {

      res.status(503).json({
        success: false,
        message: 'Authentification Google non configurée sur ce serveur.',
      });
      return;

    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, nom, email, role, zone, avatar, signalements_count FROM utilisateurs WHERE email = ?',
      [email]
    );

    let userId: number;
    let role: string;

    if (rows.length === 0) {

      const [result] = await pool.execute<ResultSetHeader>(
        `INSERT INTO utilisateurs (nom, email, password_hash, role, zone, avatar, signalements_count)
         VALUES (?, ?, '', 'user', 'Dakar', ?, 0)`,
        [nom, email, avatar]
      );

      userId = result.insertId;
      role = 'user';

    } else {

      userId = rows[0].id;
      role = rows[0].role;

    }

    const { accessToken, refreshToken } = generateTokens(userId, email, role);

    await pool.execute(
      'UPDATE utilisateurs SET refresh_token = ?, last_login = NOW() WHERE id = ?',
      [hashToken(refreshToken), userId]
    );

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userId,
          nom,
          email,
          role,
          zone: rows[0]?.zone || 'Dakar',
          avatar,
          signalements: rows[0]?.signalements_count || 0,
        },
      },
    });

  } catch (error) {

    console.error('Google login error:', error);

    res.status(500).json({
      success: false,
      message: 'Erreur authentification Google',
    });

  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {

  try {

    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(401).json({ success: false, message: 'Refresh token manquant' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: number; email: string; role: string };

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, role FROM utilisateurs WHERE id = ? AND refresh_token = ?',
      [decoded.userId, hashToken(token)]
    );

    if (rows.length === 0) {
      res.status(401).json({ success: false, message: 'Refresh token invalide' });
      return;
    }

    const freshRole = rows[0].role;

    const { accessToken, refreshToken: newRefresh } =
      generateTokens(decoded.userId, decoded.email, freshRole);

    await pool.execute(
      'UPDATE utilisateurs SET refresh_token = ? WHERE id = ?',
      [hashToken(newRefresh), decoded.userId]
    );

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefresh,
      },
    });

  } catch {

    res.status(401).json({
      success: false,
      message: 'Refresh token expiré ou invalide',
    });

  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {

  try {

    const { refreshToken: token } = req.body;

    if (token) {
      await pool.execute(
        'UPDATE utilisateurs SET refresh_token = NULL WHERE refresh_token = ?',
        [hashToken(token)]
      );
    }

    res.json({
      success: true,
      message: 'Déconnexion réussie',
    });

  } catch {

    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });

  }
};