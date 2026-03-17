# 🇸🇳 PRIXSEN

## Plateforme Nationale de Suivi du Coût de la Vie au Sénégal

---

## 📄 RÉSUMÉ EXÉCUTIF

**PRIXSEN** est une plateforme numérique citoyenne qui permet à chaque Sénégalais de consulter, comparer et signaler les prix des produits essentiels (alimentation, transport, carburant, logement) en temps réel, partout sur le territoire national.

**Problème** : Les citoyens sénégalais subissent les fluctuations de prix sans visibilité. Il n'existe aucun outil accessible et centralisé pour suivre le coût de la vie au quotidien.

**Solution** : PRIXSEN fusionne données officielles et crowdsourcing citoyen pour créer la première base de prix nationale, transparente et accessible depuis n'importe quel smartphone.

---

## 🎯 PROPOSITION DE VALEUR

| Pour qui | Valeur apportée |
|----------|----------------|
| **Citoyens** | Savoir où acheter moins cher, suivre l'évolution des prix |
| **État / Ministères** | Données terrain en temps réel sur l'inflation et le pouvoir d'achat |
| **Médias** | Source fiable pour les reportages sur le coût de la vie |
| **Commerçants** | Visibilité et comparaison avec le marché |
| **ONG / Organismes internationaux** | Indicateurs socio-économiques actualisés |
| **Chercheurs / Universitaires** | Base de données exploitable pour études économiques |

---

## 📊 FONCTIONNALITÉS CLÉS

### 1. 🛒 Suivi des Prix Alimentaires
- **8 produits essentiels** suivis : Riz, Huile, Sucre, Pain, Oignon, Pomme de terre, Lait, Poulet
- Prix moyen national et par zone géographique
- Historique sur 6 mois avec graphiques d'évolution
- Comparaison entre régions

### 2. 🚕 Prix du Transport
- Taxi urbain, bus, transport interurbain
- Prix par ville et par trajet
- Évolution mensuelle

### 3. ⛽ Prix du Carburant
- Essence Super et Gasoil
- Suivi des variations nationales
- Historique des prix à la pompe

### 4. 🏠 Prix du Logement
- Loyer moyen par zone (studio, F2, F3, F4)
- Comparaison entre quartiers et villes
- Tendances du marché immobilier

### 5. 📢 Signalement Citoyen
- Tout utilisateur peut signaler un prix observé sur le terrain
- **Upload photo du ticket de caisse** (caméra ou galerie)
- Géolocalisation par zone
- Système de modération (vérification par modérateurs)

### 6. 📈 Analyse & Inflation
- Tableau de bord visuel de l'inflation
- Produits les plus chers du moment
- Évolution mensuelle du panier moyen
- Graphiques interactifs

### 7. 🔔 Alertes Prix
- Notification en cas de hausse de prix
- Notification en cas de baisse de prix
- Alertes par zone géographique
- Personnalisation des alertes

### 8. 👤 Gestion des Comptes
- Inscription avec acceptation CGU et Politique de confidentialité
- 3 niveaux d'accès : Citoyen, Modérateur, Administrateur
- Profil personnalisable avec zone préférée
- Mode sombre

---

## 🗺️ COUVERTURE GÉOGRAPHIQUE

**14 régions du Sénégal couvertes :**

| | | |
|---|---|---|
| Dakar | Thiès | Saint-Louis |
| Diourbel | Kaolack | Ziguinchor |
| Tambacounda | Louga | Fatick |
| Kolda | Matam | Kaffrine |
| Kédougou | Sédhiou | |

---

## 📱 EXPÉRIENCE UTILISATEUR

### Design Mobile-First
- Interface optimisée pour smartphones d'entrée de gamme
- Navigation intuitive par onglets en bas d'écran
- Chargement rapide, même avec une connexion limitée
- Mode sombre pour économiser la batterie

