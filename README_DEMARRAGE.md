# 🇸🇳 PRIXSEN — Guide de démarrage

## Installation rapide

### 1. Backend
```bash
cd prixsen-backend
cp .env.example .env
# Éditer .env : remplir DB_PASSWORD, et remplacer les JWT_SECRET par des valeurs aléatoires
# openssl rand -base64 64  (à exécuter deux fois, pour JWT_SECRET et JWT_REFRESH_SECRET)

npm install
```

### 2. Base de données
```bash
# Créer la base et les tables (voir GUIDE_BD.md)
mysql -u root < GUIDE_BD.sql   # ou exécuter GUIDE_BD.md étape par étape

# Remplir avec les données initiales
npm run seed
```

### 3. Frontend
```bash
cd prixsen-frontend
npm install
```

---

## Démarrage

**Terminal 1 — Backend :**
```bash
cd prixsen-backend
npm run dev
# → http://localhost:3001
```

**Terminal 2 — Frontend :**
```bash
cd prixsen-frontend
npm run dev
# → http://localhost:5173
```

---

## Comptes de test

| Rôle        | Email             | Mot de passe |
|-------------|-------------------|-------------|
| Citoyen     | user@test.com     | 123456      |
| Modérateur  | mod@test.com      | 123456      |
| Admin       | admin@test.com    | 123456      |

---

## Variables d'environnement importantes

| Variable              | Description                                    | Obligatoire |
|-----------------------|------------------------------------------------|-------------|
| `JWT_SECRET`          | Secret de signature des access tokens (64+ chars) | ✅ |
| `JWT_REFRESH_SECRET`  | Secret des refresh tokens (différent du précédent) | ✅ |
| `DB_PASSWORD`         | Mot de passe MySQL                             | Si nécessaire |
| `GOOGLE_CLIENT_ID`    | Client ID Google OAuth                         | Non (désactive Google login) |
| `FRONTEND_URL`        | URL du frontend pour CORS                      | En prod |

> ⚠️ Ne jamais utiliser les secrets par défaut en production.
> Générer avec : `openssl rand -base64 64`

---

## Architecture

```
prixsen-backend/
  src/
    controllers/   — Logique métier (auth, signalements, alertes, prix, users)
    middlewares/   — Authentification JWT + contrôle des rôles
    routes/        — Définition des routes API
    config/        — Connexion MySQL (pool)
  uploads/         — Photos des signalements (multer)

prixsen-frontend/
  src/
    pages/         — Composants de page (Dashboard, Alimentation, etc.)
    components/    — Layout, navigation
    store/         — État global Zustand (useStore.ts)
    services/      — Couche API fetch (api.ts)
    data/          — mockData.ts (utilitaires de formatage uniquement)
```

---

## Fonctionnalités

- 🔐 Authentification JWT (access token 15min + refresh token 7j)
- 🔑 Connexion Google OAuth (configurer `GOOGLE_CLIENT_ID`)
- 🛡️ 3 niveaux de rôles : Citoyen / Modérateur / Admin
- 📊 Suivi des prix : alimentation, transport, carburant, logement
- 📍 10 zones géographiques du Sénégal
- 📸 Signalements avec photo (max 5 Mo)
- 🔔 Alertes de variation de prix
- 📈 Analyse et tendances d'inflation (données réelles)
- 🌙 Mode sombre persisté

---

## Notes de sécurité

- Les refresh tokens sont stockés **hashés (SHA-256)** en base de données
- Rate limiting : 200 req/15min global, 10 req/15min pour les endpoints auth
- CORS configuré sur `FRONTEND_URL` uniquement
- Le mode dev Google (sans vérification de signature) est **bloqué en production**

