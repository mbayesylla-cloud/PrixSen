import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AuthRequest } from '../middlewares/auth';
import { z } from 'zod';
import path from 'path';

const signalementSchema = z.object({
  produit: z.string().min(1).max(100),
  prix: z.number().positive(),
  zone: z.string().min(1),
  categorie: z.string().optional(),
});

export const getSignalements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zone, verifie, page = '1', limit = '20' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT s.*, u.nom as utilisateur_nom, u.avatar as utilisateur_avatar
      FROM signalements s
      LEFT JOIN utilisateurs u ON s.utilisateur_id = u.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (zone) { query += ' AND s.zone = ?'; params.push(zone as string); }
    if (verifie !== undefined) { query += ' AND s.verifie = ?'; params.push(verifie === 'true' ? 1 : 0); }

    query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);

    // Count total
    const [countRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM signalements WHERE 1=1' +
      (zone ? ' AND zone = ?' : '') +
      (verifie !== undefined ? ' AND verifie = ?' : ''),
      params.slice(0, -2)
    );

    res.json({
      success: true,
      data: rows,
      meta: {
        total: countRows[0].total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('GetSignalements error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const createSignalement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = {
      ...req.body,
      prix: Number(req.body.prix),
    };
    const { produit, prix, zone, categorie } = signalementSchema.parse(body);

    let photoUrl: string | null = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO signalements (produit, prix, zone, categorie, utilisateur_id, photo_url, verifie)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [produit, prix, zone, categorie || null, req.user!.id, photoUrl]
    );

    // Increment user signalements count
    await pool.execute(
      'UPDATE utilisateurs SET signalements_count = signalements_count + 1 WHERE id = ?',
      [req.user!.id]
    );

    const [newSig] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM signalements WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newSig[0] });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Données invalides', errors: error.errors });
      return;
    }
    console.error('CreateSignalement error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const verifySignalement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.execute(
      'UPDATE signalements SET verifie = 1, verified_by = ?, verified_at = NOW() WHERE id = ?',
      [req.user!.id, id]
    );

    const [updated] = await pool.execute<RowDataPacket[]>(
      `SELECT s.*, u.nom as utilisateur_nom FROM signalements s
       LEFT JOIN utilisateurs u ON s.utilisateur_id = u.id
       WHERE s.id = ?`,
      [id]
    );

    res.json({ success: true, message: 'Signalement vérifié', data: updated[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const deleteSignalement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check ownership or role
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT utilisateur_id FROM signalements WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Signalement introuvable' });
      return;
    }

    if (rows[0].utilisateur_id !== req.user!.id && !['moderator', 'admin'].includes(req.user!.role)) {
      res.status(403).json({ success: false, message: 'Non autorisé' });
      return;
    }

    // Récupérer l'auteur avant suppression pour décrémenter son compteur
    const ownerId = rows[0].utilisateur_id;
    await pool.execute('DELETE FROM signalements WHERE id = ?', [id]);

    // Décrémenter signalements_count (GREATEST pour éviter les négatifs)
    await pool.execute(
      'UPDATE utilisateurs SET signalements_count = GREATEST(0, signalements_count - 1) WHERE id = ?',
      [ownerId]
    );

    res.json({ success: true, message: 'Signalement supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
