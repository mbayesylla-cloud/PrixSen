import { Router } from 'express';
import { login, register, loginGoogle, refreshToken, logout } from '../controllers/authController';
import { getProduits, getProduitById } from '../controllers/alimentationController';
import { getTransport, getCarburant, getLogement } from '../controllers/prixController';
import { getSignalements, createSignalement, verifySignalement, deleteSignalement } from '../controllers/signalementsController';
import { getAlertes, markAlertRead, markAllAlertsRead, createAlerte } from '../controllers/alertesController';
import { getProfil, updateProfil, changePassword, getAllUsers, toggleBanUser, changeUserRole, getDashboard, getZones } from '../controllers/usersController';
import { authenticate, requireRole } from '../middlewares/auth';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Multer config pour photos signalements
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté'));
    }
  },
});

// ====== AUTH ======
router.post('/auth/login', login);
router.post('/auth/register', register);
router.post('/auth/google', loginGoogle);
router.post('/auth/refresh', refreshToken);
router.post('/auth/logout', logout);

// ====== ZONES ======
router.get('/zones', getZones);

// ====== ALIMENTATION ======
router.get('/alimentation', getProduits);
router.get('/alimentation/:id', getProduitById);

// ====== TRANSPORT ======
router.get('/transport', getTransport);

// ====== CARBURANT ======
router.get('/carburant', getCarburant);

// ====== LOGEMENT ======
router.get('/logement', getLogement);

// ====== SIGNALEMENTS ======
router.get('/signalements', authenticate, getSignalements);
router.post('/signalements', authenticate, upload.single('photo'), createSignalement);
router.put('/signalements/:id/verify', authenticate, requireRole('moderator', 'admin'), verifySignalement);
router.delete('/signalements/:id', authenticate, deleteSignalement);

// ====== ALERTES ======
router.get('/alertes', authenticate, getAlertes);
router.post('/alertes/:id/read', authenticate, markAlertRead);
router.post('/alertes/read-all', authenticate, markAllAlertsRead);
router.post('/alertes', authenticate, requireRole('moderator', 'admin'), createAlerte);

// ====== PROFIL ======
router.get('/profil', authenticate, getProfil);
router.put('/profil', authenticate, updateProfil);
router.put('/profil/password', authenticate, changePassword);

// ====== DASHBOARD ======
router.get('/dashboard', authenticate, getDashboard);

// ====== ADMIN ======
router.get('/admin/users', authenticate, requireRole('admin'), getAllUsers);
router.put('/admin/users/:email/ban', authenticate, requireRole('admin'), toggleBanUser);
router.put('/admin/users/:email/role', authenticate, requireRole('admin'), changeUserRole);

export default router;
