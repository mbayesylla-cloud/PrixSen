import { create } from 'zustand';
import {
  authAPI, alertesAPI, signalementsAPI, profilAPI, adminAPI,
} from '../services/api';

export interface Utilisateur {
  id?: number;
  nom: string;
  email: string;
  role: 'user' | 'moderator' | 'admin';
  zone: string;
  avatar: string;
  signalements: number;
  banned?: boolean;
}

export interface Alerte {
  id: string;
  type: 'hausse' | 'baisse' | 'nouveau';
  produit: string;
  zone: string;
  message: string;
  date: string;
  lue: boolean;
}

export interface Signalement {
  id: string;
  produit: string;
  prix: number;
  zone: string;
  date: string;
  utilisateur: string;
  utilisateur_id?: number;
  verifie: boolean;
  photo: boolean;
  photoUrl?: string;
}

interface AppSettings {
  notifications: boolean;
  alerteHausse: boolean;
  alerteBaisse: boolean;
  alerteNouveau: boolean;
  language: 'fr' | 'wo' | 'en';
}

interface AppState {
  user: Utilisateur | null;
  isLoading: boolean;
  isHydrating: boolean;          // true pendant la réhydratation initiale
  apiError: string | null;
  currentPage: string;
  alertes: Alerte[];
  signalements: Signalement[];
  allUsers: Utilisateur[];
  selectedZone: string;
  darkMode: boolean;
  settings: AppSettings;

  // Auth
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  register: (payload: { nom: string; email: string; password: string; zone: string }) => Promise<boolean>;
  logout: () => Promise<void>;

  // Navigation
  setPage: (page: string) => void;
  setSelectedZone: (zone: string) => void;

  // Alertes
  loadAlertes: () => Promise<void>;
  markAlertRead: (id: string) => Promise<void>;
  markAllAlertsRead: () => Promise<void>;

  // Signalements
  loadSignalements: (params?: { zone?: string; verifie?: boolean }) => Promise<void>;
  addSignalement: (sig: { produit: string; prix: number; zone: string; categorie?: string; photo?: File; photoUrl?: string }) => Promise<boolean>;
  verifySignalement: (id: string) => Promise<void>;
  deleteSignalement: (id: string) => Promise<void>;

  // UI
  toggleDarkMode: () => void;
  updateSettings: (partial: Partial<AppSettings>) => void;

  // Profil
  updateUserZone: (zone: string) => Promise<void>;

  // Admin
  loadAllUsers: () => Promise<void>;
  toggleUserBan: (email: string) => Promise<void>;
  changeUserRole: (email: string, role: 'user' | 'moderator' | 'admin') => Promise<void>;
}

export function mapUser(u: any): Utilisateur {
  return {
    id: u.id,
    nom: u.nom,
    email: u.email,
    role: u.role,
    zone: u.zone,
    avatar: u.avatar || '👤',
    signalements: u.signalements_count ?? u.signalements ?? 0,
    banned: !!u.banned,
  };
}

export function mapAlerte(a: any): Alerte {
  return {
    id: String(a.id),
    type: a.type,
    produit: a.produit,
    zone: a.zone,
    message: a.message,
    date: a.created_at ? a.created_at.split('T')[0] : (a.date || ''),
    lue: !!a.lue,
  };
}