### Accessibilité
- Interface en français (extensible au wolof et à l'anglais)
- Icônes visuelles pour les utilisateurs peu alphabétisés
- Textes clairs et lisibles
- Couleurs contrastées (bleu, vert, blanc)

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Frontend (Application Web)
| Technologie | Usage |
|-------------|-------|
| **React 18** | Framework UI moderne |
| **TypeScript** | Fiabilité du code |
| **Tailwind CSS** | Design responsive mobile-first |
| **Zustand** | Gestion d'état |
| **Recharts** | Graphiques et visualisations |
| **Framer Motion** | Animations fluides |
| **Vite** | Build ultra-rapide |

### Backend (Prêt pour intégration)
| Technologie | Usage |
|-------------|-------|
| **Node.js / Express** | API REST |
| **TypeScript** | Typage strict |
| **PostgreSQL** | Base de données relationnelle |
| **Prisma ORM** | Gestion de la base |
| **JWT** | Authentification sécurisée |
| **Redis** | Cache et performance |
| **AWS S3** | Stockage des images |

### Sécurité
- Authentification JWT (Access + Refresh Token)
- Hachage des mots de passe (bcrypt)
- CORS, Helmet, Rate Limiting
- Validation des données (Zod)
- RGPD / Protection des données personnelles

---

## 💰 MODÈLE ÉCONOMIQUE

### Sources de revenus potentielles

| Source | Description | Potentiel |
|--------|-------------|-----------|
| **B2G (État)** | Licence / abonnement pour ministères et agences gouvernementales | ⭐⭐⭐⭐⭐ |
| **Subventions** | Financement par organismes internationaux (Banque Mondiale, AFD, BAD) | ⭐⭐⭐⭐⭐ |
| **Publicité ciblée** | Annonces non-intrusives de commerçants et enseignes locales | ⭐⭐⭐ |
| **API Data** | Vente de données agrégées anonymisées à des entreprises et chercheurs | ⭐⭐⭐⭐ |
| **Premium** | Fonctionnalités avancées pour professionnels (alertes personnalisées, exports) | ⭐⭐⭐ |
| **Partenariats** | Collaboration avec opérateurs télécoms, banques, assurances | ⭐⭐⭐⭐ |

---

## 📈 MARCHÉ & POTENTIEL

### Marché cible
- **Population du Sénégal** : ~18 millions d'habitants
- **Taux de pénétration mobile** : 110% (multi-SIM)
- **Utilisateurs internet** : ~10 millions
- **Cible directe** : Tout consommateur sénégalais (ménages, commerçants, étudiants)

### Potentiel d'expansion
- 🌍 **Afrique de l'Ouest** : Adaptation pour la Côte d'Ivoire, le Mali, la Guinée, le Burkina Faso
- 🌍 **Afrique francophone** : 15+ pays avec les mêmes problématiques de transparence des prix
- 🌍 **CEDEAO** : Outil de suivi économique régional

### Avantage concurrentiel
- **Aucun concurrent direct** sur le marché sénégalais
- Combinaison unique : données officielles + crowdsourcing citoyen
- Mobile-first adapté au contexte africain
- Open data : transparence totale

---

## 🎯 IMPACT SOCIAL

### Objectifs de Développement Durable (ODD) adressés

| ODD | Contribution |
|-----|-------------|
| **ODD 1** — Pas de pauvreté | Aide les ménages à optimiser leur budget |
| **ODD 2** — Faim zéro | Suivi des prix alimentaires pour anticiper les crises |
| **ODD 10** — Réduction des inégalités | Transparence des prix pour tous |
| **ODD 11** — Villes durables | Suivi du coût du logement et transport |
| **ODD 16** — Institutions efficaces | Données ouvertes pour la gouvernance |

### Impact mesurable
- ✅ Réduction de l'asymétrie d'information entre consommateurs et vendeurs
- ✅ Outil d'alerte précoce en cas de flambée des prix
- ✅ Données exploitables pour les politiques publiques de régulation
- ✅ Autonomisation économique des citoyens
- ✅ Contribution à la lutte contre la spéculation

---

## 🗓️ FEUILLE DE ROUTE

### Phase 1 — MVP (✅ Réalisé)
- [x] Application web responsive (mobile-first)
- [x] Suivi prix alimentation, transport, carburant, logement
- [x] Signalement citoyen avec upload photo
- [x] Dashboard et graphiques d'analyse
- [x] Système d'alertes
- [x] Gestion des comptes (citoyen, modérateur, admin)
- [x] Mode sombre
- [x] Pages légales (CGU, confidentialité)

### Phase 2 — Lancement (3 mois)
- [ ] Déploiement backend + base de données PostgreSQL
- [ ] Authentification Google OAuth
- [ ] Application mobile native (React Native)
- [ ] Notifications push
- [ ] Partenariat pilote avec 2-3 régions

### Phase 3 — Croissance (6-12 mois)
- [ ] Couverture des 14 régions avec données réelles
- [ ] API publique pour développeurs et médias
- [ ] Intégration données officielles (ANSD, ministère du Commerce)
- [ ] Support multilingue (wolof, anglais)
- [ ] Système de gamification (contributeurs actifs récompensés)

### Phase 4 — Expansion (12-24 mois)
- [ ] Extension à d'autres pays d'Afrique de l'Ouest
- [ ] Intelligence artificielle (prédiction des tendances de prix)
- [ ] Partenariats avec opérateurs télécoms (USSD pour feature phones)
- [ ] Version hors-ligne pour zones à faible connectivité

---

## 👥 RÔLES UTILISATEURS

| Rôle | Droits |
|------|--------|
| **Citoyen** | Consulter les prix, signaler des prix, recevoir des alertes, personnaliser son profil |
| **Modérateur** | Tous les droits citoyens + vérifier/valider les signalements, gérer les alertes |
| **Administrateur** | Tous les droits + gérer les utilisateurs, voir les statistiques plateforme, exporter les données, configurer le système |

---

## 🔒 CONFORMITÉ & SÉCURITÉ

- **Politique de confidentialité** détaillée et accessible
- **Conditions générales d'utilisation** claires
- **Consentement obligatoire** avant inscription (2 cases à cocher)
- **Données anonymisées** pour les statistiques agrégées
- **Chiffrement** des données sensibles
- **Hébergement** conforme aux normes de la CDP (Commission de Protection des Données du Sénégal)

---

## 📞 CONTACTS & DÉMO

### Démonstration en ligne
L'application est **immédiatement testable** avec les comptes suivants :

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Citoyen | `user@test.com` | `123456` |
| Modérateur | `mod@test.com` | `123456` |
| Admin | `admin@test.com` | `123456` |

### Équipe
*[À compléter avec les noms et rôles de l'équipe]*

### Contact
*[À compléter avec email, téléphone, site web]*

---

## 📎 ANNEXES

### Documents techniques disponibles
- `docs/PRIXSEN_frontend_spec.md` — Spécification technique frontend complète
- `docs/PRIXSEN_Pitch_Document.md` — Ce document

### Captures d'écran
*Les captures d'écran de l'application sont disponibles en accédant à la démo en ligne.*

---

> **PRIXSEN** — Parce que chaque citoyen a le droit de savoir combien coûte la vie.

---

*Document confidentiel — © 2025 PRIXSEN. Tous droits réservés.*
