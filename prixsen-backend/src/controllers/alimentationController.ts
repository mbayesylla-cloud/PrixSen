import { Request, Response } from 'express';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export const getProduits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zone, categorie } = req.query;

    let query = `
      SELECT p.id, p.nom, p.unite, p.icon, p.categorie,
             COALESCE(pz.prix, p.prix_moyen_national) as prix,
             p.prix_moyen_national,
             pz.zone_id
      FROM produits_alimentaires p
      LEFT JOIN prix_par_zone pz ON p.id = pz.produit_id AND pz.zone_id = ?
    `;
    const params: (string | undefined)[] = [zone as string || 'dakar'];

    if (categorie) {
      query += ' WHERE p.categorie = ?';
      params.push(categorie as string);
    }

    query += ' ORDER BY p.categorie, p.nom';

    const [produits] = await pool.execute<RowDataPacket[]>(query, params);

    // Get historique for each produit
    const [historique] = await pool.execute<RowDataPacket[]>(
      `SELECT produit_id, mois, prix FROM historique_prix ORDER BY produit_id, ordre_mois`
    );

    const historiqueMap: Record<string, { mois: string; prix: number }[]> = {};
    for (const h of historique) {
      if (!historiqueMap[h.produit_id]) historiqueMap[h.produit_id] = [];
      historiqueMap[h.produit_id].push({ mois: h.mois, prix: h.prix });
    }

    // Get prix par zone for all zones
    const [allZonePrix] = await pool.execute<RowDataPacket[]>(
      `SELECT produit_id, zone_id, prix FROM prix_par_zone`
    );

    const zonePrixMap: Record<string, Record<string, number>> = {};
    for (const z of allZonePrix) {
      if (!zonePrixMap[z.produit_id]) zonePrixMap[z.produit_id] = {};
      zonePrixMap[z.produit_id][z.zone_id] = z.prix;
    }

    const result = produits.map(p => ({
      ...p,
      historique: historiqueMap[p.id] || [],
      prixParZone: zonePrixMap[p.id] || {},
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('GetProduits error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

export const getProduitById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM produits_alimentaires WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: 'Produit introuvable' });
      return;
    }

    const [prixZones] = await pool.execute<RowDataPacket[]>(
      `SELECT pz.zone_id, pz.prix, z.nom as zone_nom 
       FROM prix_par_zone pz 
       JOIN zones z ON pz.zone_id = z.id 
       WHERE pz.produit_id = ?`,
      [id]
    );

    const [historique] = await pool.execute<RowDataPacket[]>(
      'SELECT mois, prix FROM historique_prix WHERE produit_id = ? ORDER BY ordre_mois',
      [id]
    );

    const prixParZone: Record<string, number> = {};
    for (const z of prixZones) {
      prixParZone[z.zone_id] = z.prix;
    }

    res.json({
      success: true,
      data: {
        ...rows[0],
        prixParZone,
        historique,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
