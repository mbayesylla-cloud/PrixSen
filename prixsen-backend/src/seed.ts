import pool from './config/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Démarrage du seeding PRIXSEN...\n');

  // ====== ZONES ======
  console.log('📍 Insertion des zones...');
  const zones = [
    ['dakar', 'Dakar', 'Dakar'],
    ['thies', 'Thiès', 'Thiès'],
    ['saint-louis', 'Saint-Louis', 'Saint-Louis'],
    ['kaolack', 'Kaolack', 'Kaolack'],
    ['ziguinchor', 'Ziguinchor', 'Ziguinchor'],
    ['touba', 'Touba', 'Diourbel'],
    ['mbour', 'Mbour', 'Thiès'],
    ['tambacounda', 'Tambacounda', 'Tambacounda'],
    ['kolda', 'Kolda', 'Kolda'],
    ['matam', 'Matam', 'Matam'],
  ];

  for (const [id, nom, region] of zones) {
    await pool.execute(
      'INSERT IGNORE INTO zones (id, nom, region) VALUES (?, ?, ?)',
      [id, nom, region]
    );
  }

  // ====== UTILISATEURS ======
  console.log('👥 Insertion des utilisateurs test...');
  const users = [
    { email: 'user@test.com', password: '123456', nom: 'Citoyen Test', role: 'user', zone: 'Dakar', avatar: '👤' },
    { email: 'mod@test.com', password: '123456', nom: 'Modérateur Test', role: 'moderator', zone: 'Thiès', avatar: '🛡️' },
    { email: 'admin@test.com', password: '123456', nom: 'Admin Test', role: 'admin', zone: 'Dakar', avatar: '👨‍💻' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    await pool.execute(
      `INSERT IGNORE INTO utilisateurs (nom, email, password_hash, role, zone, avatar, signalements_count)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [u.nom, u.email, hash, u.role, u.zone, u.avatar]
    );
  }

  // ====== PRODUITS ALIMENTAIRES ======
  console.log('🛒 Insertion des produits alimentaires...');
  const produits = [
    { id: 'riz-brise', nom: 'Riz brisé (kg)', unite: 'kg', icon: '🍚', categorie: 'Céréales', prixNat: 350,
      zones: { dakar: 350, thies: 340, 'saint-louis': 360, kaolack: 330, ziguinchor: 370, touba: 325, mbour: 345, tambacounda: 380, kolda: 375, matam: 385 },
      histo: [350, 345, 352, 348, 355, 350] },
    { id: 'riz-parfume', nom: 'Riz parfumé (kg)', unite: 'kg', icon: '🍚', categorie: 'Céréales', prixNat: 500,
      zones: { dakar: 500, thies: 490, 'saint-louis': 510, kaolack: 485, ziguinchor: 520, touba: 480, mbour: 495, tambacounda: 530, kolda: 525, matam: 535 },
      histo: [480, 485, 490, 492, 498, 500] },
    { id: 'huile-arachide', nom: 'Huile arachide (L)', unite: 'litre', icon: '🫗', categorie: 'Huiles', prixNat: 1200,
      zones: { dakar: 1200, thies: 1180, 'saint-louis': 1220, kaolack: 1150, ziguinchor: 1250, touba: 1170, mbour: 1190, tambacounda: 1280, kolda: 1260, matam: 1290 },
      histo: [1140, 1150, 1165, 1175, 1190, 1200] },
    { id: 'huile-palme', nom: 'Huile de palme (L)', unite: 'litre', icon: '🫗', categorie: 'Huiles', prixNat: 900,
      zones: { dakar: 900, thies: 880, 'saint-louis': 920, kaolack: 870, ziguinchor: 850, touba: 890, mbour: 895, tambacounda: 940, kolda: 860, matam: 950 },
      histo: [860, 868, 875, 882, 890, 900] },
    { id: 'sucre', nom: 'Sucre (kg)', unite: 'kg', icon: '🧂', categorie: 'Épicerie', prixNat: 600,
      zones: { dakar: 600, thies: 590, 'saint-louis': 610, kaolack: 585, ziguinchor: 620, touba: 580, mbour: 595, tambacounda: 630, kolda: 625, matam: 640 },
      histo: [580, 583, 588, 590, 596, 600] },
    { id: 'pain', nom: 'Pain (baguette)', unite: 'unité', icon: '🥖', categorie: 'Boulangerie', prixNat: 165,
      zones: { dakar: 175, thies: 150, 'saint-louis': 150, kaolack: 150, ziguinchor: 150, touba: 150, mbour: 150, tambacounda: 175, kolda: 150, matam: 175 },
      histo: [160, 160, 162, 163, 165, 165] },
    { id: 'oignon', nom: 'Oignon (kg)', unite: 'kg', icon: '🧅', categorie: 'Légumes', prixNat: 450,
      zones: { dakar: 450, thies: 430, 'saint-louis': 470, kaolack: 400, ziguinchor: 500, touba: 420, mbour: 440, tambacounda: 520, kolda: 510, matam: 530 },
      histo: [380, 400, 415, 430, 442, 450] },
    { id: 'pomme-de-terre', nom: 'Pomme de terre (kg)', unite: 'kg', icon: '🥔', categorie: 'Légumes', prixNat: 500,
      zones: { dakar: 500, thies: 480, 'saint-louis': 520, kaolack: 470, ziguinchor: 540, touba: 475, mbour: 490, tambacounda: 560, kolda: 550, matam: 570 },
      histo: [470, 478, 485, 490, 496, 500] },
    { id: 'lait-poudre', nom: 'Lait en poudre (400g)', unite: '400g', icon: '🥛', categorie: 'Produits laitiers', prixNat: 2200,
      zones: { dakar: 2200, thies: 2180, 'saint-louis': 2250, kaolack: 2150, ziguinchor: 2300, touba: 2170, mbour: 2190, tambacounda: 2350, kolda: 2320, matam: 2370 },
      histo: [2150, 2160, 2170, 2180, 2192, 2200] },
    { id: 'lait-frais', nom: 'Lait frais (L)', unite: 'litre', icon: '🥛', categorie: 'Produits laitiers', prixNat: 700,
      zones: { dakar: 800, thies: 750, 'saint-louis': 700, kaolack: 650, ziguinchor: 780, touba: 680, mbour: 760, tambacounda: 620, kolda: 600, matam: 580 },
      histo: [670, 678, 685, 690, 696, 700] },
    { id: 'poulet', nom: 'Poulet entier (kg)', unite: 'kg', icon: '🍗', categorie: 'Viandes', prixNat: 2500,
      zones: { dakar: 2500, thies: 2400, 'saint-louis': 2450, kaolack: 2300, ziguinchor: 2600, touba: 2350, mbour: 2420, tambacounda: 2700, kolda: 2650, matam: 2750 },
      histo: [2350, 2380, 2410, 2440, 2470, 2500] },
    { id: 'poisson-frais', nom: 'Poisson frais (kg)', unite: 'kg', icon: '🐟', categorie: 'Poissons', prixNat: 1600,
      zones: { dakar: 1500, thies: 1600, 'saint-louis': 1200, kaolack: 1800, ziguinchor: 1400, touba: 2000, mbour: 1300, tambacounda: 2200, kolda: 1900, matam: 2300 },
      histo: [1500, 1520, 1548, 1562, 1580, 1600] },
    { id: 'tomate', nom: 'Tomate (kg)', unite: 'kg', icon: '🍅', categorie: 'Légumes', prixNat: 600,
      zones: { dakar: 600, thies: 550, 'saint-louis': 580, kaolack: 500, ziguinchor: 650, touba: 520, mbour: 560, tambacounda: 700, kolda: 680, matam: 720 },
      histo: [510, 535, 555, 570, 585, 600] },
    { id: 'mil', nom: 'Mil (kg)', unite: 'kg', icon: '🌾', categorie: 'Céréales', prixNat: 280,
      zones: { dakar: 300, thies: 280, 'saint-louis': 290, kaolack: 250, ziguinchor: 320, touba: 260, mbour: 285, tambacounda: 240, kolda: 270, matam: 255 },
      histo: [265, 268, 272, 275, 278, 280] },
    { id: 'cafe', nom: 'Café Touba (100g)', unite: '100g', icon: '☕', categorie: 'Boissons', prixNat: 500,
      zones: { dakar: 500, thies: 480, 'saint-louis': 520, kaolack: 470, ziguinchor: 540, touba: 400, mbour: 490, tambacounda: 550, kolda: 530, matam: 560 },
      histo: [482, 486, 490, 493, 497, 500] },
  ];

  const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];

  for (const p of produits) {
    await pool.execute(
      'INSERT IGNORE INTO produits_alimentaires (id, nom, unite, icon, categorie, prix_moyen_national) VALUES (?, ?, ?, ?, ?, ?)',
      [p.id, p.nom, p.unite, p.icon, p.categorie, p.prixNat]
    );

    for (const [zoneId, prix] of Object.entries(p.zones)) {
      await pool.execute(
        'INSERT IGNORE INTO prix_par_zone (produit_id, zone_id, prix) VALUES (?, ?, ?)',
        [p.id, zoneId, prix]
      );
    }

    for (let i = 0; i < p.histo.length; i++) {
      await pool.execute(
        'INSERT IGNORE INTO historique_prix (produit_id, mois, prix, ordre_mois) VALUES (?, ?, ?, ?)',
        [p.id, mois[i], p.histo[i], i + 1]
      );
    }
  }

  // ====== TRANSPORT ======
  console.log('🚕 Insertion des prix transport...');
  const transport = [
    ['t1', 'Taxi urbain', 'Course moyenne', 1500, 'dakar', '🚕'],
    ['t2', 'Taxi urbain', 'Course moyenne', 1000, 'thies', '🚕'],
    ['t3', 'Taxi urbain', 'Course moyenne', 800, 'saint-louis', '🚕'],
    ['t4', 'Taxi urbain', 'Course moyenne', 700, 'kaolack', '🚕'],
    ['t5', 'Bus DDD', 'Ticket standard', 200, 'dakar', '🚌'],
    ['t6', 'Bus Tata', 'Ticket standard', 150, 'dakar', '🚌'],
    ['t7', 'Car rapide', 'Course moyenne', 150, 'dakar', '🚐'],
    ['t8', 'BRT', 'Ticket standard', 500, 'dakar', '🚍'],
    ['t9', 'Clando', 'Course moyenne', 200, 'dakar', '🚗'],
    ['t10', 'Interurbain', 'Dakar → Thiès', 2500, 'dakar', '🚐'],
    ['t11', 'Interurbain', 'Dakar → Saint-Louis', 5000, 'dakar', '🚐'],
    ['t12', 'Interurbain', 'Dakar → Kaolack', 4000, 'dakar', '🚐'],
    ['t13', 'Interurbain', 'Dakar → Ziguinchor', 8000, 'dakar', '🚐'],
    ['t14', 'Interurbain', 'Dakar → Touba', 4500, 'dakar', '🚐'],
    ['t15', 'TER', 'Dakar → Diamniadio', 500, 'dakar', '🚆'],
  ];

  for (const [id, type, trajet, prix, zone, icon] of transport) {
    await pool.execute(
      'INSERT IGNORE INTO prix_transport (id, type, trajet, prix, zone, icon) VALUES (?, ?, ?, ?, ?, ?)',
      [id, type, trajet, prix, zone, icon]
    );
  }

  // ====== CARBURANT ======
  console.log('⛽ Insertion des prix carburant...');
  const carburants = [
    { id: 1, type: 'Super (essence)', prix: 990, icon: '⛽', histo: [945, 950, 965, 975, 985, 990] },
    { id: 2, type: 'Gasoil', prix: 880, icon: '⛽', histo: [830, 840, 855, 860, 870, 880] },
    { id: 3, type: 'Pétrole lampant', prix: 665, icon: '🪔', histo: [630, 635, 645, 650, 660, 665] },
    { id: 4, type: 'Gaz butane (6kg)', prix: 2885, icon: '🔥', histo: [2785, 2800, 2830, 2850, 2870, 2885] },
  ];

  for (const c of carburants) {
    await pool.execute(
      'INSERT IGNORE INTO prix_carburant (id, type, prix, icon) VALUES (?, ?, ?, ?)',
      [c.id, c.type, c.prix, c.icon]
    );
    for (let i = 0; i < c.histo.length; i++) {
      await pool.execute(
        'INSERT IGNORE INTO historique_carburant (carburant_id, mois, prix, ordre_mois) VALUES (?, ?, ?, ?)',
        [c.id, mois[i], c.histo[i], i + 1]
      );
    }
  }

  // ====== LOGEMENT ======
  console.log('🏠 Insertion des prix logement...');
  const logements = [
    [1, 'Studio', 'dakar', 75000, [73000, 73500, 74000, 74500, 74800, 75000]],
    [2, 'F2', 'dakar', 120000, [116000, 117000, 118000, 119000, 119500, 120000]],
    [3, 'F3', 'dakar', 180000, [175000, 176000, 177000, 178000, 179000, 180000]],
    [4, 'F4', 'dakar', 250000, [243000, 244000, 246000, 247000, 249000, 250000]],
    [5, 'Studio', 'thies', 40000, [38800, 39000, 39200, 39500, 39800, 40000]],
    [6, 'F2', 'thies', 65000, [63000, 63500, 64000, 64500, 64800, 65000]],
    [7, 'F3', 'thies', 90000, [87000, 88000, 88500, 89000, 89500, 90000]],
    [8, 'Studio', 'saint-louis', 35000, [34000, 34200, 34500, 34700, 34900, 35000]],
    [9, 'F2', 'saint-louis', 55000, [53000, 53500, 54000, 54500, 54800, 55000]],
    [10, 'F3', 'saint-louis', 80000, [77000, 78000, 78500, 79000, 79500, 80000]],
    [11, 'Studio', 'kaolack', 30000, [29000, 29200, 29500, 29700, 29900, 30000]],
    [12, 'F2', 'kaolack', 50000, [48000, 48500, 49000, 49500, 49800, 50000]],
    [13, 'Studio', 'ziguinchor', 28000, [27000, 27200, 27500, 27700, 27900, 28000]],
    [14, 'F2', 'ziguinchor', 45000, [43000, 43500, 44000, 44500, 44800, 45000]],
    [15, 'Studio', 'touba', 25000, [24000, 24200, 24500, 24700, 24900, 25000]],
    [16, 'F2', 'touba', 40000, [38500, 39000, 39200, 39500, 39800, 40000]],
    [17, 'Studio', 'mbour', 45000, [43500, 44000, 44200, 44500, 44800, 45000]],
    [18, 'F2', 'mbour', 70000, [68000, 68500, 69000, 69500, 69800, 70000]],
  ];

  for (const [id, type, zoneId, prixMoyen, histo] of logements) {
    await pool.execute(
      'INSERT IGNORE INTO prix_logement (id, type, zone_id, prix_moyen) VALUES (?, ?, ?, ?)',
      [id, type, zoneId, prixMoyen]
    );
    for (let i = 0; i < (histo as number[]).length; i++) {
      await pool.execute(
        'INSERT IGNORE INTO historique_logement (logement_id, mois, prix, ordre_mois) VALUES (?, ?, ?, ?)',
        [id, mois[i], (histo as number[])[i], i + 1]
      );
    }
  }

  // ====== ALERTES ======
  console.log('🔔 Insertion des alertes...');
  const alertes = [
    ['hausse', 'Oignon', 'Dakar', "Le prix de l'oignon a augmenté de 15% à Dakar"],
    ['hausse', 'Huile arachide', 'National', "Hausse nationale de l'huile d'arachide (+8%)"],
    ['baisse', 'Riz brisé', 'Kaolack', 'Le riz brisé a baissé de 5% à Kaolack'],
    ['nouveau', 'Tomate', 'Ziguinchor', 'Nouveaux prix signalés pour la tomate à Ziguinchor'],
    ['hausse', 'Poulet', 'Tambacounda', 'Le poulet a augmenté de 10% à Tambacounda'],
    ['baisse', 'Pomme de terre', 'Thiès', 'Baisse du prix de la pomme de terre à Thiès (-7%)'],
    ['hausse', 'Carburant', 'National', 'Ajustement du prix du carburant super (+2%)'],
    ['nouveau', 'Lait', 'Matam', '12 nouveaux prix signalés à Matam'],
  ];

  for (const [type, produit, zone, message] of alertes) {
    await pool.execute(
      'INSERT IGNORE INTO alertes (type, produit, zone, message) VALUES (?, ?, ?, ?)',
      [type, produit, zone, message]
    );
  }

  console.log('\n✅ Seeding terminé avec succès !');
  console.log('📧 Comptes test créés:');
  console.log('   - user@test.com / 123456 (Citoyen)');
  console.log('   - mod@test.com / 123456 (Modérateur)');
  console.log('   - admin@test.com / 123456 (Admin)');

  await pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Erreur seeding:', err);
  process.exit(1);
});
