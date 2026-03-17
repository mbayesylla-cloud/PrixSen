// Zones du Sénégal
export const zones = [
  { id: 'dakar', name: 'Dakar', region: 'Dakar' },
  { id: 'thies', name: 'Thiès', region: 'Thiès' },
  { id: 'saint-louis', name: 'Saint-Louis', region: 'Saint-Louis' },
  { id: 'kaolack', name: 'Kaolack', region: 'Kaolack' },
  { id: 'ziguinchor', name: 'Ziguinchor', region: 'Ziguinchor' },
  { id: 'touba', name: 'Touba', region: 'Diourbel' },
  { id: 'mbour', name: 'Mbour', region: 'Thiès' },
  { id: 'tambacounda', name: 'Tambacounda', region: 'Tambacounda' },
  { id: 'kolda', name: 'Kolda', region: 'Kolda' },
  { id: 'matam', name: 'Matam', region: 'Matam' },
];

export interface ProduitAlimentaire {
  id: string;
  nom: string;
  unite: string;
  icon: string;
  prixParZone: Record<string, number>;
  historique: { mois: string; prix: number }[];
  categorie: string;
}

const mois6 = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];

function genHistorique(base: number, volatility: number = 0.05) {
  return mois6.map((m, i) => ({
    mois: m,
    prix: Math.round(base * (1 + (Math.random() - 0.4) * volatility * (i + 1))),
  }));
}

