import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { AuthRequest } from '../middlewares/auth';
import bcrypt from 'bcryptjs';

// ====== PROFIL ======
export const getProfil = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, nom, email, role, zone, avatar, signalements_count, banned, created_at, last_login
       FROM utilisateurs WHERE id = ?`,
      [req.user!.id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      return;
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const updateProfil = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nom, zone, avatar } = req.body;

    await pool.execute(
      'UPDATE utilisateurs SET nom = COALESCE(?, nom), zone = COALESCE(?, zone), avatar = COALESCE(?, avatar) WHERE id = ?',
      [nom || null, zone || null, avatar || null, req.user!.id]
    );

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, nom, email, role, zone, avatar, signalements_count FROM utilisateurs WHERE id = ?',
      [req.user!.id]
    );

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT password_hash FROM utilisateurs WHERE id = ?',
      [req.user!.id]
    );

    const isValid = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!isValid) {
      res.status(401).json({ success: false, message: 'Ancien mot de passe incorrect' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.execute('UPDATE utilisateurs SET password_hash = ? WHERE id = ?', [newHash, req.user!.id]);

    res.json({ success: true, message: 'Mot de passe modifié' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ====== ADMIN USERS ======
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, nom, email, role, zone, avatar, signalements_count, banned, created_at, last_login
       FROM utilisateurs ORDER BY created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const toggleBanUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.params;

    if (email === req.user!.email) {
      res.status(400).json({ success: false, message: 'Impossible de vous bannir vous-même' });
      return;
    }

    await pool.execute(
      'UPDATE utilisateurs SET banned = NOT banned WHERE email = ?',
      [email]
    );

    res.json({ success: true, message: 'Statut mis à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ====== DASHBOARD ======
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [usersCount] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM utilisateurs');
    const [sigCount] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM signalements');
    const [sigVerif] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM signalements WHERE verifie = 1');
    const [alertesCount] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM alertes');

    // Recent signalements
    const [recentSig] = await pool.execute<RowDataPacket[]>(
      `SELECT s.*, u.nom as utilisateur_nom 
       FROM signalements s 
       LEFT JOIN utilisateurs u ON s.utilisateur_id = u.id
       ORDER BY s.created_at DESC LIMIT 5`
    );

    // Recent alertes
    const [recentAlertes] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM alertes ORDER BY created_at DESC LIMIT 5'
    );

    res.json({
      success: true,
      data: {
        stats: {
          utilisateurs: usersCount[0].total,
          signalements: sigCount[0].total,
          signalementsVerifies: sigVerif[0].total,
          alertes: alertesCount[0].total,
        },
        recentSignalements: recentSig,
        recentAlertes,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ====== ZONES ======
export const getZones = async (req: Request, res: Response): Promise<void> => {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM zones ORDER BY nom');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ====== CHANGER LE RÔLE D'UN UTILISATEUR (Admin seulement) ======
export const changeUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      res.status(400).json({ success: false, message: 'Rôle invalide. Valeurs acceptées : user, moderator, admin' });
      return;
    }

    // Empêcher l'admin de se rétrograder lui-même
    if (email === req.user!.email) {
      res.status(400).json({ success: false, message: 'Vous ne pouvez pas modifier votre propre rôle' });
      return;
    }

    const [rows] = await pool.execute<any[]>('SELECT id FROM utilisateurs WHERE email = ?', [email]);
    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
      return;
    }

    await pool.execute('UPDATE utilisateurs SET role = ? WHERE email = ?', [role, email]);

    res.json({ success: true, message: `Rôle mis à jour : ${role}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
