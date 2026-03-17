import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'user' | 'moderator' | 'admin';
    nom: string;
  };
}

interface JwtPayload {
  userId: number;
  email: string;
  role: 'user' | 'moderator' | 'admin';
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Token manquant' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, role, nom, banned FROM utilisateurs WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      res.status(401).json({ success: false, message: 'Utilisateur introuvable' });
      return;
    }

    if (rows[0].banned) {
      res.status(403).json({ success: false, message: 'Compte suspendu' });
      return;
    }

    req.user = {
      id: rows[0].id,
      email: rows[0].email,
      role: rows[0].role,
      nom: rows[0].nom,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Accès non autorisé' });
      return;
    }
    next();
  };
};
