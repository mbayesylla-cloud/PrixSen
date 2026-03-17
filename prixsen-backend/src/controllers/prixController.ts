import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

// ====== TRANSPORT ======
export const getTransport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zone } = req.query;
    let query = 'SELECT * FROM prix_transport';
    const params: string[] = [];

    if (zone) {
      query += ' WHERE zone = ?';
      params.push(zone as string);
    }
    query += ' ORDER BY type, trajet';

    const [rows] = await pool.execute<RowDataPacket[]>(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ====== CARBURANT ======
export const getCarburant = async (req: Request, res: Response): Promise<void> => {
  try {
    const [carburants] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM prix_carburant ORDER BY type'
    );

    const [historique] = await pool.execute<RowDataPacket[]>(
      'SELECT carburant_id, mois, prix FROM historique_carburant ORDER BY carburant_id, ordre_mois'
    );

    const historiqueMap: Record<number, { mois: string; prix: number }[]> = {};
    for (const h of historique) {
      if (!historiqueMap[h.carburant_id]) historiqueMap[h.carburant_id] = [];
      historiqueMap[h.carburant_id].push({ mois: h.mois, prix: h.prix });
    }

    const result = carburants.map(c => ({
      ...c,
      historique: historiqueMap[c.id] || [],
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ====== LOGEMENT ======
export const getLogement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zone } = req.query;
    let query = `
      SELECT l.*, z.nom as zone_nom FROM prix_logement l
      JOIN zones z ON l.zone_id = z.id
    `;
    const params: string[] = [];

    if (zone) {
      query += ' WHERE l.zone_id = ?';
      params.push(zone as string);
    }
    query += ' ORDER BY l.zone_id, l.type';

    const [logements] = await pool.execute<RowDataPacket[]>(query, params);

    const [historique] = await pool.execute<RowDataPacket[]>(
      'SELECT logement_id, mois, prix FROM historique_logement ORDER BY logement_id, ordre_mois'
    );

    const historiqueMap: Record<number, { mois: string; prix: number }[]> = {};
    for (const h of historique) {
      if (!historiqueMap[h.logement_id]) historiqueMap[h.logement_id] = [];
      historiqueMap[h.logement_id].push({ mois: h.mois, prix: h.prix });
    }

    const result = logements.map(l => ({
      ...l,
      historique: historiqueMap[l.id] || [],
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