export const produitsAlimentaires: ProduitAlimentaire[] = [
  {
    id: 'riz-brise',
    nom: 'Riz brisé (kg)',
    unite: 'kg',
    icon: '🍚',
    categorie: 'Céréales',
    prixParZone: { dakar: 350, thies: 340, 'saint-louis': 360, kaolack: 330, ziguinchor: 370, touba: 325, mbour: 345, tambacounda: 380, kolda: 375, matam: 385 },
    historique: genHistorique(350),
  },
  {
    id: 'riz-parfume',
    nom: 'Riz parfumé (kg)',
    unite: 'kg',
    icon: '🍚',
    categorie: 'Céréales',
    prixParZone: { dakar: 500, thies: 490, 'saint-louis': 510, kaolack: 485, ziguinchor: 520, touba: 480, mbour: 495, tambacounda: 530, kolda: 525, matam: 535 },
    historique: genHistorique(500),
  },
  {
    id: 'huile-arachide',
    nom: 'Huile arachide (L)',
    unite: 'litre',
    icon: '🫗',
    categorie: 'Huiles',
    prixParZone: { dakar: 1200, thies: 1180, 'saint-louis': 1220, kaolack: 1150, ziguinchor: 1250, touba: 1170, mbour: 1190, tambacounda: 1280, kolda: 1260, matam: 1290 },
    historique: genHistorique(1200, 0.06),
  },
  {
    id: 'huile-palme',
    nom: 'Huile de palme (L)',
    unite: 'litre',
    icon: '🫗',
    categorie: 'Huiles',
    prixParZone: { dakar: 900, thies: 880, 'saint-louis': 920, kaolack: 870, ziguinchor: 850, touba: 890, mbour: 895, tambacounda: 940, kolda: 860, matam: 950 },
    historique: genHistorique(900, 0.05),
  },
  {
    id: 'sucre',
    nom: 'Sucre (kg)',
    unite: 'kg',
    icon: '🧂',
    categorie: 'Épicerie',
    prixParZone: { dakar: 600, thies: 590, 'saint-louis': 610, kaolack: 585, ziguinchor: 620, touba: 580, mbour: 595, tambacounda: 630, kolda: 625, matam: 640 },
    historique: genHistorique(600),
  },
  {
    id: 'pain',
    nom: 'Pain (baguette)',
    unite: 'unité',
    icon: '🥖',
    categorie: 'Boulangerie',
    prixParZone: { dakar: 175, thies: 150, 'saint-louis': 150, kaolack: 150, ziguinchor: 150, touba: 150, mbour: 150, tambacounda: 175, kolda: 150, matam: 175 },
    historique: genHistorique(165, 0.03),
  },
  {
    id: 'oignon',
    nom: 'Oignon (kg)',
    unite: 'kg',
    icon: '🧅',
    categorie: 'Légumes',
    prixParZone: { dakar: 450, thies: 430, 'saint-louis': 470, kaolack: 400, ziguinchor: 500, touba: 420, mbour: 440, tambacounda: 520, kolda: 510, matam: 530 },
    historique: genHistorique(450, 0.1),
  },
  {
    id: 'pomme-de-terre',
    nom: 'Pomme de terre (kg)',
    unite: 'kg',
    icon: '🥔',
    categorie: 'Légumes',
    prixParZone: { dakar: 500, thies: 480, 'saint-louis': 520, kaolack: 470, ziguinchor: 540, touba: 475, mbour: 490, tambacounda: 560, kolda: 550, matam: 570 },
    historique: genHistorique(500, 0.08),
  },
  {
    id: 'lait-poudre',
    nom: 'Lait en poudre (400g)',
    unite: '400g',
    icon: '🥛',
    categorie: 'Produits laitiers',
    prixParZone: { dakar: 2200, thies: 2180, 'saint-louis': 2250, kaolack: 2150, ziguinchor: 2300, touba: 2170, mbour: 2190, tambacounda: 2350, kolda: 2320, matam: 2370 },
    historique: genHistorique(2200, 0.04),
  },
  {
    id: 'lait-frais',
    nom: 'Lait frais (L)',
    unite: 'litre',
    icon: '🥛',
    categorie: 'Produits laitiers',
    prixParZone: { dakar: 800, thies: 750, 'saint-louis': 700, kaolack: 650, ziguinchor: 780, touba: 680, mbour: 760, tambacounda: 620, kolda: 600, matam: 580 },
    historique: genHistorique(700, 0.07),
  },
  {
    id: 'poulet',
    nom: 'Poulet entier (kg)',
    unite: 'kg',
    icon: '🍗',
    categorie: 'Viandes',
    prixParZone: { dakar: 2500, thies: 2400, 'saint-louis': 2450, kaolack: 2300, ziguinchor: 2600, touba: 2350, mbour: 2420, tambacounda: 2700, kolda: 2650, matam: 2750 },
    historique: genHistorique(2500, 0.06),
  },
  {
    id: 'poisson-frais',
    nom: 'Poisson frais (kg)',
    unite: 'kg',
    icon: '🐟',
    categorie: 'Poissons',
    prixParZone: { dakar: 1500, thies: 1600, 'saint-louis': 1200, kaolack: 1800, ziguinchor: 1400, touba: 2000, mbour: 1300, tambacounda: 2200, kolda: 1900, matam: 2300 },
    historique: genHistorique(1600, 0.12),
  },
  {
    id: 'tomate',
    nom: 'Tomate (kg)',
    unite: 'kg',
    icon: '🍅',
    categorie: 'Légumes',
    prixParZone: { dakar: 600, thies: 550, 'saint-louis': 580, kaolack: 500, ziguinchor: 650, touba: 520, mbour: 560, tambacounda: 700, kolda: 680, matam: 720 },
    historique: genHistorique(600, 0.15),
  },
  {
    id: 'mil',
    nom: 'Mil (kg)',
    unite: 'kg',
    icon: '🌾',
    categorie: 'Céréales',
    prixParZone: { dakar: 300, thies: 280, 'saint-louis': 290, kaolack: 250, ziguinchor: 320, touba: 260, mbour: 285, tambacounda: 240, kolda: 270, matam: 255 },
    historique: genHistorique(280, 0.06),
  },
  {
    id: 'cafe',
    nom: 'Café Touba (100g)',
    unite: '100g',
    icon: '☕',
    categorie: 'Boissons',
    prixParZone: { dakar: 500, thies: 480, 'saint-louis': 520, kaolack: 470, ziguinchor: 540, touba: 400, mbour: 490, tambacounda: 550, kolda: 530, matam: 560 },
    historique: genHistorique(500, 0.04),
  },
];

