import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import routes from './routes/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ====== SÉCURITÉ ======
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // pour les images uploads
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Trop de requêtes, réessayez plus tard' },
});

// Rate limiting strict pour auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Trop de tentatives de connexion' },
});

app.use(limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ====== PARSERS ======
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ====== STATIC FILES (uploads) ======
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ====== ROUTES API ======
app.use('/api', routes);

// ====== HEALTH CHECK ======
app.get('/health', (_req, res) => {
  res.json({ 
    success: true, 
    message: 'PRIXSEN API opérationnelle 🇸🇳',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ====== 404 ======
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' });
});

// ====== ERROR HANDLER ======
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
});

// ====== DÉMARRAGE ======
async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 PRIXSEN Backend démarré sur http://localhost:${PORT}`);
    console.log(`📡 API disponible sur http://localhost:${PORT}/api`);
    console.log(`🌍 Frontend autorisé: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });
}

startServer();

export default app;
