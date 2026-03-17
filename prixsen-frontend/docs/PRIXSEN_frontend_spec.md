# PRIXSEN — Spécification Frontend

## Stack
- React 18 + TypeScript
- Vite (build)
- Tailwind CSS v4
- Zustand (state management)
- Framer Motion (animations)
- Recharts (graphiques)
- Lucide React (icônes)

## Pages
| Route | Composant | Accès |
|-------|-----------|-------|
| accueil | Accueil.tsx | Public |
| inscription | Inscription.tsx | Public |
| confidentialite | Confidentialite.tsx | Public |
| conditions | Conditions.tsx | Public |
| dashboard | Dashboard.tsx | Connecté |
| alimentation | Alimentation.tsx | Connecté |
| transport | Transport.tsx | Connecté |
| carburant | Carburant.tsx | Connecté |
| logement | Logement.tsx | Connecté |
| signaler | Signaler.tsx | Connecté |
| analyse | Analyse.tsx | Connecté |
| alertes | Alertes.tsx | Connecté |
| profil | Profil.tsx | Connecté |

## Comptes Test
| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Citoyen | user@test.com | 123456 |
| Modérateur | mod@test.com | 123456 |
| Admin | admin@test.com | 123456 |

## Fonctionnalités
- Suivi des prix alimentaires (15 produits, 10 zones, historique 6 mois)
- Prix transport (taxi, bus, interurbain, TER)
- Prix carburant (essence, gasoil, gaz, pétrole)
- Prix logement (loyers par zone et type)
- Signalement de prix avec upload photo réel (caméra/galerie)
- Analyse d'inflation et tendances
- Alertes hausse/baisse/nouveau
- Mode sombre
- Inscription avec CGU + Confidentialité obligatoires
- Google OAuth (si VITE_GOOGLE_CLIENT_ID configuré)
- Profil avec actions par rôle (User/Modérateur/Admin)