// Transport
export interface PrixTransport {
  id: string;
  type: string;
  trajet: string;
  prix: number;
  zone: string;
  icon: string;
}

export const prixTransport: PrixTransport[] = [
  { id: 't1', type: 'Taxi urbain', trajet: 'Course moyenne', prix: 1500, zone: 'dakar', icon: '🚕' },
  { id: 't2', type: 'Taxi urbain', trajet: 'Course moyenne', prix: 1000, zone: 'thies', icon: '🚕' },
  { id: 't3', type: 'Taxi urbain', trajet: 'Course moyenne', prix: 800, zone: 'saint-louis', icon: '🚕' },
  { id: 't4', type: 'Taxi urbain', trajet: 'Course moyenne', prix: 700, zone: 'kaolack', icon: '🚕' },
  { id: 't5', type: 'Bus DDD', trajet: 'Ticket standard', prix: 200, zone: 'dakar', icon: '🚌' },
  { id: 't6', type: 'Bus Tata', trajet: 'Ticket standard', prix: 150, zone: 'dakar', icon: '🚌' },
  { id: 't7', type: 'Car rapide', trajet: 'Course moyenne', prix: 150, zone: 'dakar', icon: '🚐' },
  { id: 't8', type: 'BRT', trajet: 'Ticket standard', prix: 500, zone: 'dakar', icon: '🚍' },
  { id: 't9', type: 'Clando', trajet: 'Course moyenne', prix: 200, zone: 'dakar', icon: '🚗' },
  { id: 't10', type: 'Interurbain', trajet: 'Dakar → Thiès', prix: 2500, zone: 'dakar', icon: '🚐' },
  { id: 't11', type: 'Interurbain', trajet: 'Dakar → Saint-Louis', prix: 5000, zone: 'dakar', icon: '🚐' },
  { id: 't12', type: 'Interurbain', trajet: 'Dakar → Kaolack', prix: 4000, zone: 'dakar', icon: '🚐' },
  { id: 't13', type: 'Interurbain', trajet: 'Dakar → Ziguinchor', prix: 8000, zone: 'dakar', icon: '🚐' },
  { id: 't14', type: 'Interurbain', trajet: 'Dakar → Touba', prix: 4500, zone: 'dakar', icon: '🚐' },
  { id: 't15', type: 'TER', trajet: 'Dakar → Diamniadio', prix: 500, zone: 'dakar', icon: '🚆' },
];

// Carburant
export interface PrixCarburant {
  type: string;
  prix: number;
  icon: string;
  historique: { mois: string; prix: number }[];
}

export const prixCarburant: PrixCarburant[] = [
  {
    type: 'Super (essence)',
    prix: 990,
    icon: '⛽',
    historique: [
      { mois: 'Jan', prix: 945 },
      { mois: 'Fév', prix: 950 },
      { mois: 'Mar', prix: 965 },
      { mois: 'Avr', prix: 975 },
      { mois: 'Mai', prix: 985 },
      { mois: 'Jun', prix: 990 },
    ],
  },
  {
    type: 'Gasoil',
    prix: 880,
    icon: '⛽',
    historique: [
      { mois: 'Jan', prix: 830 },
      { mois: 'Fév', prix: 840 },
      { mois: 'Mar', prix: 855 },
      { mois: 'Avr', prix: 860 },
      { mois: 'Mai', prix: 870 },
      { mois: 'Jun', prix: 880 },
    ],
  },
  {
    type: 'Pétrole lampant',
    prix: 665,
    icon: '🪔',
    historique: [
      { mois: 'Jan', prix: 630 },
      { mois: 'Fév', prix: 635 },
      { mois: 'Mar', prix: 645 },
      { mois: 'Avr', prix: 650 },
      { mois: 'Mai', prix: 660 },
      { mois: 'Jun', prix: 665 },
    ],
  },
  {
    type: 'Gaz butane (6kg)',
    prix: 2885,
    icon: '🔥',
    historique: [
      { mois: 'Jan', prix: 2785 },
      { mois: 'Fév', prix: 2800 },
      { mois: 'Mar', prix: 2830 },
      { mois: 'Avr', prix: 2850 },
      { mois: 'Mai', prix: 2870 },
      { mois: 'Jun', prix: 2885 },
    ],
  },
];