export function mapSignalement(s: any): Signalement {
  return {
    id: String(s.id),
    produit: s.produit,
    prix: s.prix,
    zone: s.zone,
    date: s.created_at ? s.created_at.split('T')[0] : (s.date || ''),
    utilisateur: s.utilisateur_nom || s.utilisateur || 'Anonyme',
    utilisateur_id: s.utilisateur_id,
    verifie: !!s.verifie,
    photo: !!s.photo_url,
    photoUrl: s.photo_url || undefined,
  };
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: false,
  isHydrating: true,   // démarre à true, devient false après hydrate()
  apiError: null,
  currentPage: 'accueil',
  alertes: [],
  signalements: [],
  allUsers: [],
  selectedZone: 'dakar',
  darkMode: localStorage.getItem('prixsen_darkmode') === 'true',
  settings: {
    notifications: true,
    alerteHausse: true,
    alerteBaisse: true,
    alerteNouveau: true,
    language: 'fr',
  },

  // ─── HYDRATATION AU DÉMARRAGE ──────────────────────────────────────
  // Lit les tokens en localStorage, appelle /profil pour valider la session
  // et rehydrate le store sans redemander les credentials.
  hydrate: async () => {
    const token = localStorage.getItem('prixsen_access_token');
    if (!token) {
      set({ isHydrating: false });
      return;
    }
    try {
      const data = await profilAPI.get();
      if (data.success) {
        const user = mapUser(data.data);
        set({
          user,
          isHydrating: false,
          currentPage: 'dashboard',
          selectedZone: user.zone?.toLowerCase() || 'dakar',
        });
        // Charger les alertes en arrière-plan sans bloquer le rendu
        alertesAPI.getAll().then(d => {
          if (d.success) set({ alertes: d.data.map(mapAlerte) });
        }).catch(() => {});
      } else {
        // Token invalide — nettoyer
        localStorage.removeItem('prixsen_access_token');
        localStorage.removeItem('prixsen_refresh_token');
        set({ isHydrating: false });
      }
    } catch {
      // Réseau down — token peut-être valide, mais on ne peut pas vérifier
      localStorage.removeItem('prixsen_access_token');
      localStorage.removeItem('prixsen_refresh_token');
      set({ isHydrating: false });
    }
  },

  // ─── AUTH ──────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true, apiError: null });
    try {
      const data = await authAPI.login(email, password);
      if (data.success) {
        const user = mapUser(data.data.user);
        set({
          user,
          currentPage: 'dashboard',
          isLoading: false,
          selectedZone: user.zone?.toLowerCase() || 'dakar',
        });
        return true;
      }
      set({ apiError: data.message || 'Identifiants incorrects', isLoading: false });
      return false;
    } catch {
      set({ apiError: 'Impossible de contacter le serveur', isLoading: false });
      return false;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, apiError: null });
    try {
      const data = await authAPI.register(payload);
      if (data.success) {
        const user = mapUser(data.data.user);
        set({
          user,
          currentPage: 'dashboard',
          isLoading: false,
          selectedZone: user.zone?.toLowerCase() || 'dakar',
        });
        return true;
      }
      set({ apiError: data.message || "Erreur lors de l'inscription", isLoading: false });
      return false;
    } catch {
      set({ apiError: 'Impossible de contacter le serveur', isLoading: false });
      return false;
    }
  },

  loginWithGoogle: async (credential) => {
    set({ isLoading: true, apiError: null });
    try {
      const data = await authAPI.loginGoogle(credential);
      if (data.success) {
        const user = mapUser(data.data.user);
        set({
          user,
          currentPage: 'dashboard',
          isLoading: false,
          selectedZone: user.zone?.toLowerCase() || 'dakar',
        });
        return true;
      }
      set({ apiError: data.message || 'Erreur Google', isLoading: false });
      return false;
    } catch {
      set({ apiError: 'Erreur Google OAuth', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await authAPI.logout();
    set({
      user: null,
      currentPage: 'accueil',
      alertes: [],
      signalements: [],
      allUsers: [],
    });
  },

  // ─── NAVIGATION ────────────────────────────────────────────────────
  setPage: (page) => set({ currentPage: page }),
  setSelectedZone: (zone) => set({ selectedZone: zone }),

  // ─── ALERTES ───────────────────────────────────────────────────────
  loadAlertes: async () => {
    try {
      const data = await alertesAPI.getAll();
      if (data.success) set({ alertes: data.data.map(mapAlerte) });
    } catch {}
  },

  markAlertRead: async (id) => {
    await alertesAPI.markRead(id);
    set({ alertes: get().alertes.map(a => a.id === id ? { ...a, lue: true } : a) });
  },

  markAllAlertsRead: async () => {
    await alertesAPI.markAllRead();
    set({ alertes: get().alertes.map(a => ({ ...a, lue: true })) });
  },

  // ─── SIGNALEMENTS ──────────────────────────────────────────────────
  loadSignalements: async (params) => {
    try {
      const data = await signalementsAPI.getAll(params);
      if (data.success) set({ signalements: data.data.map(mapSignalement) });
    } catch {}
  },

  addSignalement: async (sig) => {
    try {
      const data = await signalementsAPI.create({
        produit: sig.produit,
        prix: sig.prix,
        zone: sig.zone,
        categorie: sig.categorie,
        photo: sig.photo,
      });
      if (data.success) {
        const newSig = mapSignalement(data.data);
        // Ajouter le nom de l'utilisateur courant
        const user = get().user;
        if (user) newSig.utilisateur = user.nom;
        set({ signalements: [newSig, ...get().signalements] });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  verifySignalement: async (id) => {
    await signalementsAPI.verify(id);
    set({ signalements: get().signalements.map(s => s.id === id ? { ...s, verifie: true } : s) });
  },

  deleteSignalement: async (id) => {
    await signalementsAPI.delete(id);
    set({ signalements: get().signalements.filter(s => s.id !== id) });
  },

  // ─── UI ────────────────────────────────────────────────────────────
  toggleDarkMode: () => {
    const next = !get().darkMode;
    localStorage.setItem('prixsen_darkmode', String(next));
    set({ darkMode: next });
  },
  updateSettings: (partial) => set({ settings: { ...get().settings, ...partial } }),

  // ─── PROFIL ────────────────────────────────────────────────────────
  updateUserZone: async (zone) => {
    await profilAPI.update({ zone });
    const user = get().user;
    if (user) set({ user: { ...user, zone }, selectedZone: zone.toLowerCase() });
  },

  // ─── ADMIN ─────────────────────────────────────────────────────────
  loadAllUsers: async () => {
    try {
      const data = await adminAPI.getUsers();
      if (data.success) set({ allUsers: data.data.map(mapUser) });
    } catch {}
  },

  toggleUserBan: async (email) => {
    await adminAPI.toggleBan(email);
    set({ allUsers: get().allUsers.map(u => u.email === email ? { ...u, banned: !u.banned } : u) });
  },

  changeUserRole: async (email, role) => {
    await adminAPI.changeRole(email, role);
    set({ allUsers: get().allUsers.map(u => u.email === email ? { ...u, role } : u) });
  },
}));
