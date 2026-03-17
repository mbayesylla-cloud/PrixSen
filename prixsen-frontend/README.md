 PRIXSEN — Plateforme Nationale de Suivi du Coût de la Vie

Application complète (Frontend + Backend + Base de données) pour le suivi des prix au Sénégal.

 🏗 Architecture

- Frontend : React, Vite, Tailwind CSS, Zustand (/src)
- Backend : Node.js, Express, TypeScript, Prisma (/backend)
- Base de données : PostgreSQL (via Docker)

 🚀 Démarrage Rapide

 Option A — Tout en Docker (recommandé)

Une seule commande pour démarrer Base de données, Backend et Frontend :

bash
docker-compose up -d


- PostgreSQL → http://localhost:5432
- Backend API → http://localhost:3000
- Frontend UI → http://localhost:5173
- pgAdmin (GUI DB) → http://localhost:5050 (admin@prixsen.com / admin)

Pour arrêter :
bash
docker-compose down


 Option B — Démarrage manuel (Dev local)

1) Base de données (Docker):
bash
docker-compose up -d postgres pgadmin


2) Backend :
bash
cd backend
npm install
npx prisma generate
npx prisma db push
 (Optionnel) seed de test
 npx ts-node prisma/seed.ts
npm run dev


3) Frontend :
bash
npm install
npm run dev


- Backend: http://localhost:3000
- Frontend: http://localhost:5173

 🔐 Comptes d’administration

Les comptes de test ont été retirés. Créez votre superadmin via l’endpoint sécurisé (protégé par BOOTSTRAP_TOKEN):


curl -X POST http://localhost:3000/api/v1/auth/bootstrap-admin \
  -H "Authorization: Bearer <BOOTSTRAP_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Super Admin","email":"super@prixsen.sn","password":"ChangeMe123"}'

 🛠 Commandes Utiles

- Voir la DB (Prisma Studio) : cd backend && npx prisma studio
- Arrêter la DB : docker-compose down
- Logs Backend : cd backend && npm run dev
