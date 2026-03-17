import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middlewares/auth';

export const getAlertes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Get global alertes + user preferences
    const [alertes] = await pool.execute<RowDataPacket[]>(
      `SELECT a.*, 
              CASE WHEN ul.alerte_id IS NOT NULL THEN 1 ELSE 0 END as lue
       FROM alertes a
       LEFT JOIN alertes_lues ul ON a.id = ul.alerte_id AND ul.utilisateur_id = ?
       ORDER BY a.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ success: true, data: alertes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const markAlertRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await pool.execute(
      `INSERT IGNORE INTO alertes_lues (utilisateur_id, alerte_id) VALUES (?, ?)`,
      [userId, id]
    );

    res.json({ success: true, message: 'Alerte marquée comme lue' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const markAllAlertsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Une seule requête INSERT … SELECT au lieu d'une boucle N requêtes
    await pool.execute(
      `INSERT IGNORE INTO alertes_lues (utilisateur_id, alerte_id)
       SELECT ?, id FROM alertes`,
      [userId]
    );

    res.json({ success: true, message: 'Toutes les alertes marquées comme lues' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const createAlerte = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, produit, zone, message } = req.body;

    if (!['hausse', 'baisse', 'nouveau'].includes(type)) {
      res.status(400).json({ success: false, message: 'Type invalide' });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO alertes (type, produit, zone, message) VALUES (?, ?, ?, ?)',
      [type, produit, zone, message]
    );

    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
