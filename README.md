 PRIXSEN — Plateforme Nationale de Suivi du Coût de la Vie

Application complète (Frontend + Backend + Base de données) pour le suivi des prix au Sénégal.

 🏗 Architecture

- Frontend : React, Vite, Tailwind CSS, Zustand (/src)
- Backend : Node.js, Express, TypeScript, Prisma (/backend)
- Base de données : MySQL


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