// Logement
export interface PrixLogement {
  id: string;
  type: string;
  zone: string;
  prixMoyen: number;
  historique: { mois: string; prix: number }[];
}

export const prixLogement: PrixLogement[] = [
  { id: 'l1', type: 'Studio', zone: 'dakar', prixMoyen: 75000, historique: genHistorique(75000, 0.03) },
  { id: 'l2', type: 'F2', zone: 'dakar', prixMoyen: 120000, historique: genHistorique(120000, 0.03) },
  { id: 'l3', type: 'F3', zone: 'dakar', prixMoyen: 180000, historique: genHistorique(180000, 0.03) },
  { id: 'l4', type: 'F4', zone: 'dakar', prixMoyen: 250000, historique: genHistorique(250000, 0.03) },
  { id: 'l5', type: 'Studio', zone: 'thies', prixMoyen: 40000, historique: genHistorique(40000, 0.03) },
  { id: 'l6', type: 'F2', zone: 'thies', prixMoyen: 65000, historique: genHistorique(65000, 0.03) },
  { id: 'l7', type: 'F3', zone: 'thies', prixMoyen: 90000, historique: genHistorique(90000, 0.03) },
  { id: 'l8', type: 'Studio', zone: 'saint-louis', prixMoyen: 35000, historique: genHistorique(35000, 0.03) },
  { id: 'l9', type: 'F2', zone: 'saint-louis', prixMoyen: 55000, historique: genHistorique(55000, 0.03) },
  { id: 'l10', type: 'F3', zone: 'saint-louis', prixMoyen: 80000, historique: genHistorique(80000, 0.03) },
  { id: 'l11', type: 'Studio', zone: 'kaolack', prixMoyen: 30000, historique: genHistorique(30000, 0.03) },
  { id: 'l12', type: 'F2', zone: 'kaolack', prixMoyen: 50000, historique: genHistorique(50000, 0.03) },
  { id: 'l13', type: 'Studio', zone: 'ziguinchor', prixMoyen: 28000, historique: genHistorique(28000, 0.03) },
  { id: 'l14', type: 'F2', zone: 'ziguinchor', prixMoyen: 45000, historique: genHistorique(45000, 0.03) },
  { id: 'l15', type: 'Studio', zone: 'touba', prixMoyen: 25000, historique: genHistorique(25000, 0.03) },
  { id: 'l16', type: 'F2', zone: 'touba', prixMoyen: 40000, historique: genHistorique(40000, 0.03) },
  { id: 'l17', type: 'Studio', zone: 'mbour', prixMoyen: 45000, historique: genHistorique(45000, 0.03) },
  { id: 'l18', type: 'F2', zone: 'mbour', prixMoyen: 70000, historique: genHistorique(70000, 0.03) },
];

// Signalements
export interface Signalement {
  id: string;
  produit: string;
  prix: number;
  zone: string;
  date: string;
  utilisateur: string;
  verifie: boolean;
  photo: boolean;
  photoUrl?: string;
}

const produitsSignalement = ['Riz brisé', 'Huile arachide', 'Sucre', 'Pain', 'Oignon', 'Pomme de terre', 'Lait poudre', 'Poulet', 'Tomate', 'Poisson frais', 'Mil', 'Café Touba'];
const zonesSignalement = zones.map(z => z.name);
const utilisateurs = ['Mamadou D.', 'Fatou S.', 'Ousmane N.', 'Aminata B.', 'Ibrahima F.', 'Marieme K.', 'Abdoulaye T.', 'Aissatou D.', 'Cheikh M.', 'Sokhna G.'];

