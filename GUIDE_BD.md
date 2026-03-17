# 📦 GUIDE_BD — PRIXSEN
## Guide de Création de la Base de Données MySQL

---

## 🔧 PRÉREQUIS

- MySQL 8.0 ou supérieur installé
- Accès root : `root` / mot de passe : *(vide)*
- Client MySQL : ligne de commande, MySQL Workbench, ou DBeaver

---

## 🚀 ÉTAPE 1 — Connexion à MySQL

```bash
mysql -u root
```

---

## 🗄️ ÉTAPE 2 — Création de la base de données

```sql
CREATE DATABASE IF NOT EXISTS prixsen_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE prixsen_db;
```

---

## 📋 ÉTAPE 3 — Création des tables

Exécutez les instructions SQL suivantes **dans l'ordre** :

---

### Table `zones` — Régions géographiques du Sénégal

```sql
CREATE TABLE IF NOT EXISTS zones (
  id        VARCHAR(50)  PRIMARY KEY,
  nom       VARCHAR(100) NOT NULL,
  region    VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### Table `utilisateurs` — Comptes utilisateurs

```sql
CREATE TABLE IF NOT EXISTS utilisateurs (
  id                INT          AUTO_INCREMENT PRIMARY KEY,
  nom               VARCHAR(100) NOT NULL,
  email             VARCHAR(150) NOT NULL UNIQUE,
  password_hash     VARCHAR(255) NOT NULL DEFAULT '',
  role              ENUM('user', 'moderator', 'admin') NOT NULL DEFAULT 'user',
  zone              VARCHAR(100) NOT NULL DEFAULT 'Dakar',
  avatar            VARCHAR(255) DEFAULT '👤',
  signalements_count INT         NOT NULL DEFAULT 0,
  banned            TINYINT(1)  NOT NULL DEFAULT 0,
  refresh_token     VARCHAR(64) DEFAULT NULL, -- SHA-256 hex du token (64 chars)
  last_login        DATETIME    DEFAULT NULL,
  created_at        DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_role  (role)
);
```

---

### Table `produits_alimentaires` — Catalogue des produits

```sql
CREATE TABLE IF NOT EXISTS produits_alimentaires (
  id                   VARCHAR(50)  PRIMARY KEY,
  nom                  VARCHAR(150) NOT NULL,
  unite                VARCHAR(50)  NOT NULL,
  icon                 VARCHAR(10)  DEFAULT '🛒',
  categorie            VARCHAR(100) NOT NULL,
  prix_moyen_national  INT          NOT NULL DEFAULT 0,
  created_at           DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_categorie (categorie)
);
```

---

### Table `prix_par_zone` — Prix de chaque produit par zone

```sql
CREATE TABLE IF NOT EXISTS prix_par_zone (
  id         INT         AUTO_INCREMENT PRIMARY KEY,
  produit_id VARCHAR(50) NOT NULL,
  zone_id    VARCHAR(50) NOT NULL,
  prix       INT         NOT NULL,
  updated_at DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_produit_zone (produit_id, zone_id),
  FOREIGN KEY (produit_id) REFERENCES produits_alimentaires(id) ON DELETE CASCADE,
  FOREIGN KEY (zone_id)    REFERENCES zones(id) ON DELETE CASCADE
);
```

---

### Table `historique_prix` — Historique mensuel des prix alimentaires

```sql
CREATE TABLE IF NOT EXISTS historique_prix (
  id         INT         AUTO_INCREMENT PRIMARY KEY,
  produit_id VARCHAR(50) NOT NULL,
  mois       VARCHAR(10) NOT NULL,
  prix       INT         NOT NULL,
  ordre_mois INT         NOT NULL DEFAULT 1,

  UNIQUE KEY uk_produit_mois (produit_id, ordre_mois),
  FOREIGN KEY (produit_id) REFERENCES produits_alimentaires(id) ON DELETE CASCADE
);
```

---

### Table `prix_transport` — Prix des transports

```sql
CREATE TABLE IF NOT EXISTS prix_transport (
  id        VARCHAR(10)  PRIMARY KEY,
  type      VARCHAR(100) NOT NULL,
  trajet    VARCHAR(150) NOT NULL,
  prix      INT          NOT NULL,
  zone      VARCHAR(50)  NOT NULL DEFAULT 'dakar',
  icon      VARCHAR(10)  DEFAULT '🚌',
  updated_at DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_zone (zone)
);
```

---

### Table `prix_carburant` — Prix des carburants

```sql
CREATE TABLE IF NOT EXISTS prix_carburant (
  id        INT          AUTO_INCREMENT PRIMARY KEY,
  type      VARCHAR(100) NOT NULL UNIQUE,
  prix      INT          NOT NULL,
  icon      VARCHAR(10)  DEFAULT '⛽',
  updated_at DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### Table `historique_carburant` — Historique mensuel carburant

```sql
CREATE TABLE IF NOT EXISTS historique_carburant (
  id           INT         AUTO_INCREMENT PRIMARY KEY,
  carburant_id INT         NOT NULL,
  mois         VARCHAR(10) NOT NULL,
  prix         INT         NOT NULL,
  ordre_mois   INT         NOT NULL DEFAULT 1,

  UNIQUE KEY uk_carburant_mois (carburant_id, ordre_mois),
  FOREIGN KEY (carburant_id) REFERENCES prix_carburant(id) ON DELETE CASCADE
);
```

---

### Table `prix_logement` — Prix des logements par zone et type

```sql
CREATE TABLE IF NOT EXISTS prix_logement (
  id         INT         AUTO_INCREMENT PRIMARY KEY,
  type       ENUM('Studio', 'F2', 'F3', 'F4') NOT NULL,
  zone_id    VARCHAR(50) NOT NULL,
  prix_moyen INT         NOT NULL,
  updated_at DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_type_zone (type, zone_id),
  FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE CASCADE
);
```

---

### Table `historique_logement` — Historique mensuel logement

```sql
CREATE TABLE IF NOT EXISTS historique_logement (
  id          INT         AUTO_INCREMENT PRIMARY KEY,
  logement_id INT         NOT NULL,
  mois        VARCHAR(10) NOT NULL,
  prix        INT         NOT NULL,
  ordre_mois  INT         NOT NULL DEFAULT 1,

  UNIQUE KEY uk_logement_mois (logement_id, ordre_mois),
  FOREIGN KEY (logement_id) REFERENCES prix_logement(id) ON DELETE CASCADE
);
```

---

### Table `signalements` — Signalements citoyens de prix

```sql
CREATE TABLE IF NOT EXISTS signalements (
  id              INT          AUTO_INCREMENT PRIMARY KEY,
  produit         VARCHAR(150) NOT NULL,
  prix            INT          NOT NULL,
  zone            VARCHAR(100) NOT NULL,
  categorie       VARCHAR(100) DEFAULT NULL,
  utilisateur_id  INT          DEFAULT NULL,
  photo_url       VARCHAR(500) DEFAULT NULL,
  verifie         TINYINT(1)  NOT NULL DEFAULT 0,
  verified_by     INT          DEFAULT NULL,
  verified_at     DATETIME     DEFAULT NULL,
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_zone     (zone),
  INDEX idx_verifie  (verifie),
  INDEX idx_user     (utilisateur_id),
  INDEX idx_created  (created_at),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
  FOREIGN KEY (verified_by)    REFERENCES utilisateurs(id) ON DELETE SET NULL
);
```

---

### Table `alertes` — Alertes de variation de prix

```sql
CREATE TABLE IF NOT EXISTS alertes (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  type       ENUM('hausse', 'baisse', 'nouveau') NOT NULL,
  produit    VARCHAR(150) NOT NULL,
  zone       VARCHAR(100) NOT NULL,
  message    TEXT         NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_type    (type),
  INDEX idx_created (created_at)
);
```

---

### Table `alertes_lues` — Suivi des alertes lues par utilisateur

```sql
CREATE TABLE IF NOT EXISTS alertes_lues (
  utilisateur_id INT NOT NULL,
  alerte_id      INT NOT NULL,
  lu_at          DATETIME DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (utilisateur_id, alerte_id),
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (alerte_id)      REFERENCES alertes(id) ON DELETE CASCADE
);
```

---

## ✅ ÉTAPE 4 — Vérification des tables créées

```sql
SHOW TABLES;
```

Résultat attendu (12 tables) :
```
alertes
alertes_lues
historique_carburant
historique_logement
historique_prix
prix_carburant
prix_logement
prix_par_zone
prix_transport
produits_alimentaires
signalements
utilisateurs
zones
```

---

## 🌱 ÉTAPE 5 — Remplissage des données (Seed)

Une fois la base créée, depuis le dossier `prixsen-backend/` :

```bash
npm run seed
```

Cela insère automatiquement :
- ✅ 10 zones géographiques du Sénégal
- ✅ 3 comptes utilisateurs test (Citoyen / Modérateur / Admin)
- ✅ 15 produits alimentaires avec prix par zone et historique 6 mois
- ✅ 15 lignes de transport (taxi, bus, interurbain, TER)
- ✅ 4 types de carburant avec historique
- ✅ 18 données de logement par zone et type
- ✅ 8 alertes initiales

---

## 👤 COMPTES TEST CRÉÉS PAR LE SEED

| Rôle        | Email             | Mot de passe |
|-------------|-------------------|-------------|
| Citoyen     | user@test.com     | 123456      |
| Modérateur  | mod@test.com      | 123456      |
| Admin       | admin@test.com    | 123456      |

---

## 🔌 CONFIGURATION DE CONNEXION

Fichier `.env` dans `prixsen-backend/` :

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=prixsen_db
```

---

## 📊 SCHÉMA DES RELATIONS

```
zones (id PK)
  └── prix_par_zone.zone_id (FK)
  └── prix_logement.zone_id (FK)

produits_alimentaires (id PK)
  └── prix_par_zone.produit_id (FK)
  └── historique_prix.produit_id (FK)

prix_carburant (id PK)
  └── historique_carburant.carburant_id (FK)

prix_logement (id PK)
  └── historique_logement.logement_id (FK)

utilisateurs (id PK)
  └── signalements.utilisateur_id (FK)
  └── signalements.verified_by (FK)
  └── alertes_lues.utilisateur_id (FK)

alertes (id PK)
  └── alertes_lues.alerte_id (FK)
```

---

## 🛠️ COMMANDES UTILES

```sql
-- Voir tous les utilisateurs
SELECT id, nom, email, role, zone, banned FROM utilisateurs;

-- Voir les signalements récents
SELECT * FROM signalements ORDER BY created_at DESC LIMIT 10;

-- Voir les alertes
SELECT * FROM alertes ORDER BY created_at DESC;

-- Réinitialiser un mot de passe (remplacer HASH par bcrypt hash)
UPDATE utilisateurs SET password_hash = 'HASH' WHERE email = 'user@test.com';

-- Promouvoir un utilisateur en admin
UPDATE utilisateurs SET role = 'admin' WHERE email = 'email@example.com';

-- Supprimer toutes les données et recommencer
DROP DATABASE prixsen_db;
CREATE DATABASE prixsen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---



---

## 🔄 MIGRATION — Hash des refresh tokens (sécurité)

Si votre base existe déjà depuis une version précédente où les refresh tokens étaient stockés en clair, exécutez :

```sql
-- Invalider tous les refresh tokens existants (les utilisateurs devront se reconnecter)
UPDATE utilisateurs SET refresh_token = NULL;
```

Cette opération est sans danger : les utilisateurs sont simplement redirigés vers la page de connexion.

---

*Document généré pour le projet PRIXSEN — Plateforme Nationale de Suivi du Coût de la Vie au Sénégal 🇸🇳*