export const signalements: Signalement[] = Array.from({ length: 100 }, (_, i) => ({
  id: `sig-${i + 1}`,
  produit: produitsSignalement[Math.floor(Math.random() * produitsSignalement.length)],
  prix: Math.round((200 + Math.random() * 2500) / 25) * 25,
  zone: zonesSignalement[Math.floor(Math.random() * zonesSignalement.length)],
  date: `2025-0${Math.floor(Math.random() * 6) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
  utilisateur: utilisateurs[Math.floor(Math.random() * utilisateurs.length)],
  verifie: Math.random() > 0.4,
  photo: Math.random() > 0.5,
}));

// Alertes
export interface Alerte {
  id: string;
  type: 'hausse' | 'baisse' | 'nouveau';
  produit: string;
  zone: string;
  message: string;
  date: string;
  lue: boolean;
}

export const alertes: Alerte[] = [
  { id: 'a1', type: 'hausse', produit: 'Oignon', zone: 'Dakar', message: 'Le prix de l\'oignon a augmenté de 15% à Dakar', date: '2025-06-15', lue: false },
  { id: 'a2', type: 'hausse', produit: 'Huile arachide', zone: 'National', message: 'Hausse nationale de l\'huile d\'arachide (+8%)', date: '2025-06-14', lue: false },
  { id: 'a3', type: 'baisse', produit: 'Riz brisé', zone: 'Kaolack', message: 'Le riz brisé a baissé de 5% à Kaolack', date: '2025-06-13', lue: true },
  { id: 'a4', type: 'nouveau', produit: 'Tomate', zone: 'Ziguinchor', message: 'Nouveaux prix signalés pour la tomate à Ziguinchor', date: '2025-06-12', lue: true },
  { id: 'a5', type: 'hausse', produit: 'Poulet', zone: 'Tambacounda', message: 'Le poulet a augmenté de 10% à Tambacounda', date: '2025-06-11', lue: true },
  { id: 'a6', type: 'baisse', produit: 'Pomme de terre', zone: 'Thiès', message: 'Baisse du prix de la pomme de terre à Thiès (-7%)', date: '2025-06-10', lue: true },
  { id: 'a7', type: 'hausse', produit: 'Carburant', zone: 'National', message: 'Ajustement du prix du carburant super (+2%)', date: '2025-06-09', lue: true },
  { id: 'a8', type: 'nouveau', produit: 'Lait', zone: 'Matam', message: '12 nouveaux prix signalés à Matam', date: '2025-06-08', lue: true },
];

// Utilisateurs
export interface Utilisateur {
  email: string;
  password: string;
  nom: string;
  role: 'user' | 'moderator' | 'admin';
  zone: string;
  signalements: number;
  avatar: string;
}

export const utilisateursTest: Utilisateur[] = [
  { email: 'user@test.com', password: '123456', nom: 'Citoyen Test', role: 'user', zone: 'Dakar', signalements: 0, avatar: '👤' },
  { email: 'mod@test.com', password: '123456', nom: 'Modérateur Test', role: 'moderator', zone: 'Thiès', signalements: 0, avatar: '🛡️' },
  { email: 'admin@test.com', password: '123456', nom: 'Admin Test', role: 'admin', zone: 'Dakar', signalements: 0, avatar: '👨‍💻' },
];

// Helper functions
export function getPrixMoyenNational(produit: ProduitAlimentaire): number {
  const vals = Object.values(produit.prixParZone);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function getZoneMoinsChere(produit: ProduitAlimentaire): string {
  const entries = Object.entries(produit.prixParZone);
  entries.sort((a, b) => a[1] - b[1]);
  const zone = zones.find(z => z.id === entries[0][0]);
  return zone?.name || entries[0][0];
}

export function getZonePlusChere(produit: ProduitAlimentaire): string {
  const entries = Object.entries(produit.prixParZone);
  entries.sort((a, b) => b[1] - a[1]);
  const zone = zones.find(z => z.id === entries[0][0]);
  return zone?.name || entries[0][0];
}

export function formatPrix(prix: number): string {
  return new Intl.NumberFormat('fr-FR').format(prix) + ' F';
}
